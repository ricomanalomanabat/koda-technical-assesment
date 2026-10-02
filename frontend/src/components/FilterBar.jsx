import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../constants";

export default function FilterBar({ filters, onChange, onNewProject }) {
  function handleChange(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search by client or project name..."
        value={filters.search}
        onChange={(e) => handleChange("search", e.target.value)}
        className="filter-search"
      />

      <select
        value={filters.status}
        onChange={(e) => handleChange("status", e.target.value)}
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
      >
        <option value="">All Priorities</option>
        {PRIORITY_OPTIONS.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>

      <button className="btn btn-primary" onClick={onNewProject}>
        + New Project
      </button>
    </div>
  );
}
