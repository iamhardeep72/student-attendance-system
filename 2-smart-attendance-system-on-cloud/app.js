const storageKey = "smart-attendance-demo";

const seedStudents = [
  { roll: "CSE-001", name: "Aarav Mehta", className: "CSE A", status: "Present", method: "QR", lastCheckIn: "09:02 AM" },
  { roll: "CSE-007", name: "Diya Sharma", className: "CSE A", status: "Late", method: "Face", lastCheckIn: "09:18 AM" },
  { roll: "CSE-014", name: "Kabir Rao", className: "CSE A", status: "Absent", method: "-", lastCheckIn: "-" },
  { roll: "CSE-018", name: "Meera Nair", className: "CSE A", status: "Present", method: "QR", lastCheckIn: "08:58 AM" },
  { roll: "CSE-022", name: "Rohan Das", className: "CSE A", status: "Absent", method: "-", lastCheckIn: "-" },
  { roll: "CSE-031", name: "Sara Khan", className: "CSE A", status: "Excused", method: "Admin", lastCheckIn: "Medical note" },
  { roll: "CSE-044", name: "Vikram Iyer", className: "CSE A", status: "Present", method: "Face", lastCheckIn: "09:01 AM" },
  { roll: "CSE-052", name: "Nisha Patel", className: "CSE A", status: "Absent", method: "-", lastCheckIn: "-" }
];

const defaultState = {
  sessionCode: "CS-4829",
  students: seedStudents,
  activity: [
    "Aarav Mehta marked present via QR.",
    "Diya Sharma verified with face recognition.",
    "Daily attendance session started."
  ]
};

let state = loadState();

const views = {
  dashboard: "Admin Dashboard",
  students: "Student Tracking",
  checkin: "QR / Face Check-in",
  reports: "Reports",
  cloud: "Cloud Design"
};

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.getElementById("newSessionButton").addEventListener("click", createSession);
document.getElementById("refreshQrButton").addEventListener("click", createSession);
document.getElementById("clearActivityButton").addEventListener("click", () => {
  state.activity = [];
  saveAndRender();
});
document.getElementById("studentSearch").addEventListener("input", renderStudents);
document.getElementById("statusFilter").addEventListener("change", renderStudents);
document.getElementById("qrCheckInButton").addEventListener("click", () => markByInput("rollInput", "QR"));
document.getElementById("faceCheckInButton").addEventListener("click", () => markByInput("faceRollInput", "Face"));
document.getElementById("downloadReportButton").addEventListener("click", downloadReport);
document.getElementById("sendAlertsButton").addEventListener("click", sendAlerts);
document.getElementById("signInButton").addEventListener("click", authenticate);

render();

function loadState() {
  const stored = localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) : structuredClone(defaultState);
}

function saveAndRender() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  render();
}

function switchView(viewName) {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.remove("active"));
  document.getElementById(viewName).classList.add("active");
  document.querySelector(`[data-view="${viewName}"]`).classList.add("active");
  document.getElementById("pageTitle").textContent = views[viewName];
  if (viewName === "reports") renderReports();
}

function createSession() {
  const code = `CS-${Math.floor(1000 + Math.random() * 9000)}`;
  state.sessionCode = code;
  state.activity.unshift(`New secure QR session generated: ${code}.`);
  saveAndRender();
}

function markByInput(inputId, method) {
  const input = document.getElementById(inputId);
  const roll = input.value.trim().toUpperCase();
  if (!roll) return;
  const student = state.students.find((entry) => entry.roll === roll);
  if (!student) {
    state.activity.unshift(`Unknown roll number attempted ${method} check-in: ${roll}.`);
    saveAndRender();
    return;
  }
  markAttendance(student.roll, "Present", method);
  input.value = "";
}

function markAttendance(roll, status, method = "Admin") {
  const student = state.students.find((entry) => entry.roll === roll);
  if (!student) return;
  student.status = status;
  student.method = method;
  student.lastCheckIn = status === "Absent" ? "-" : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  state.activity.unshift(`${student.name} marked ${status.toLowerCase()} via ${method}.`);
  state.activity = state.activity.slice(0, 8);
  saveAndRender();
}

