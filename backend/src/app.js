// Express app wiring, separated from server.js so tests can import it
// without also starting a listener.

const express = require("express");
const cors = require("cors");
const projectsRouter = require("./routes/projects");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/projects", projectsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found." });
});

// Catches malformed JSON bodies and any other unexpected errors.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

module.exports = app;
