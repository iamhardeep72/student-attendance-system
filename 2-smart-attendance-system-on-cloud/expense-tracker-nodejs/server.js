const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const port = process.env.PORT || 4000;
const dataFile = path.join(__dirname, "data", "transactions.json");

const routes = {
  home: "/",
  transactions: "/transactions",
  summary: "/summary"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === routes.home) {
      return sendJson(res, 200, {
        name: "Expense Tracker API",
        status: "running",
        endpoints: ["/transactions", "/summary"]
      });
    }

    if (req.method === "GET" && url.pathname === routes.transactions) {
      return listTransactions(req, res, url);
    }

    if (req.method === "POST" && url.pathname === routes.transactions) {
      return createTransaction(req, res);
    }

    if (req.method === "GET" && url.pathname === routes.summary) {
      return getSummary(res);
    }

    const transactionMatch = url.pathname.match(/^\/transactions\/([a-zA-Z0-9-]+)$/);

    if (transactionMatch && req.method === "PUT") {
      return updateTransaction(req, res, transactionMatch[1]);
    }

    if (transactionMatch && req.method === "DELETE") {
      return deleteTransaction(res, transactionMatch[1]);
    }

    sendJson(res, 404, { error: "Route not found" });
  } catch (error) {
    sendJson(res, 500, { error: "Internal server error", details: error.message });
  }
});

server.listen(port, () => {
  console.log(`Expense Tracker API running at http://localhost:${port}`);
});

async function listTransactions(_req, res, url) {
  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category");
  let transactions = await readTransactions();

  if (type) {
    transactions = transactions.filter((item) => item.type === type);
  }

  if (category) {
    transactions = transactions.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  sendJson(res, 200, { count: transactions.length, transactions });
}

async function createTransaction(req, res) {
  const body = await readBody(req);
  const validationError = validateTransaction(body);

  if (validationError) {
    return sendJson(res, 400, { error: validationError });
  }

  const transactions = await readTransactions();
  const transaction = {
    id: crypto.randomUUID(),
    title: body.title.trim(),
    amount: Number(body.amount),
    type: body.type,
    category: body.category.trim(),
    createdAt: new Date().toISOString()
  };

  transactions.push(transaction);
  await writeTransactions(transactions);

  sendJson(res, 201, { message: "Transaction added", transaction });
}

async function updateTransaction(req, res, id) {
  const body = await readBody(req);
  const transactions = await readTransactions();
  const index = transactions.findIndex((item) => item.id === id);

  if (index === -1) {
    return sendJson(res, 404, { error: "Transaction not found" });
  }

  const updated = {
    ...transactions[index],
    ...pickAllowedFields(body),
    updatedAt: new Date().toISOString()
  };

  const validationError = validateTransaction(updated);
  if (validationError) {
    return sendJson(res, 400, { error: validationError });
  }

  transactions[index] = updated;
  await writeTransactions(transactions);

  sendJson(res, 200, { message: "Transaction updated", transaction: updated });
}

async function deleteTransaction(res, id) {
  const transactions = await readTransactions();
  const remaining = transactions.filter((item) => item.id !== id);

  if (remaining.length === transactions.length) {
    return sendJson(res, 404, { error: "Transaction not found" });
  }

  await writeTransactions(remaining);
  sendJson(res, 200, { message: "Transaction deleted" });
}

async function getSummary(res) {
  const transactions = await readTransactions();
  const summary = transactions.reduce(
    (totals, item) => {
      if (item.type === "income") totals.income += item.amount;
      if (item.type === "expense") totals.expense += item.amount;
      totals.balance = totals.income - totals.expense;
      return totals;
    },
    { income: 0, expense: 0, balance: 0 }
  );

  sendJson(res, 200, {
    ...summary,
    totalTransactions: transactions.length
  });
}

function validateTransaction(transaction) {
  if (!transaction.title || typeof transaction.title !== "string") return "Title is required";
  if (!Number.isFinite(Number(transaction.amount)) || Number(transaction.amount) <= 0) return "Amount must be greater than zero";
  if (!["income", "expense"].includes(transaction.type)) return "Type must be income or expense";
  if (!transaction.category || typeof transaction.category !== "string") return "Category is required";
  return null;
}

function pickAllowedFields(body) {
  const allowed = {};
  for (const field of ["title", "amount", "type", "category"]) {
    if (body[field] !== undefined) {
      allowed[field] = field === "amount" ? Number(body[field]) : body[field];
    }
  }
  return allowed;
}

async function readBody(req) {
  let raw = "";

  for await (const chunk of req) {
    raw += chunk;
  }

  if (!raw) return {};
  return JSON.parse(raw);
}

async function readTransactions() {
  await ensureDataFile();
  const data = await fs.readFile(dataFile, "utf8");
  return JSON.parse(data);
}

async function writeTransactions(transactions) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(transactions, null, 2));
}

async function ensureDataFile() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]");
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(data, null, 2));
}

