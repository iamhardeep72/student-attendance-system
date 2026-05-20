export async function handler(request, database) {
  const { sessionId, studentId, method, qrToken } = await request.json();

  if (!sessionId || !studentId || !method) {
    return json({ error: "sessionId, studentId, and method are required" }, 400);
  }

  const session = await database.sessions.get(sessionId);
  if (!session || Date.now() > new Date(session.expiresAt).getTime()) {
    return json({ error: "Attendance session is invalid or expired" }, 403);
  }

  if (method === "QR" && !qrToken) {
    return json({ error: "QR token is required" }, 403);
  }

  const record = {
    sessionId,
    studentId,
    status: "Present",
    method,
    markedAt: new Date().toISOString()
  };

  await database.attendanceRecords.upsert(`${sessionId}_${studentId}`, record);
  return json({ ok: true, record });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

