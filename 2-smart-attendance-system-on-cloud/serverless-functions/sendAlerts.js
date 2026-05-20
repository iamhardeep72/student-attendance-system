export async function handler(request, database, messaging) {
  const { sessionId } = await request.json();

  if (!sessionId) {
    return json({ error: "sessionId is required" }, 400);
  }

  const absentees = await database.attendanceRecords.query({ sessionId, status: "Absent" });
  const results = [];

  for (const record of absentees) {
    const student = await database.students.get(record.studentId);
    const message = `${student.name} was marked absent for today's class.`;
    results.push(await messaging.sendEmail(student.guardianEmail, "Attendance Alert", message));
    results.push(await messaging.sendSms(student.guardianPhone, message));
  }

  return json({ ok: true, sent: results.length, results });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

