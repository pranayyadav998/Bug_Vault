/* ============================================================
   BUGVAULT - Main Application Script
   University Software Engineering Project
   ============================================================ */

"use strict";

// ---- Page Titles ----
const PAGE_TITLES = {
  dashboard:    "Dashboard",
  report:       "Report a Bug",
  buglist:      "Bug List",
  bugdetail:    "Bug Details",
  assign:       "Assign Bug",
  updatestatus: "Update Status",
  reports:      "Reports",
  usermgmt:     "User Management",
  settings:     "System Settings",
  auditlogs:    "Audit Logs",
};

// ---- Router ----
let currentPage = "dashboard";
let currentBugId = null;   // for detail page
let editingUserId = null;  // for user management

function navigate(page, param) {
  currentPage = page;
  currentBugId = param || null;
  renderPage();
  updateSidebarActive();
  window.scrollTo(0, 0);
}

function updateSidebarActive() {
  document.querySelectorAll("#sidebar-nav li a").forEach(a => {
    a.classList.toggle("active", a.dataset.page === currentPage);
  });
}

// ---- Status Badge Helper ----
function statusBadge(status) {
  const map = {
    "New":        "badge-new",
    "Assigned":   "badge-assigned",
    "Open":       "badge-open",
    "In Progress":"badge-progress",
    "Resolved":   "badge-resolved",
    "Verified":   "badge-verified",
    "Closed":     "badge-closed",
    "Reopened":   "badge-reopened",
  };
  return `<span class="badge ${map[status] || ''}">${status}</span>`;
}

function sevClass(sev) {
  return { Critical:"sev-critical", High:"sev-high", Medium:"sev-medium", Low:"sev-low" }[sev] || "";
}

// ---- Render App Shell ----
function renderShell() {
  const u = BV.currentUser;
  document.getElementById("root").innerHTML = `
  <div id="app-layout">
    <!-- Sidebar -->
    <nav id="sidebar">
      <div id="sidebar-logo">
        <h1>BUGVAULT</h1>
        <small>Bug Tracking System</small>
      </div>
      <ul id="sidebar-nav">
        <li><a href="#" data-page="dashboard">
          <i class="nav-icon">&#9632;</i> Dashboard
        </a></li>
        <li><a href="#" data-page="report">
          <i class="nav-icon">+</i> Report Bug
        </a></li>
        <li><a href="#" data-page="buglist">
          <i class="nav-icon">&#9776;</i> Bug List
        </a></li>
        ${u.role === "Manager" || u.role === "Administrator" ? `
        <li><a href="#" data-page="assign">
          <i class="nav-icon">&#8680;</i> Assign Bug
        </a></li>` : ""}
        ${u.role === "Developer/QA" || u.role === "Administrator" ? `
        <li><a href="#" data-page="updatestatus">
          <i class="nav-icon">&#9998;</i> Update Status
        </a></li>` : ""}
        <li><a href="#" data-page="reports">
          <i class="nav-icon">&#9636;</i> Reports
        </a></li>
        ${u.role === "Administrator" ? `
        <li class="nav-divider"></li>
        <li><a href="#" data-page="usermgmt">
          <i class="nav-icon">&#9786;</i> User Management
        </a></li>
        <li><a href="#" data-page="settings">
          <i class="nav-icon">&#9881;</i> System Settings
        </a></li>` : ""}
        <li><a href="#" data-page="auditlogs">
          <i class="nav-icon">&#9635;</i> Audit Logs
        </a></li>
        <li class="nav-divider"></li>
        <li><a href="#" id="logout-link">
          <i class="nav-icon">&#8592;</i> Logout
        </a></li>
      </ul>
      <div id="sidebar-user">
        <strong>${escHtml(u.name)}</strong>
        ${escHtml(u.role)}
      </div>
    </nav>

    <!-- Main -->
    <div id="main-area">
      <div id="topbar">
        <span class="page-title" id="topbar-title"></span>
        <div class="topbar-right">
          <span id="topbar-date"></span>
          <span>&#128276;</span>
        </div>
      </div>
      <div id="content"></div>
    </div>
  </div>`;

  // Sidebar nav clicks
  document.querySelectorAll("#sidebar-nav li a[data-page]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      navigate(a.dataset.page);
    });
  });

  // Logout
  document.getElementById("logout-link").addEventListener("click", e => {
    e.preventDefault();
    BV.currentUser = null;
    renderLogin();
  });

  // Topbar date
  document.getElementById("topbar-date").textContent = new Date().toLocaleDateString("en-GB", {
    day:"2-digit", month:"short", year:"numeric"
  });
}

