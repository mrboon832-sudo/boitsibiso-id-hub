# Unity National ID Hub (Boitsibiso / Kopano)

BIHC3110 Human-Computer Interaction — Integrated Government Services System prototype for
Lesotho's Home Affairs, Traffic, Finance, Pensions, Police, and Passport Services, built around
a single verified citizen identity record.

> This is a classroom prototype. It demonstrates real auth, real data sharing, and a real
> audit trail against a local MySQL database — it is not hardened for production use.

## What this demonstrates

- One citizen identity record (`citizens.national_id`) shared across six government
  departments instead of each department holding its own duplicate copy.
- Two integration patterns used in real inter-agency systems:
  - **Pull** — a department (e.g. Traffic) requests Core Identity Data from Home Affairs on
    demand, logged the moment it happens.
  - **Push** — an event (e.g. a confirmed death registration) automatically notifies another
    department (Pensions) without a manual request.
- **Restricted disclosure** — Police flags are visible as a flag to other departments, but the
  case detail is only released after an approved access request.
- A full, human-readable **audit trail** (`audit_log`) that surfaces in the citizen's own
  tracking feed, the Home Affairs sharing log, and staff screens — so sharing is visible, not
  invisible.
- **Two channels, one backend** — a Vue 3 web app for smartphone/desktop users and a simulated
  **USSD feature-phone terminal** (dial `*330#`) for citizens without smartphone access. Both
  channels talk to the same Express + MySQL backend, so an application submitted over USSD
  shows up immediately in the web/staff views, and vice versa.

See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for the full technical architecture
(diagrams, data model, API surface, sharing-pattern sequence diagrams) and
[DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md) for every demo login and a suggested walkthrough
order.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 (Composition API) + Vite, Vue Router (hash history), Pinia, Axios |
| Backend | Node.js + Express 4, JWT auth (`jsonwebtoken`), `bcryptjs` |
| Database | MySQL 8 via `mysql2/promise` connection pool |
| USSD channel | Simulated feature-phone UI driven by dedicated `/api/ussd` session endpoints |

## Project structure

```text
Unity National ID Hub/
  backend/        Express API, MySQL schema/seed scripts, auth + audit middleware
  frontend/       Vue 3 SPA — citizen screens, staff/department screens, USSD terminal
  SYSTEM_ARCHITECTURE.md   Full architecture write-up (diagrams, data model, API surface)
  DEMO_CREDENTIALS.md      All demo logins and a suggested presentation walkthrough
```

## Prerequisites

- Node.js 22.5+ (see `backend/package.json` `engines`)
- A local MySQL 8 server, running and reachable

## Getting started

### 1. Configure the database connection

Copy the backend environment template and adjust it for your local MySQL instance:

```powershell
Copy-Item backend\.env.example backend\.env
```

Edit `backend/.env` with your MySQL host/user/password. The database (`boitsibiso` by default)
does not need to exist yet — the migration script creates it.

### 2. Start the backend

```powershell
cd backend
npm install
npm run migrate    # create/update the schema
npm run seed       # wipe and reload demo citizens, applications, staff accounts
npm start          # API on http://localhost:4000
```

Use `npm run dev` instead of `npm start` for auto-restart on file changes
(`node --watch server.js`).

### 3. Start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev        # SPA on http://localhost:5173
```

### 4. Open the app

- Web app: <http://localhost:5173>
- USSD phone simulator: <http://localhost:5173/#/ussd> — dial `*330#` on the on-screen keypad
  and press **Call** to open the USSD menu
- API health check: <http://localhost:4000/api/health>

All demo accounts (citizens log in with their National ID as both username and password; staff
use `Password123!`) are listed in [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md).

## Resetting demo data

Demo data is reseeded in a transaction, so it is always safe to run again:

```powershell
cd backend
npm run migrate
npm run seed
```

## Known prototype scoping decisions

These are deliberate classroom-prototype trade-offs, stated honestly rather than hidden:

1. **Auth is demo-grade** — JWT without refresh tokens, expiry handling, or lockout; the
   frontend auto-logs-in as the selected demo persona to keep walkthroughs fast.
2. **Departments are simulated in one backend** — in production each department would own its
   own service behind an API gateway; here role + department claims on a single API simulate
   that separation.
3. **USSD is simulated in-browser** — there is no real telco gateway. The interaction model
   (numbered text menus reached by dialling a short code, no colour dependency) is faithful to
   the accessibility constraint it is designed to demonstrate.
4. **MySQL `boitsibiso` is the live store.** `backend/data/boitsibiso.sql` is a legacy SQLite
   artefact from an earlier iteration and is no longer used by the running app.
5. **No external identity proofing** — the "verified once" identity anchor is asserted by seed
   data rather than a real enrolment workflow.

## License

Educational / coursework prototype. Not licensed for production or commercial use.
