# Client Project Tracker

A simple full-stack app for a digital agency to track client projects, their
progress, and their priorities.

- **`backend/`** – REST API (Laravel)
- **`frontend/`** – Web UI (React + Vite + Tailwind CSS)

## Tech stack & why

| Layer    | Choice              | Why |
|----------|---------------------|-----|
| Backend  | Laravel (PHP)       | Controller → Route → Model flow, Eloquent ORM, built-in migrations/seeders/validation |
| Database | PostgreSQL          | Relational data with real constraints (status/priority enums, due-date-after-start-date are enforced at the DB level too, not just in app code) |
| Frontend | React (Vite)        | Fast dev server, simple component model, no boilerplate |
| Styling  | Tailwind CSS        | Utility classes, consistent light/dark theming without hand-rolled CSS |

## Project structure

```
koda-technical-assesment/
├── docker-compose.yml          # Postgres for anyone without a local install
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Models/{Project,User}.php
│   │   ├── Http/
│   │   │   ├── Controllers/{ProjectController,AuthController}.php
│   │   │   ├── Requests/               # Store/UpdateProjectRequest, LoginRequest
│   │   │   └── Resources/ProjectResource.php
│   ├── database/
│   │   ├── migrations/         # `projects` table + constraints, Sanctum tokens
│   │   ├── factories/ProjectFactory.php
│   │   └── seeders/             # ProjectSeeder (test_data.json), UserSeeder
│   ├── routes/api.php          # /api/login, /me, /logout, /projects
│   ├── tests/Feature/{ProjectApiTest,AuthApiTest}.php
│   ├── test_data.json          # Seed data
│   └── .env                    # Your local DB connection (git-ignored)
└── frontend/                   # React UI
    └── src/
        ├── api.js              # Fetch wrapper for the backend API
        ├── auth.js             # Token storage (localStorage)
        ├── constants.js        # Status/priority option lists
        ├── App.jsx             # Auth gate + top-level page
        └── components/
            ├── LoginForm.jsx
            ├── FilterBar.jsx
            ├── ProjectTable.jsx
            ├── ProjectForm.jsx
            ├── ProjectDetailsModal.jsx
            └── Badge.jsx
```

## Prerequisites

