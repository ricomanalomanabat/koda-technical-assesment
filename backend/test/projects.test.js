const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Point the store at a throwaway DB file before requiring anything
// that touches it, so these tests never read/write the real data.
const tmpDbPath = path.join(os.tmpdir(), `project-tracker-test-${Date.now()}.json`);
fs.writeFileSync(tmpDbPath, "[]");
process.env.PROJECT_TRACKER_DB_PATH = tmpDbPath;

const app = require("../src/app");

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(tmpDbPath, { force: true });
});

const validPayload = {
  clientName: "Acme Corporation",
  projectName: "Website Redesign",
  description: "Redesign the marketing site.",
  status: "Planning",
  priority: "Medium",
  startDate: "2026-06-01",
  dueDate: "2026-07-01",
};

test("POST /projects creates a project", async () => {
  const res = await fetch(`${baseUrl}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.clientName, validPayload.clientName);
  assert.ok(body.id);
});

test("POST /projects rejects an invalid payload", async () => {
  const res = await fetch(`${baseUrl}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, clientName: "" }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.errors.clientName, "Client Name is required.");
});

test("GET /projects lists created projects", async () => {
  const res = await fetch(`${baseUrl}/projects`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  assert.ok(body.length >= 1);
});

test("GET /projects/:id returns 404 for an unknown id", async () => {
  const res = await fetch(`${baseUrl}/projects/999999`);
  assert.equal(res.status, 404);
});

test("PUT /projects/:id updates an existing project", async () => {
  const created = await (
    await fetch(`${baseUrl}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    })
  ).json();

  const res = await fetch(`${baseUrl}/projects/${created.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, status: "Completed" }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "Completed");
});

test("DELETE /projects/:id removes a project", async () => {
  const created = await (
    await fetch(`${baseUrl}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    })
  ).json();

  const deleteRes = await fetch(`${baseUrl}/projects/${created.id}`, {
    method: "DELETE",
  });
  assert.equal(deleteRes.status, 204);

  const getRes = await fetch(`${baseUrl}/projects/${created.id}`);
  assert.equal(getRes.status, 404);
});
