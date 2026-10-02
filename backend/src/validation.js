// Shared validation rules for creating/updating a project.

const VALID_STATUSES = ["Planning", "In Progress", "On Hold", "Completed"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isValidDate(value) {
  if (isBlank(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

// Validates a full project payload (used for both create and update,
// since the frontend always submits the complete form).
function validateProject(data) {
  const errors = {};

  if (isBlank(data.clientName)) {
    errors.clientName = "Client Name is required.";
  }

  if (isBlank(data.projectName)) {
    errors.projectName = "Project Name is required.";
  }

  if (isBlank(data.status)) {
    errors.status = "Status is required.";
  } else if (!VALID_STATUSES.includes(data.status)) {
    errors.status = `Status must be one of: ${VALID_STATUSES.join(", ")}.`;
  }

  if (isBlank(data.priority)) {
    errors.priority = "Priority is required.";
  } else if (!VALID_PRIORITIES.includes(data.priority)) {
    errors.priority = `Priority must be one of: ${VALID_PRIORITIES.join(", ")}.`;
  }

  if (isBlank(data.startDate)) {
    errors.startDate = "Start Date is required.";
  } else if (!isValidDate(data.startDate)) {
    errors.startDate = "Start Date must be a valid date.";
  }

  if (isBlank(data.dueDate)) {
    errors.dueDate = "Due Date is required.";
  } else if (!isValidDate(data.dueDate)) {
    errors.dueDate = "Due Date must be a valid date.";
  }

  if (
    !errors.startDate &&
    !errors.dueDate &&
    new Date(data.dueDate) < new Date(data.startDate)
  ) {
    errors.dueDate = "Due Date cannot be earlier than Start Date.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateProject, VALID_STATUSES, VALID_PRIORITIES };
