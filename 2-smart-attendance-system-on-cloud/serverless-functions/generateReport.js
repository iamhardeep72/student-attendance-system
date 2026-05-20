export async function handler(request, database) {
  const url = new URL(request.url);
  const className = url.searchParams.get("className");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!className || !from || !to) {
    return json({ error: "className, from, and to query parameters are required" }, 400);
  }

  const records = await database.attendanceRecords.query({ className, from, to });
  const totals = records.reduce(
    (summary, record) => {
      summary[record.status] = (summary[record.status] || 0) + 1;
      return summary;
    },
    { Present: 0, Late: 0, Absent: 0, Excused: 0 }
  );

  return json({ className, from, to, totals, records });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

