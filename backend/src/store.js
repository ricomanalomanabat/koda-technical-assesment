// Simple JSON-file backed data store standing in for a real database.
// Swapping this module for a PostgreSQL-backed one would be a drop-in
// replacement for the route handlers, which only call the functions below.

const fs = require("fs");
const path = require("path");

// Overridable so tests can point at a throwaway file instead of the
// real data/db.json used by `npm start`.
const DB_PATH =
  process.env.PROJECT_TRACKER_DB_PATH ||
  path.join(__dirname, "..", "data", "db.json");
const SEED_PATH = path.join(__dirname, "..", "test_data.json");

function ensureDb() {
  if (fs.existsSync(DB_PATH)) return;
  const seed = fs.existsSync(SEED_PATH)
    ? fs.readFileSync(SEED_PATH, "utf-8")
    : "[]";
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, seed);
}

function readAll() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw || "[]");
}

function writeAll(projects) {
  fs.writeFileSync(DB_PATH, JSON.stringify(projects, null, 2));
}

function getNextId(projects) {
  return projects.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

function getAll({ status, priority, search } = {}) {
  let projects = readAll();

  if (status) {
    projects = projects.filter((p) => p.status === status);
  }
  if (priority) {
    projects = projects.filter((p) => p.priority === priority);
  }
  if (search) {
    const term = search.toLowerCase();
    projects = projects.filter(
      (p) =>
        p.clientName.toLowerCase().includes(term) ||
        p.projectName.toLowerCase().includes(term)
    );
  }

  return projects;
}

function getById(id) {
  return readAll().find((p) => p.id === id);
}

function create(data) {
  const projects = readAll();
  const project = {
    id: getNextId(projects),
    clientName: data.clientName.trim(),
    projectName: data.projectName.trim(),
    description: (data.description || "").trim(),
    status: data.status,
    priority: data.priority,
    startDate: data.startDate,
    dueDate: data.dueDate,
  };
  projects.push(project);
  writeAll(projects);
  return project;
}

function update(id, data) {
  const projects = readAll();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  const updated = {
    ...projects[index],
    clientName: data.clientName.trim(),
    projectName: data.projectName.trim(),
    description: (data.description || "").trim(),
    status: data.status,
    priority: data.priority,
    startDate: data.startDate,
    dueDate: data.dueDate,
  };
  projects[index] = updated;
  writeAll(projects);
  return updated;
}

function remove(id) {
  const projects = readAll();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return false;
  projects.splice(index, 1);
  writeAll(projects);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