- PHP 8.3+ and Composer
- Node.js 18+ and npm
- A PostgreSQL server — either:
  - **Docker** (recommended if you don't already run Postgres locally), or
  - An existing local Postgres install

## Setup & run

Run the database, backend, and frontend in separate terminals.

### 1. Database

**Option A — Docker (no local Postgres required):**

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with user/password `postgres`/`postgres`,
and auto-creates an empty `project_tracker` database (via `POSTGRES_DB` in
`docker-compose.yml`). These match `backend/.env.example` exactly, so step 2
below just copies that file as-is — no editing needed, but you still need
the `.env` file itself (for `APP_KEY`, etc.) and still need to run
`php artisan migrate` + `db:seed` to create the `projects` table and load
the seed data; Docker only provides the empty server+database, not those.

**Option B — existing local Postgres:**

Copy `backend/.env.example` to `backend/.env` and fill in your own
`DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD`. `DB_DATABASE` defaults to
`project_tracker` — create that database (`createdb project_tracker`) if it
doesn't already exist on your server.

### 2. Backend (API)

```bash
cd backend
composer install
cp .env.example .env   # skip if you already created .env for option B above
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

The API starts on **http://localhost:8000**, with the `projects` table
migrated and seeded from `backend/test_data.json`, and a default login
(see **Authentication** below) seeded as well.

- `php artisan migrate` — creates/updates the schema.
- `php artisan db:seed` — (re)seeds from `test_data.json` and the default
  user. Safe to re-run; it upserts rather than duplicating rows.
- `php artisan migrate:rollback` — undoes the last migration.

### 3. Frontend (UI)

```bash
cd frontend
npm install
npm run dev
```

The app opens on **http://localhost:5173**. In development, Vite proxies
any request to `/api` straight to the backend on port 8000 (see
`frontend/vite.config.js`), so no extra configuration is needed as long as
the backend is running on its default port.

If the backend runs on a different port, point the proxy at it:

```bash
VITE_API_PROXY_TARGET=http://localhost:8001 npm run dev
```

Open the app and log in with the default account seeded by `php artisan db:seed`:

- **Email:** `admin@example.com`
- **Password:** `password`

## Running tests

Feature tests cover every route (listing/filtering, validation, 404s,
create/update/delete), against a separate `project_tracker_test` database
configured in `phpunit.xml` so tests never touch your dev data.

```bash
cd backend
php artisan test
```

## Authentication

The API is protected with [Laravel Sanctum](https://laravel.com/docs/sanctum)
token auth. The frontend shows a login screen and attaches the token as a
`Authorization: Bearer <token>` header on every request.

A default login is seeded by `php artisan db:seed`:

- **Email:** `admin@example.com`
- **Password:** `password`

| Method | Path         | Auth required | Description |
|--------|--------------|----------------|--------------|
| POST   | `/login`     | No             | `{ email, password }` → `{ token, user }`. `401` on bad credentials. |
| POST   | `/logout`    | Yes            | Revokes the current token. `204` on success. |
| GET    | `/me`        | Yes            | Returns the current user's `{ name, email }`. |

All `/projects` routes below require the `Authorization` header; requests
without a valid token get `401 {"message": "Unauthenticated."}`.

## API reference

Base URL: `http://localhost:8000/api`

| Method | Path            | Description               |
|--------|-----------------|----------------------------|
| GET    | `/projects`         | List all projects. Supports `?status=`, `?priority=`, `?search=`, `?trashed=1` query params. |
| GET    | `/projects/{id}`     | Get a single project. `404` if it doesn't exist. |
| POST   | `/projects`         | Create a project. `422` with field errors if validation fails. |
| PUT    | `/projects/{id}`     | Update a project. `404` if it doesn't exist, `422` if validation fails. |
| DELETE | `/projects/{id}`     | Soft-deletes a project. `204` on success, `404` if it doesn't exist. |
| POST   | `/projects/{id}/restore` | Restores a soft-deleted project. `404` if it isn't deleted. |

Deletes are soft deletes (a `deleted_at` timestamp, not row removal). By
default `/projects` only returns non-deleted rows; pass `?trashed=1` to see
only the deleted ones instead (combinable with `status`/`priority`/`search`).
The frontend exposes this as an "Active Projects" / "Deleted Projects"
dropdown in the filter bar, with a **Restore** button on each deleted row.

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
  "dueDate": "2026-07-15",
  "deletedAt": null
}
```

`deletedAt` is an ISO 8601 timestamp once soft-deleted, otherwise `null`.

`status` must be one of: `Planning`, `In Progress`, `On Hold`, `Completed`.
`priority` must be one of: `Low`, `Medium`, `High`.

### Validation rules

- `clientName` is required.
- `projectName` is required.
- `status` is required and must be a valid status.
- `priority` is required and must be a valid priority.
- `startDate` and `dueDate` are required valid dates.
- `dueDate` cannot be earlier than `startDate`.

These same rules are also enforced as CHECK constraints at the database
level (see `backend/database/migrations/`), as defense in depth.

A failed `POST`/`PUT` returns `422` with a body like:

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

- Token-based login; the project list is only reachable once signed in.
- List all projects in a sortable (click any column header), filterable
  (status, priority, free-text search), paginated (10 per page) table.
- Click a row to view its full details in a read-only modal; create, edit,
  and delete projects via a form modal.
- Deletes are soft deletes — switch the filter bar to "Deleted Projects"
  to see them and restore any of them.
- Client-side validation for instant feedback, with the server as the
  final authority — server-side field errors are shown inline in the form.
- Status and priority shown as colored badges for quick scanning.
- Light/dark theme toggle (sun/moon button, top right), preference saved
  in `localStorage` and applied before first paint to avoid a flash.
