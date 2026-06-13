# BUGVAULT – Bug Tracking System
### University Software Engineering Project

---

## Project Overview

BUGVAULT is a frontend-only bug tracking system built with plain HTML, CSS, and JavaScript.
It simulates a practical bug management workflow used in small software teams.

---

## Folder Structure

```
bugvault/
├── index.html          # Main entry point (single HTML file)
├── css/
│   └── style.css       # All styles — no external CSS frameworks
├── js/
│   ├── data.js         # Mock data: users, bugs, audit logs, helpers
│   └── app.js          # All page rendering, routing, event handling
└── README.md           # This file
```

---

## Setup Instructions

1. Download or unzip the project folder.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge).
   - No server, no npm, no build step required.
   - All data is stored in memory (JavaScript variables).

---

## Demo Login Credentials

| Name  | Password  | Role           |
|-------|-----------|----------------|
| alice | admin123  | Administrator  |
| bob   | mgr123    | Manager        |
| carol | dev123    | Developer/QA   |
| eva   | test123   | Tester         |

> Enter the **first name only** in the username field.

---

## Pages Available

| Page              | Access                        |
|-------------------|-------------------------------|
| Login             | All                           |
| Dashboard         | All                           |
| Report Bug        | All                           |
| Bug List          | All                           |
| Bug Details       | All (via Bug List / Dashboard)|
| Assign Bug        | Manager, Administrator        |
| Update Status     | Developer/QA, Administrator   |
| Reports           | All                           |
| User Management   | Administrator only            |
| System Settings   | Administrator only            |
| Audit Logs        | All                           |

---

## Bug Status Lifecycle

```
New → Assigned → Open → In Progress → Resolved → Verified → Closed
                                          ↓
                                       Reopened → Assigned
```

---

## Severity / Priority Decision Table

| Severity | Impact | Priority      |
|----------|--------|---------------|
| Low      | Low    | Low           |
| Medium   | Medium | Medium        |
| High     | Medium | High          |
| Critical | High   | Immediate Fix |

---

## Notes

- All data is mock/dummy and resets on page refresh.
- No backend or database is connected.
- Designed for desktop screens; basic mobile support included.
- Color theme: Dark Blue (#1e3a5f), White, Light Gray.