function render() {
  document.getElementById("sessionCode").textContent = state.sessionCode;
  renderMetrics();
  renderChart();
  renderStudents();
  renderActivity();
  renderQr();
  renderReports();
}

function renderMetrics() {
  const total = state.students.length;
  const present = countStatus("Present");
  const late = countStatus("Late");
  const rate = Math.round(((present + late) / total) * 100);
  document.getElementById("totalStudents").textContent = total;
  document.getElementById("presentToday").textContent = present;
  document.getElementById("lateToday").textContent = late;
  document.getElementById("attendanceRate").textContent = `${rate}%`;
}

function renderChart() {
  const statuses = ["Present", "Late", "Absent", "Excused"];
  const total = state.students.length;
  document.getElementById("attendanceChart").innerHTML = statuses
    .map((status) => {
      const count = countStatus(status);
      const width = Math.round((count / total) * 100);
      return `
        <div class="bar-row">
          <span>${status}</span>
          <div class="bar-track"><div class="bar-fill ${status.toLowerCase()}" style="width: ${width}%"></div></div>
          <strong>${count}</strong>
        </div>
      `;
    })
    .join("");
}

function renderStudents() {
  const search = document.getElementById("studentSearch")?.value.toLowerCase() || "";
  const filter = document.getElementById("statusFilter")?.value || "all";
  const rows = state.students
    .filter((student) => {
      const matchesSearch = `${student.roll} ${student.name} ${student.className}`.toLowerCase().includes(search);
      const matchesStatus = filter === "all" || student.status === filter;
      return matchesSearch && matchesStatus;
    })
    .map((student) => `
      <tr>
        <td>${student.roll}</td>
        <td>${student.name}</td>
        <td>${student.className}</td>
        <td><span class="status ${student.status}">${student.status}</span></td>
        <td>${student.method}</td>
        <td>${student.lastCheckIn}</td>
        <td>
          <select onchange="markAttendance('${student.roll}', this.value)">
            <option ${student.status === "Present" ? "selected" : ""}>Present</option>
            <option ${student.status === "Late" ? "selected" : ""}>Late</option>
            <option ${student.status === "Absent" ? "selected" : ""}>Absent</option>
            <option ${student.status === "Excused" ? "selected" : ""}>Excused</option>
          </select>
        </td>
      </tr>
    `)
    .join("");
  document.getElementById("studentTable").innerHTML = rows;
}

function renderActivity() {
  const content = state.activity.length
    ? state.activity.map((item) => `<li>${item}</li>`).join("")
    : "<li>No recent activity.</li>";
  document.getElementById("activityList").innerHTML = content;
}

function renderQr() {
  document.getElementById("qrCard").textContent = state.sessionCode;
}

function renderReports() {
  const present = countStatus("Present");
  const late = countStatus("Late");
  const absent = countStatus("Absent");
  document.getElementById("reportSummary").innerHTML = `
    <article class="report-card"><strong>${present + late}</strong><span> attended students</span></article>
    <article class="report-card"><strong>${absent}</strong><span> alerts pending</span></article>
    <article class="report-card"><strong>${state.sessionCode}</strong><span> active session</span></article>
  `;
}

function sendAlerts() {
  const absentNames = state.students.filter((student) => student.status === "Absent").map((student) => student.name);
  const message = absentNames.length
    ? `SMS/email alerts queued for: ${absentNames.join(", ")}.`
    : "No absence alerts needed today.";
  state.activity.unshift(message);
  saveAndRender();
}

function authenticate() {
  const email = document.getElementById("email").value.trim();
  document.getElementById("authStatus").textContent = `Authenticated as ${email || "guest"} with demo token`;
  state.activity.unshift(`${email || "Guest"} authenticated through mock cloud auth.`);
  saveAndRender();
}

function downloadReport() {
  const header = ["Roll No", "Name", "Class", "Status", "Method", "Last Check-in"];
  const body = state.students.map((student) => [
    student.roll,
    student.name,
    student.className,
    student.status,
    student.method,
    student.lastCheckIn
  ]);
  const csv = [header, ...body].map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `attendance-${state.sessionCode}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function countStatus(status) {
  return state.students.filter((student) => student.status === status).length;
}