// ---- Render Page ----
function renderPage() {
  const content = document.getElementById("content");
  const title = document.getElementById("topbar-title");
  if (!content || !title) return;

  title.textContent = PAGE_TITLES[currentPage] || "";

  switch (currentPage) {
    case "dashboard":    content.innerHTML = pageDashboard(); break;
    case "report":       content.innerHTML = pageReportBug(); bindReportBug(); break;
    case "buglist":      content.innerHTML = pageBugList(); bindBugList(); break;
    case "bugdetail":    content.innerHTML = pageBugDetail(currentBugId); break;
    case "assign":       content.innerHTML = pageAssignBug(); bindAssignBug(); break;
    case "updatestatus": content.innerHTML = pageUpdateStatus(); bindUpdateStatus(); break;
    case "reports":      content.innerHTML = pageReports(); break;
    case "usermgmt":     content.innerHTML = pageUserMgmt(); bindUserMgmt(); break;
    case "settings":     content.innerHTML = pageSettings(); bindSettings(); break;
    case "auditlogs":    content.innerHTML = pageAuditLogs(); break;
    default:             content.innerHTML = "<p>Page not found.</p>";
  }
  updateSidebarActive();
}

// ---- Escape HTML ----
function escHtml(s) {
  return String(s || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

// ============================================================
// PAGE: LOGIN
// ============================================================
function renderLogin() {
  document.getElementById("root").innerHTML = `
  <div id="login-page">
    <div class="login-box">
      <div class="login-header">
        <h1>BUGVAULT</h1>
        <p>Bug Tracking System &mdash; University Project</p>
      </div>
      <div class="login-error" id="login-err">Invalid username or password.</div>
      <div class="form-group">
        <label for="l-user">Username</label>
        <input type="text" id="l-user" placeholder="Enter username" autocomplete="username" />
      </div>
      <div class="form-group">
        <label for="l-pass">Password</label>
        <input type="password" id="l-pass" placeholder="Enter password" autocomplete="current-password" />
      </div>
      <div class="form-group">
        <label for="l-role">Login As</label>
        <select id="l-role">
          <option>Tester</option>
          <option>Developer/QA</option>
          <option>Manager</option>
          <option>Administrator</option>
        </select>
      </div>
      <button class="btn btn-primary" id="login-btn">Login</button>
      <p style="font-size:11px;color:#9aa3b0;margin-top:14px;text-align:center;">
        Demo credentials: alice / admin123 (Administrator) &bull; bob / mgr123 (Manager)<br>
        carol / dev123 (Developer/QA) &bull; eva / test123 (Tester)
      </p>
    </div>
  </div>`;

  document.getElementById("login-btn").addEventListener("click", doLogin);
  document.getElementById("l-pass").addEventListener("keydown", e => { if(e.key==="Enter") doLogin(); });
}

function doLogin() {
  const nameInput = document.getElementById("l-user").value.trim().toLowerCase();
  const pass = document.getElementById("l-pass").value;
  const role = document.getElementById("l-role").value;

  // Match by first name (simple demo)
  const user = BV.users.find(u =>
    (u.name.split(" ")[0].toLowerCase() === nameInput) &&
    u.password === pass &&
    u.role === role &&
    u.status === "Active"
  );

  if (!user) {
    document.getElementById("login-err").style.display = "block";
    return;
  }

  BV.currentUser = user;
  BV.addAuditLog("Logged in");
  renderShell();
  navigate("dashboard");
}

// ============================================================
// PAGE: DASHBOARD
// ============================================================
function pageDashboard() {
  const c = BV.getStatusCounts();
  const openCount = (c["New"]||0) + (c["Open"]||0) + (c["Assigned"]||0) + (c["Reopened"]||0);
  const recentBugs = [...BV.bugs].sort((a,b) => b.dateCreated.localeCompare(a.dateCreated)).slice(0, 5);

  return `
  <div class="card-row">
    <div class="summary-card">
      <div class="card-label">Total Bugs</div>
      <div class="card-value">${c.total}</div>
    </div>
    <div class="summary-card open">
      <div class="card-label">Open / New</div>
      <div class="card-value">${openCount}</div>
    </div>
    <div class="summary-card progress">
      <div class="card-label">In Progress</div>
      <div class="card-value">${c["In Progress"]||0}</div>
    </div>
    <div class="summary-card resolved">
      <div class="card-label">Resolved</div>
      <div class="card-value">${(c["Resolved"]||0) + (c["Verified"]||0)}</div>
    </div>
    <div class="summary-card closed">
      <div class="card-label">Closed</div>
      <div class="card-value">${c["Closed"]||0}</div>
    </div>
  </div>

  <!-- Bug Lifecycle -->
  <div class="section-box">
    <h3>Bug Lifecycle Workflow</h3>
    <div class="workflow-wrap">
      ${["New","Assigned","Open","In Progress","Resolved","Verified","Closed"].map((s,i,arr) =>
        `<span class="workflow-step">${s}</span>${i<arr.length-1?'<span class="workflow-arrow">&#8594;</span>':''}`
      ).join("")}
    </div>
    <div class="workflow-wrap" style="margin-top:8px;">
      <span class="workflow-step alt">Resolved</span>
      <span class="workflow-arrow">&#8594;</span>
      <span class="workflow-step alt">Reopened</span>
      <span class="workflow-arrow">&#8594;</span>
      <span class="workflow-step alt">Assigned</span>
    </div>
    <p style="font-size:12px;color:#9aa3b0;margin-top:8px;">* Reopened bugs are re-assigned to a developer for further investigation.</p>
  </div>

  <!-- Recent Bugs -->
  <div class="section-box">
    <h3>Recent Bug Reports</h3>
    <div class="table-container" style="margin-bottom:0">
      <table class="data-table">
        <thead>
          <tr>
            <th>Bug ID</th><th>Title</th><th>Severity</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${recentBugs.map(b => `
          <tr>
            <td><a href="#" class="bug-link" data-id="${escHtml(b.id)}">${escHtml(b.id)}</a></td>
            <td>${escHtml(b.title)}</td>
            <td class="${sevClass(b.severity)}">${escHtml(b.severity)}</td>
            <td>${statusBadge(b.status)}</td>
            <td>${escHtml(b.dateCreated)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Decision Table -->
  <div class="section-box">
    <h3>Severity &rarr; Priority Decision Table</h3>
    <table class="decision-table">
      <thead><tr><th>Severity</th><th>Impact</th><th>Recommended Priority</th></tr></thead>
      <tbody>
        <tr><td>Low</td><td>Low</td><td>Low</td></tr>
        <tr><td>Medium</td><td>Medium</td><td>Medium</td></tr>
        <tr><td>High</td><td>Medium</td><td>High</td></tr>
        <tr><td>Critical</td><td>High</td><td>Immediate Fix</td></tr>
      </tbody>
    </table>
  </div>`;
}

// ============================================================
// PAGE: REPORT BUG
// ============================================================
function pageReportBug() {
  return `
  <div class="form-section">
    <h3>Submit a New Bug Report</h3>
    <div id="report-alert"></div>
    <div class="form-group">
      <label for="rb-title">Bug Title *</label>
      <input type="text" id="rb-title" placeholder="Short, descriptive title" />
    </div>
    <div class="form-group">
      <label for="rb-desc">Description *</label>
      <textarea id="rb-desc" placeholder="Describe the bug in detail: steps to reproduce, expected vs actual behavior..."></textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="rb-sev">Severity *</label>
        <select id="rb-sev">
          <option value="">-- Select --</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
      </div>
      <div class="form-group">
        <label for="rb-pri">Priority *</label>
        <select id="rb-pri">
          <option value="">-- Select --</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Immediate Fix</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label for="rb-attach">Attach Screenshot / File</label>
      <input type="file" id="rb-attach" accept="image/*,.pdf,.txt,.log" />
      <small style="color:#9aa3b0;font-size:11px;">Accepted: images, PDF, TXT, LOG. Max 5 MB.</small>
    </div>
    <button class="btn btn-primary" id="rb-submit">Submit Bug Report</button>
    <button class="btn btn-secondary" style="margin-left:8px" id="rb-clear">Clear</button>
  </div>`;
}

function bindReportBug() {
  document.getElementById("rb-submit").addEventListener("click", () => {
    const title = document.getElementById("rb-title").value.trim();
    const desc  = document.getElementById("rb-desc").value.trim();
    const sev   = document.getElementById("rb-sev").value;
    const pri   = document.getElementById("rb-pri").value;
    const alert = document.getElementById("report-alert");

    if (!title || !desc || !sev || !pri) {
      alert.innerHTML = '<div class="alert alert-danger">Please fill in all required fields.</div>';
      return;
    }

    const newBug = {
      id: BV.nextBugId(),
      title, description: desc, severity: sev, priority: pri,
      status: "New", assignedTo: "",
      reportedBy: BV.currentUser.name,
      dateCreated: new Date().toISOString().slice(0, 10),
      resolutionNotes: "", attachment: null
    };

    BV.bugs.unshift(newBug);
    BV.addAuditLog(`Reported ${newBug.id}: ${title}`);

    alert.innerHTML = `<div class="alert alert-success">Bug <strong>${newBug.id}</strong> submitted successfully.</div>`;
    document.getElementById("rb-title").value = "";
    document.getElementById("rb-desc").value = "";
    document.getElementById("rb-sev").value = "";
    document.getElementById("rb-pri").value = "";
  });

  document.getElementById("rb-clear").addEventListener("click", () => {
    ["rb-title","rb-desc","rb-sev","rb-pri"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("report-alert").innerHTML = "";
  });
}

// ============================================================
// PAGE: BUG LIST
// ============================================================
function pageBugList() {
  return `
  <div class="toolbar">
    <div class="toolbar-left">
      <input type="text" class="search-input" id="bl-search" placeholder="Search bugs..." />
      <select id="bl-filter-status" style="padding:6px 10px;border:1px solid var(--border);font-size:13px;">
        <option value="">All Statuses</option>
        <option>New</option><option>Assigned</option><option>Open</option>
        <option>In Progress</option><option>Resolved</option>
        <option>Verified</option><option>Closed</option><option>Reopened</option>
      </select>
      <select id="bl-filter-sev" style="padding:6px 10px;border:1px solid var(--border);font-size:13px;">
        <option value="">All Severities</option>
        <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
      </select>
    </div>
    <div class="toolbar-right">
      <button class="btn btn-primary btn-sm" onclick="navigate('report')">+ Report Bug</button>
    </div>
  </div>
  <div class="table-container">
    <table class="data-table" id="bug-table">
      <thead>
        <tr>
          <th>Bug ID</th><th>Title</th><th>Severity</th><th>Priority</th>
          <th>Status</th><th>Assigned To</th><th>Date Created</th><th>Actions</th>
        </tr>
      </thead>
      <tbody id="bug-tbody"></tbody>
    </table>
  </div>`;
}

function bindBugList() {
  const renderRows = () => {
    const search = (document.getElementById("bl-search").value || "").toLowerCase();
    const fStatus = document.getElementById("bl-filter-status").value;
    const fSev    = document.getElementById("bl-filter-sev").value;

    const filtered = BV.bugs.filter(b =>
      (!search || b.id.toLowerCase().includes(search) || b.title.toLowerCase().includes(search) || (b.assignedTo||"").toLowerCase().includes(search)) &&
      (!fStatus || b.status === fStatus) &&
      (!fSev    || b.severity === fSev)
    );

    const tbody = document.getElementById("bug-tbody");
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding:20px;color:var(--mid-gray);">No bugs found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(b => `
    <tr>
      <td><a href="#" class="bug-link" data-id="${escHtml(b.id)}">${escHtml(b.id)}</a></td>
      <td>${escHtml(b.title)}</td>
      <td class="${sevClass(b.severity)}">${escHtml(b.severity)}</td>
      <td>${escHtml(b.priority)}</td>
      <td>${statusBadge(b.status)}</td>
      <td>${escHtml(b.assignedTo || "—")}</td>
      <td>${escHtml(b.dateCreated)}</td>
      <td>
        <a href="#" class="bug-link btn btn-secondary btn-sm" data-id="${escHtml(b.id)}">View</a>
      </td>
    </tr>`).join("");

    // Bug detail links
    tbody.querySelectorAll(".bug-link").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        navigate("bugdetail", a.dataset.id);
      });
    });
  };

  renderRows();
  document.getElementById("bl-search").addEventListener("input", renderRows);
  document.getElementById("bl-filter-status").addEventListener("change", renderRows);
  document.getElementById("bl-filter-sev").addEventListener("change", renderRows);

  // Dashboard bug links also need binding after rendering
  document.querySelectorAll(".bug-link[data-id]").forEach(a => {
    a.addEventListener("click", e => { e.preventDefault(); navigate("bugdetail", a.dataset.id); });
  });
}

// ============================================================
// PAGE: BUG DETAILS
// ============================================================
function pageBugDetail(id) {
  const bug = BV.bugs.find(b => b.id === id);
  if (!bug) return `<div class="alert alert-danger">Bug not found: ${escHtml(id)}</div>`;

  return `
  <div style="margin-bottom:12px;">
    <button class="btn btn-secondary btn-sm" onclick="navigate('buglist')">&larr; Back to Bug List</button>
  </div>
  <div class="section-box">
    <h3>${escHtml(bug.id)} &mdash; ${escHtml(bug.title)}</h3>
    <div class="detail-grid">
      <div class="detail-item">
        <label>Status</label>
        <div class="detail-value">${statusBadge(bug.status)}</div>
      </div>
      <div class="detail-item">
        <label>Severity</label>
        <div class="detail-value ${sevClass(bug.severity)}">${escHtml(bug.severity)}</div>
      </div>
      <div class="detail-item">
        <label>Priority</label>
        <div class="detail-value">${escHtml(bug.priority)}</div>
      </div>
      <div class="detail-item">
        <label>Assigned To</label>
        <div class="detail-value">${escHtml(bug.assignedTo || "Not Assigned")}</div>
      </div>
      <div class="detail-item">
        <label>Reported By</label>
        <div class="detail-value">${escHtml(bug.reportedBy)}</div>
      </div>
      <div class="detail-item">
        <label>Date Created</label>
        <div class="detail-value">${escHtml(bug.dateCreated)}</div>
      </div>
    </div>

    <div class="form-group" style="margin-bottom:12px;">
      <label style="font-size:11.5px;text-transform:uppercase;letter-spacing:.5px;color:var(--mid-gray);">Description</label>
      <div style="background:var(--off-white);border:1px solid var(--border);padding:12px;font-size:13.5px;line-height:1.6;">
        ${escHtml(bug.description)}
      </div>
    </div>

    <div class="form-group" style="margin-bottom:12px;">
      <label style="font-size:11.5px;text-transform:uppercase;letter-spacing:.5px;color:var(--mid-gray);">Resolution Notes</label>
      <div style="background:var(--off-white);border:1px solid var(--border);padding:12px;font-size:13.5px;line-height:1.6;">
        ${bug.resolutionNotes ? escHtml(bug.resolutionNotes) : '<em style="color:var(--mid-gray)">No resolution notes yet.</em>'}
      </div>
    </div>

    <div class="form-group" style="margin-bottom:0;">
      <label style="font-size:11.5px;text-transform:uppercase;letter-spacing:.5px;color:var(--mid-gray);">Attachment</label>
      <div style="font-size:13.5px;padding:8px 0;">
        ${bug.attachment ? `<a href="#">${escHtml(bug.attachment)}</a>` : '<em style="color:var(--mid-gray)">No attachment.</em>'}
      </div>
    </div>
  </div>`;
}

// ============================================================
// PAGE: ASSIGN BUG
// ============================================================
function pageAssignBug() {
  const unassigned = BV.bugs.filter(b => !["Resolved","Verified","Closed"].includes(b.status));
  const devs = BV.users.filter(u => u.role === "Developer/QA" && u.status === "Active");

  return `
  <div class="form-section">
    <h3>Assign Bug to Developer</h3>
    <div id="assign-alert"></div>
    <div class="form-group">
      <label for="as-bug">Select Bug *</label>
      <select id="as-bug">
        <option value="">-- Select Bug --</option>
        ${unassigned.map(b => `<option value="${escHtml(b.id)}">${escHtml(b.id)} – ${escHtml(b.title)}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label for="as-dev">Select Developer *</label>
      <select id="as-dev">
        <option value="">-- Select Developer --</option>
        ${devs.map(d => `<option value="${escHtml(d.name)}">${escHtml(d.name)}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label for="as-pri">Priority</label>
      <select id="as-pri">
        <option>Low</option><option selected>Medium</option>
        <option>High</option><option>Immediate Fix</option>
      </select>
    </div>
    <button class="btn btn-primary" id="as-submit">Assign Bug</button>
  </div>

  <!-- Currently Assigned Bugs -->
  <div class="section-box">
    <h3>Currently Assigned Bugs</h3>
    <div class="table-container" style="margin-bottom:0">
      <table class="data-table">
        <thead>
          <tr><th>Bug ID</th><th>Title</th><th>Assigned To</th><th>Priority</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${BV.bugs.filter(b => b.assignedTo).map(b => `
          <tr>
            <td>${escHtml(b.id)}</td>
            <td>${escHtml(b.title)}</td>
            <td>${escHtml(b.assignedTo)}</td>
            <td>${escHtml(b.priority)}</td>
            <td>${statusBadge(b.status)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </div>`;
}

function bindAssignBug() {
  document.getElementById("as-submit").addEventListener("click", () => {
    const bugId = document.getElementById("as-bug").value;
    const dev   = document.getElementById("as-dev").value;
    const pri   = document.getElementById("as-pri").value;
    const alert = document.getElementById("assign-alert");

    if (!bugId || !dev) {
      alert.innerHTML = '<div class="alert alert-danger">Please select a bug and a developer.</div>';
      return;
    }

    const bug = BV.bugs.find(b => b.id === bugId);
    bug.assignedTo = dev;
    bug.priority   = pri;
    bug.status     = "Assigned";

    BV.addAuditLog(`Assigned ${bugId} to ${dev}`);
    alert.innerHTML = `<div class="alert alert-success">Bug <strong>${bugId}</strong> assigned to ${escHtml(dev)}.</div>`;

    // Refresh selects
    navigate("assign");
  });
}

// ============================================================
// PAGE: UPDATE STATUS
// ============================================================
const STATUS_FLOW = {
  "New":        ["Assigned"],
  "Assigned":   ["Open", "In Progress"],
  "Open":       ["In Progress"],
  "In Progress":["Resolved"],
  "Resolved":   ["Verified","Reopened"],
  "Verified":   ["Closed"],
  "Closed":     [],
  "Reopened":   ["Assigned"],
};

function pageUpdateStatus() {
  // Developers see their own bugs; admins see all
  const u = BV.currentUser;
  const myBugs = (u.role === "Administrator")
    ? BV.bugs
    : BV.bugs.filter(b => b.assignedTo === u.name);

  return `
  <div class="form-section">
    <h3>Update Bug Status</h3>
    <div id="us-alert"></div>
    <div class="form-group">
      <label for="us-bug">Select Bug ID *</label>
      <select id="us-bug">
        <option value="">-- Select Bug --</option>
        ${myBugs.map(b => `<option value="${escHtml(b.id)}">${escHtml(b.id)} – ${escHtml(b.title)} [${escHtml(b.status)}]</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label for="us-status">New Status *</label>
      <select id="us-status"><option value="">-- Select Bug First --</option></select>
    </div>
    <div class="form-group">
      <label for="us-notes">Resolution Details / Notes</label>
      <textarea id="us-notes" placeholder="Describe what was done, any findings, or reason for status change..."></textarea>
    </div>
    <button class="btn btn-primary" id="us-submit">Save Changes</button>
  </div>`;
}

function bindUpdateStatus() {
  const bugSel    = document.getElementById("us-bug");
  const statusSel = document.getElementById("us-status");

  bugSel.addEventListener("change", () => {
    const bug = BV.bugs.find(b => b.id === bugSel.value);
    statusSel.innerHTML = bug
      ? (STATUS_FLOW[bug.status] || []).map(s => `<option>${s}</option>`).join("") || '<option value="">No transitions available</option>'
      : '<option value="">-- Select Bug First --</option>';
    if (bug) document.getElementById("us-notes").value = bug.resolutionNotes || "";
  });

  document.getElementById("us-submit").addEventListener("click", () => {
    const bug    = BV.bugs.find(b => b.id === bugSel.value);
    const newSt  = statusSel.value;
    const notes  = document.getElementById("us-notes").value.trim();
    const alert  = document.getElementById("us-alert");

    if (!bug || !newSt) {
      alert.innerHTML = '<div class="alert alert-danger">Please select a bug and a valid new status.</div>';
      return;
    }

    const oldStatus = bug.status;
    bug.status = newSt;
    bug.resolutionNotes = notes;

    BV.addAuditLog(`Updated ${bug.id} status: ${oldStatus} → ${newSt}`);
    alert.innerHTML = `<div class="alert alert-success">Bug <strong>${escHtml(bug.id)}</strong> updated to <strong>${escHtml(newSt)}</strong>.</div>`;

    navigate("updatestatus");
  });
}

// ============================================================
// PAGE: REPORTS
// ============================================================
function pageReports() {
  const c = BV.getStatusCounts();
  const total = c.total || 1;

  const bySev = { Critical:0, High:0, Medium:0, Low:0 };
  BV.bugs.forEach(b => { if (bySev[b.severity] !== undefined) bySev[b.severity]++; });

  const recentActivity = BV.auditLogs.slice(0, 8);

  function progressBar(label, value, total, cls) {
    const pct = Math.round((value / total) * 100);
    return `
    <div class="progress-bar-wrap">
      <div class="progress-bar-label"><span>${label}</span><span>${value} (${pct}%)</span></div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill ${cls||''}" style="width:${pct}%"></div>
      </div>
    </div>`;
  }

  return `
  <div class="card-row">
    <div class="summary-card">
      <div class="card-label">Total Bugs</div>
      <div class="card-value">${c.total}</div>
    </div>
    <div class="summary-card open">
      <div class="card-label">New / Open</div>
      <div class="card-value">${(c["New"]||0)+(c["Open"]||0)+(c["Assigned"]||0)+(c["Reopened"]||0)}</div>
    </div>
    <div class="summary-card progress">
      <div class="card-label">In Progress</div>
      <div class="card-value">${c["In Progress"]||0}</div>
    </div>
    <div class="summary-card resolved">
      <div class="card-label">Resolved/Verified</div>
      <div class="card-value">${(c["Resolved"]||0)+(c["Verified"]||0)}</div>
    </div>
    <div class="summary-card closed">
      <div class="card-label">Closed</div>
      <div class="card-value">${c["Closed"]||0}</div>
    </div>
  </div>

  <div style="display:flex;gap:20px;flex-wrap:wrap;">
    <div class="section-box" style="flex:1;min-width:260px;">
      <h3>Bugs by Severity</h3>
      ${progressBar("Critical", bySev.Critical, total, "sev-critical")}
      ${progressBar("High",     bySev.High,     total, "sev-high")}
      ${progressBar("Medium",   bySev.Medium,   total, "sev-medium")}
      ${progressBar("Low",      bySev.Low,       total, "sev-low")}
    </div>
    <div class="section-box" style="flex:1;min-width:260px;">
      <h3>Bugs by Status</h3>
      ${["New","Assigned","Open","In Progress","Resolved","Verified","Closed","Reopened"].map(s =>
        progressBar(s, c[s]||0, total, "")
      ).join("")}
    </div>
  </div>

  <div class="section-box">
    <h3>Recent Activity</h3>
    <div class="table-container" style="margin-bottom:0">
      <table class="data-table">
        <thead><tr><th>User</th><th>Action</th><th>Date</th><th>Time</th></tr></thead>
        <tbody>
          ${recentActivity.map(l => `
          <tr>
            <td>${escHtml(l.user)}</td>
            <td>${escHtml(l.action)}</td>
            <td>${escHtml(l.date)}</td>
            <td>${escHtml(l.time)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ============================================================
// PAGE: USER MANAGEMENT
// ============================================================
function pageUserMgmt() {
  return `
  <div class="toolbar">
    <div class="toolbar-left">
      <h2 style="margin:0">Users</h2>
    </div>
    <div class="toolbar-right">
      <button class="btn btn-primary btn-sm" id="um-add-btn">+ Add User</button>
    </div>
  </div>

  <div id="um-form-wrap" class="hidden">
    <div class="form-section">
      <h3 id="um-form-title">Add User</h3>
      <div id="um-alert"></div>
      <div class="form-row">
        <div class="form-group">
          <label for="um-name">Full Name *</label>
          <input type="text" id="um-name" />
        </div>
        <div class="form-group">
          <label for="um-email">Email *</label>
          <input type="email" id="um-email" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="um-role">Role *</label>
          <select id="um-role">
            <option>Tester</option>
            <option>Developer/QA</option>
            <option>Manager</option>
            <option>Administrator</option>
          </select>
        </div>
        <div class="form-group">
          <label for="um-pass">Password *</label>
          <input type="text" id="um-pass" placeholder="Initial password" />
        </div>
      </div>
      <div class="form-group">
        <label for="um-status">Status</label>
        <select id="um-status"><option>Active</option><option>Inactive</option></select>
      </div>
      <button class="btn btn-primary" id="um-save-btn">Save</button>
      <button class="btn btn-secondary" style="margin-left:8px" id="um-cancel-btn">Cancel</button>
    </div>
  </div>

  <div class="table-container">
    <table class="data-table" id="um-table">
      <thead>
        <tr>
          <th>User ID</th><th>Name</th><th>Role</th><th>Email</th>
          <th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody id="um-tbody"></tbody>
    </table>
  </div>`;
}

function bindUserMgmt() {
  const renderUsers = () => {
    document.getElementById("um-tbody").innerHTML = BV.users.map(u => `
    <tr>
      <td>${escHtml(u.id)}</td>
      <td>${escHtml(u.name)}</td>
      <td>${escHtml(u.role)}</td>
      <td>${escHtml(u.email)}</td>
      <td><span class="badge ${u.status==='Active'?'badge-resolved':'badge-closed'}">${escHtml(u.status)}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm um-edit" data-id="${escHtml(u.id)}">Edit</button>
        <button class="btn btn-danger btn-sm um-del" data-id="${escHtml(u.id)}" style="margin-left:4px">Delete</button>
      </td>
    </tr>`).join("");

    document.querySelectorAll(".um-edit").forEach(btn => {
      btn.addEventListener("click", () => openEditUser(btn.dataset.id));
    });
    document.querySelectorAll(".um-del").forEach(btn => {
      btn.addEventListener("click", () => deleteUser(btn.dataset.id));
    });
  };

  renderUsers();
  editingUserId = null;

  document.getElementById("um-add-btn").addEventListener("click", () => {
    editingUserId = null;
    document.getElementById("um-form-title").textContent = "Add User";
    ["um-name","um-email","um-pass"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("um-role").value = "Tester";
    document.getElementById("um-status").value = "Active";
    document.getElementById("um-alert").innerHTML = "";
    document.getElementById("um-form-wrap").classList.remove("hidden");
  });

  document.getElementById("um-cancel-btn").addEventListener("click", () => {
    document.getElementById("um-form-wrap").classList.add("hidden");
  });

  document.getElementById("um-save-btn").addEventListener("click", () => {
    const name   = document.getElementById("um-name").value.trim();
    const email  = document.getElementById("um-email").value.trim();
    const role   = document.getElementById("um-role").value;
    const pass   = document.getElementById("um-pass").value.trim();
    const status = document.getElementById("um-status").value;
    const alert  = document.getElementById("um-alert");

    if (!name || !email) {
      alert.innerHTML = '<div class="alert alert-danger">Name and email are required.</div>';
      return;
    }

    if (editingUserId) {
      const u = BV.users.find(u => u.id === editingUserId);
      u.name = name; u.email = email; u.role = role; u.status = status;
      if (pass) u.password = pass;
      BV.addAuditLog(`Updated user ${editingUserId}`);
    } else {
      const newId = "U" + String(BV.users.length + 1).padStart(3, "0");
      BV.users.push({ id:newId, name, role, email, status, password:pass||"changeme" });
      BV.addAuditLog(`Created user ${newId}: ${name}`);
    }

    document.getElementById("um-form-wrap").classList.add("hidden");
    renderUsers();
  });

  function openEditUser(id) {
    const u = BV.users.find(u => u.id === id);
    if (!u) return;
    editingUserId = id;
    document.getElementById("um-form-title").textContent = "Edit User";
    document.getElementById("um-name").value   = u.name;
    document.getElementById("um-email").value  = u.email;
    document.getElementById("um-role").value   = u.role;
    document.getElementById("um-pass").value   = "";
    document.getElementById("um-status").value = u.status;
    document.getElementById("um-alert").innerHTML = "";
    document.getElementById("um-form-wrap").classList.remove("hidden");
  }

  function deleteUser(id) {
    if (!confirm("Delete this user?")) return;
    BV.users = BV.users.filter(u => u.id !== id);
    BV.addAuditLog(`Deleted user ${id}`);
    renderUsers();
  }
}

// ============================================================
// PAGE: SETTINGS
// ============================================================
function pageSettings() {
  const s = BV.settings;
  return `
  <div class="form-section">
    <h3>System Settings</h3>
    <div id="settings-alert"></div>
    <div class="form-group">
      <label for="st-name">System Name</label>
      <input type="text" id="st-name" value="${escHtml(s.systemName)}" />
    </div>
    <div class="form-group">
      <label for="st-notif">Email Notifications</label>
      <select id="st-notif">
        <option value="true"  ${s.notificationsEnabled ? "selected":""}>Enabled</option>
        <option value="false" ${!s.notificationsEnabled? "selected":""}>Disabled</option>
      </select>
    </div>
    <div class="form-group">
      <label for="st-pri">Default Priority for New Bugs</label>
      <select id="st-pri">
        <option ${s.defaultPriority==="Low"     ?"selected":""}>Low</option>
        <option ${s.defaultPriority==="Medium"  ?"selected":""}>Medium</option>
        <option ${s.defaultPriority==="High"    ?"selected":""}>High</option>
        <option ${s.defaultPriority==="Immediate Fix"?"selected":""}>Immediate Fix</option>
      </select>
    </div>
    <button class="btn btn-primary" id="st-save">Save Settings</button>
  </div>`;
}

function bindSettings() {
  document.getElementById("st-save").addEventListener("click", () => {
    BV.settings.systemName           = document.getElementById("st-name").value.trim() || "BUGVAULT";
    BV.settings.notificationsEnabled = document.getElementById("st-notif").value === "true";
    BV.settings.defaultPriority      = document.getElementById("st-pri").value;
    BV.addAuditLog("Updated system settings");
    document.getElementById("settings-alert").innerHTML = '<div class="alert alert-success">Settings saved successfully.</div>';
  });
}

// ============================================================
// PAGE: AUDIT LOGS
// ============================================================
function pageAuditLogs() {
  return `
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr><th>Log ID</th><th>User</th><th>Action</th><th>Date</th><th>Time</th></tr>
      </thead>
      <tbody>
        ${BV.auditLogs.map(l => `
        <tr>
          <td>${escHtml(l.id)}</td>
          <td>${escHtml(l.user)}</td>
          <td>${escHtml(l.action)}</td>
          <td>${escHtml(l.date)}</td>
          <td>${escHtml(l.time)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>`;
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  renderLogin();
});
