const test = require("node:test");
const assert = require("node:assert/strict");
const { validateProject } = require("../src/validation");

const baseProject = {
  clientName: "Acme Corporation",
  projectName: "Website Redesign",
  status: "Planning",
  priority: "Medium",
  startDate: "2026-06-01",
  dueDate: "2026-07-01",
};

test("accepts a fully valid project", () => {
  const { valid, errors } = validateProject(baseProject);
  assert.equal(valid, true);
  assert.deepEqual(errors, {});
});

test("requires clientName", () => {
  const { valid, errors } = validateProject({ ...baseProject, clientName: "  " });
  assert.equal(valid, false);
  assert.equal(errors.clientName, "Client Name is required.");
});

test("requires projectName", () => {
  const { valid, errors } = validateProject({ ...baseProject, projectName: "" });
  assert.equal(valid, false);
  assert.equal(errors.projectName, "Project Name is required.");
});

test("rejects an invalid status", () => {
  const { valid, errors } = validateProject({ ...baseProject, status: "Cancelled" });
  assert.equal(valid, false);
  assert.match(errors.status, /Status must be one of/);
});

test("rejects an invalid priority", () => {
  const { valid, errors } = validateProject({ ...baseProject, priority: "Urgent" });
  assert.equal(valid, false);
  assert.match(errors.priority, /Priority must be one of/);
});

test("rejects a due date earlier than the start date", () => {
  const { valid, errors } = validateProject({
    ...baseProject,
    startDate: "2026-07-01",
    dueDate: "2026-06-01",
  });
  assert.equal(valid, false);
  assert.equal(errors.dueDate, "Due Date cannot be earlier than Start Date.");
});

test("allows the due date to equal the start date", () => {
  const { valid } = validateProject({
    ...baseProject,
    startDate: "2026-06-01",
    dueDate: "2026-06-01",
  });
  assert.equal(valid, true);
});
