# Client Project Tracker

A simple full-stack app for a digital agency to track client projects, their
progress, and their priorities.

- **`backend/`** – REST API (Node.js + Express)
- **`frontend/`** – Web UI (React + Vite)

## Tech stack & why

| Layer    | Choice                      | Why |
|----------|------------------------------|-----|
| Backend  | Node.js, Express             | Minimal, fast to set up, widely known |
| Storage  | JSON file (`backend/data/db.json`) | Stands in for a real database so the app runs with zero setup — no DB server to install. The data access layer (`backend/src/store.js`) is isolated behind plain functions (`getAll`, `getById`, `create`, `update`, `remove`), so swapping it for PostgreSQL/Prisma later would only mean rewriting that one file, not the routes. |
| Frontend | React (Vite)                 | Fast dev server, simple component model, no boilerplate |

The database is seeded automatically from [`backend/test_data.json`](backend/test_data.json)
the first time the server runs.

## Project structure

```
koda-technical-assesment/
├── backend/
│   ├── src/
│   │   ├── app.js           # Express app (middleware, routes, error handling)
│   │   ├── server.js        # Starts the HTTP server
│   │   ├── store.js         # Data access layer (JSON-file backed)
│   │   ├── validation.js    # Project validation rules
│   │   └── routes/
│   │       └── projects.js  # /projects route handlers
│   ├── test/                # API & validation tests (node:test)
│   ├── test_data.json       # Seed data
│   └── data/db.json         # Generated at runtime (git-ignored)
└── frontend/
    └── src/
        ├── api.js           # Fetch wrapper for the backend API
        ├── constants.js     # Status/priority option lists
        ├── App.jsx           # Top-level page (list + filters + modal)
        └── components/
            ├── FilterBar.jsx
            ├── ProjectTable.jsx
            ├── ProjectForm.jsx
            └── Badge.jsx
```

## Prerequisites

- Node.js 18 or later
- npm

## Setup & run

Run the backend and frontend in two separate terminals.

### 1. Backend (API)

```bash
cd backend
npm install
npm start
```

The API starts on **http://localhost:4000** and seeds `backend/data/db.json`
from `backend/test_data.json` on first run.

Optional: `PORT=4001 npm start` to use a different port.

### 2. Frontend (UI)

```bash
cd frontend
npm install
npm run dev
```

The app opens on **http://localhost:5173**. In development, Vite proxies
any request to `/projects` straight to the backend on port 4000 (see
`frontend/vite.config.js`), so no extra configuration is needed as long as
the backend is running on its default port.

If the backend runs on a different port, point the proxy at it:

```bash
VITE_API_PROXY_TARGET=http://localhost:4001 npm run dev
```

## Running tests

The backend has unit tests (validation rules) and integration tests
(every route, against a throwaway data file so they never touch your real
data):

```bash
cd backend
npm test
```

## API reference

Base URL: `http://localhost:4000`

| Method | Path            | Description               |
|--------|-----------------|----------------------------|
| GET    | `/projects`         | List all projects. Supports `?status=`, `?priority=`, `?search=` query params. |
| GET    | `/projects/:id`     | Get a single project. `404` if it doesn't exist. |
| POST   | `/projects`         | Create a project. `400` with field errors if validation fails. |
| PUT    | `/projects/:id`     | Update a project. `404` if it doesn't exist, `400` if validation fails. |
| DELETE | `/projects/:id`     | Delete a project. `204` on success, `404` if it doesn't exist. |

### Project shape

```json
{
  "id": 1,
  "clientName": "Acme Corporation",
  "projectName": "Corporate Website Redesign",
  "description": "Redesign and modernize the company's corporate website.",
  "status": "In Progress",
  "priority": "High",
  "startDate": "2026-06-01",
  "dueDate": "2026-07-15"
}
```

`status` must be one of: `Planning`, `In Progress`, `On Hold`, `Completed`.
`priority` must be one of: `Low`, `Medium`, `High`.

### Validation rules

- `clientName` is required.
- `projectName` is required.
- `status` is required and must be a valid status.
- `priority` is required and must be a valid priority.
- `startDate` and `dueDate` are required valid dates.
- `dueDate` cannot be earlier than `startDate`.

A failed `POST`/`PUT` returns `400` with a body like:

```json
{
  "message": "Validation failed.",
  "errors": {
    "clientName": "Client Name is required.",
    "dueDate": "Due Date cannot be earlier than Start Date."
  }
}
```

## Features

- List all projects in a sortable (click any column header), filterable
  (status, priority, free-text search) table.
- Create, edit, and delete projects via a modal form.
- Client-side validation for instant feedback, with the server as the
  final authority — server-side field errors are shown inline in the form.
- Status and priority shown as colored badges for quick scanning.
