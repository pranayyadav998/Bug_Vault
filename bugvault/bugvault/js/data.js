// ============================================================
// BUGVAULT - Sample Mock Data
// University Software Engineering Project
// ============================================================

const BV = {

  // ---- Current logged-in user (set on login) ----
  currentUser: null,

  // ---- Users ----
  users: [
    { id: "U001", name: "Alice Johnson",   role: "Administrator", email: "alice@bugvault.edu",   status: "Active",   password: "admin123" },
    { id: "U002", name: "Bob Smith",       role: "Manager",       email: "bob@bugvault.edu",     status: "Active",   password: "mgr123"   },
    { id: "U003", name: "Carol Williams",  role: "Developer/QA",  email: "carol@bugvault.edu",   status: "Active",   password: "dev123"   },
    { id: "U004", name: "David Lee",       role: "Developer/QA",  email: "david@bugvault.edu",   status: "Active",   password: "dev123"   },
    { id: "U005", name: "Eva Martinez",    role: "Tester",        email: "eva@bugvault.edu",     status: "Active",   password: "test123"  },
    { id: "U006", name: "Frank Nguyen",    role: "Tester",        email: "frank@bugvault.edu",   status: "Inactive", password: "test123"  },
  ],

  // ---- Bugs ----
  bugs: [
    {
      id: "BUG-001", title: "Login page crashes on empty password",
      description: "When the user leaves the password field blank and clicks Login, the application throws an unhandled exception and crashes instead of showing a validation error.",
      severity: "Critical", priority: "Immediate Fix",
      status: "In Progress", assignedTo: "Carol Williams",
      reportedBy: "Eva Martinez", dateCreated: "2025-06-01",
      resolutionNotes: "Investigating null-check in auth controller.",
      attachment: null
    },
    {
      id: "BUG-002", title: "Dashboard chart not rendering on Firefox",
      description: "The bar chart on the Reports page is blank when viewed in Firefox 124. Works fine on Chrome and Edge.",
      severity: "High", priority: "High",
      status: "Assigned", assignedTo: "David Lee",
      reportedBy: "Frank Nguyen", dateCreated: "2025-06-02",
      resolutionNotes: "",
      attachment: null
    },
    {
      id: "BUG-003", title: "Export to PDF produces garbled text",
      description: "Exporting the bug list to PDF results in some table cells showing '???' instead of actual content. Affects non-ASCII characters.",
      severity: "Medium", priority: "Medium",
      status: "Open", assignedTo: "Carol Williams",
      reportedBy: "Bob Smith", dateCreated: "2025-06-03",
      resolutionNotes: "",
      attachment: null
    },
    {
      id: "BUG-004", title: "Pagination resets when sorting columns",
      description: "If the user is on page 3 of the bug list and clicks a column header to sort, the current page number stays at 3 but the displayed data is from page 1.",
      severity: "Low", priority: "Low",
      status: "Resolved", assignedTo: "David Lee",
      reportedBy: "Eva Martinez", dateCreated: "2025-05-28",
      resolutionNotes: "Fixed sort handler to reset page index to 1 on each sort action.",
      attachment: null
    },
    {
      id: "BUG-005", title: "Email notification not sent on status change",
      description: "Developers are not receiving email alerts when a bug is assigned to them. SMTP logs show the mail server is reachable but no outgoing messages are found.",
      severity: "High", priority: "High",
      status: "New", assignedTo: "",
      reportedBy: "Bob Smith", dateCreated: "2025-06-04",
      resolutionNotes: "",
      attachment: null
    },
    {
      id: "BUG-006", title: "Attachment file size limit not enforced",
      description: "Users can upload files larger than the documented 5 MB limit. A 50 MB file was uploaded successfully, causing server disk alerts.",
      severity: "Medium", priority: "High",
      status: "Verified", assignedTo: "Carol Williams",
      reportedBy: "Alice Johnson", dateCreated: "2025-05-30",
      resolutionNotes: "Server-side validation added. File size now checked before saving.",
      attachment: null
    },
    {
      id: "BUG-007", title: "Dark mode toggle not persisting after refresh",
      description: "The dark mode preference is lost when the page is refreshed. LocalStorage key is being set but not read on page load.",
      severity: "Low", priority: "Low",
      status: "Closed", assignedTo: "David Lee",
      reportedBy: "Carol Williams", dateCreated: "2025-05-20",
      resolutionNotes: "Theme read from localStorage on DOMContentLoaded. Verified fixed.",
      attachment: null
    },
    {
      id: "BUG-008", title: "Search returns no results for partial bug IDs",
      description: "Searching for 'BUG-0' in the bug list returns zero results even though matching records exist. Full ID like 'BUG-001' works correctly.",
      severity: "Medium", priority: "Medium",
      status: "Reopened", assignedTo: "Carol Williams",
      reportedBy: "Eva Martinez", dateCreated: "2025-06-05",
      resolutionNotes: "Previous fix was incomplete. Partial match still fails for prefix-only input.",
      attachment: null
    },
  ],

  // ---- Audit Logs ----
  auditLogs: [
    { id: "L001", user: "Alice Johnson",  action: "Created user David Lee",             date: "2025-06-01", time: "09:12:44" },
    { id: "L002", user: "Eva Martinez",   action: "Reported BUG-001",                   date: "2025-06-01", time: "10:05:30" },
    { id: "L003", user: "Bob Smith",      action: "Assigned BUG-001 to Carol Williams", date: "2025-06-01", time: "11:20:00" },
    { id: "L004", user: "Carol Williams", action: "Updated BUG-001 status to In Progress", date: "2025-06-02", time: "08:45:15" },
    { id: "L005", user: "Frank Nguyen",   action: "Reported BUG-002",                   date: "2025-06-02", time: "09:30:22" },
    { id: "L006", user: "Bob Smith",      action: "Assigned BUG-002 to David Lee",      date: "2025-06-02", time: "10:00:00" },
    { id: "L007", user: "Bob Smith",      action: "Reported BUG-003",                   date: "2025-06-03", time: "14:15:10" },
    { id: "L008", user: "David Lee",      action: "Updated BUG-004 status to Resolved", date: "2025-06-03", time: "16:40:00" },
    { id: "L009", user: "Alice Johnson",  action: "Updated system settings",            date: "2025-06-04", time: "09:00:00" },
    { id: "L010", user: "Eva Martinez",   action: "Reported BUG-008",                   date: "2025-06-05", time: "11:55:30" },
  ],

  // ---- Settings ----
  settings: {
    systemName: "BUGVAULT",
    notificationsEnabled: true,
    defaultPriority: "Medium"
  },

  // ---- Helpers ----
  getStatusCounts() {
    const counts = { total: 0, New: 0, Assigned: 0, Open: 0, "In Progress": 0, Resolved: 0, Verified: 0, Closed: 0, Reopened: 0 };
    this.bugs.forEach(b => {
      counts.total++;
      if (counts[b.status] !== undefined) counts[b.status]++;
      else counts[b.status] = 1;
    });
    return counts;
  },

  addAuditLog(action) {
    if (!this.currentUser) return;
    const now = new Date();
    this.auditLogs.unshift({
      id: "L" + String(this.auditLogs.length + 1).padStart(3, "0"),
      user: this.currentUser.name,
      action,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8)
    });
  },

  nextBugId() {
    const nums = this.bugs.map(b => parseInt(b.id.split("-")[1]));
    return "BUG-" + String(Math.max(...nums) + 1).padStart(3, "0");
  }
};
