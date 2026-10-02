const BASE = "inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold";

const STATUS_CLASSES = {
  Planning: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "On Hold": "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const PRIORITY_CLASSES = {
  Low: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  High: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export function StatusBadge({ status }) {
  return <span className={`${BASE} ${STATUS_CLASSES[status] || ""}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`${BASE} ${PRIORITY_CLASSES[priority] || ""}`}>{priority}</span>;
}
