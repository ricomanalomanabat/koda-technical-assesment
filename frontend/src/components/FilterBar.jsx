import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../constants";

const inputClasses =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
  "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 " +
  "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function FilterBar({ filters, onChange, onNewProject }) {
  function handleChange(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <input
        type="text"
        placeholder="Search by client or project name..."
        value={filters.search}
        onChange={(e) => handleChange("search", e.target.value)}
        className={`${inputClasses} w-full sm:min-w-60 sm:flex-1`}
      />

      <select
        value={filters.status}
        onChange={(e) => handleChange("status", e.target.value)}
        className={`${inputClasses} w-full sm:w-auto sm:flex-none sm:basis-40`}
      >
        <option value="">All Statuses</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(e) => handleChange("priority", e.target.value)}
        className={`${inputClasses} w-full sm:w-auto sm:flex-none sm:basis-40`}
      >
        <option value="">All Priorities</option>
        {PRIORITY_OPTIONS.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>

      <select
        value={filters.view}
        onChange={(e) => handleChange("view", e.target.value)}
        className={`${inputClasses} w-full sm:w-auto sm:flex-none sm:basis-40`}
      >
        <option value="active">Active Projects</option>
        <option value="deleted">Deleted Projects</option>
      </select>

      {filters.view !== "deleted" && (
        <button
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 sm:ml-auto sm:w-auto"
          onClick={onNewProject}
        >
          + New Project
        </button>
      )}
    </div>
  );
}
