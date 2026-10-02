const express = require("express");
const store = require("../store");
const { validateProject } = require("../validation");

const router = express.Router();

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Project id must be a number." });
    return null;
  }
  return id;
}

// GET /projects - list all projects, with optional filtering/search
router.get("/", (req, res) => {
  const { status, priority, search } = req.query;
  const projects = store.getAll({ status, priority, search });
  res.json(projects);
});

// GET /projects/:id - fetch a single project
router.get("/:id", (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const project = store.getById(id);
  if (!project) {
    return res.status(404).json({ message: `Project ${id} not found.` });
  }
  res.json(project);
});

// POST /projects - create a project
router.post("/", (req, res) => {
  const { valid, errors } = validateProject(req.body);
  if (!valid) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }
  const project = store.create(req.body);
  res.status(201).json(project);
});

// PUT /projects/:id - update a project
router.put("/:id", (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  if (!store.getById(id)) {
    return res.status(404).json({ message: `Project ${id} not found.` });
  }

  const { valid, errors } = validateProject(req.body);
  if (!valid) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  const project = store.update(id, req.body);
  res.json(project);
});

// DELETE /projects/:id - delete a project
router.delete("/:id", (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const deleted = store.remove(id);
  if (!deleted) {
    return res.status(404).json({ message: `Project ${id} not found.` });
  }
  res.status(204).send();
});

module.exports = router;
