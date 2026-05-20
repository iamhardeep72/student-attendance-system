# Expense Tracker API - Node.js Project

A simple dependency-free Node.js backend project for tracking personal expenses. It uses the built-in `http` module and stores data in a local JSON file.

## Features

- Add income or expense transactions
- View all transactions
- Filter by type or category
- Update a transaction
- Delete a transaction
- Get total income, total expense, and balance
- Local JSON database

## Requirements

- Node.js 18 or newer

## Start Project

```powershell
cd expense-tracker-nodejs
node server.js
```

Open:

```text
http://localhost:4000
```

## API Endpoints

### Home

```http
GET /
```

### List Transactions

```http
GET /transactions
GET /transactions?type=expense
GET /transactions?category=food
```

### Add Transaction

```http
POST /transactions
```

Body:

```json
{
  "title": "Lunch",
  "amount": 180,
  "type": "expense",
  "category": "food"
}
```

### Update Transaction

```http
PUT /transactions/TRANSACTION_ID
```

Body:

```json
{
  "title": "Dinner",
  "amount": 250,
  "category": "food"
}
```

### Delete Transaction

```http
DELETE /transactions/TRANSACTION_ID
```

### Summary

```http
GET /summary
```

## Example PowerShell Request

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:4000/transactions" -ContentType "application/json" -Body '{"title":"Salary","amount":25000,"type":"income","category":"job"}'
```

## Project Structure

```text
expense-tracker-nodejs/
├── data/
│   └── transactions.json
├── server.js
└── README.md
```

