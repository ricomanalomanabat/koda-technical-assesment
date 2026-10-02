const STATUS_CLASSES = {
  Planning: "badge badge-status-planning",
  "In Progress": "badge badge-status-in-progress",
  "On Hold": "badge badge-status-on-hold",
  Completed: "badge badge-status-completed",
};

const PRIORITY_CLASSES = {
  Low: "badge badge-priority-low",
  Medium: "badge badge-priority-medium",
  High: "badge badge-priority-high",
};

export function StatusBadge({ status }) {
  return <span className={STATUS_CLASSES[status] || "badge"}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={PRIORITY_CLASSES[priority] || "badge"}>{priority}</span>;
}
