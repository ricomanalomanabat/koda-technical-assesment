import { useMemo, useState } from "react";
import { StatusBadge, PriorityBadge } from "./Badge";

const COLUMNS = [
  { key: "clientName", label: "Client" },
  { key: "projectName", label: "Project" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "startDate", label: "Start Date" },
  { key: "dueDate", label: "Due Date" },
];

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProjectTable({ projects, onEdit, onDelete }) {
  const [sortKey, setSortKey] = useState("dueDate");
  const [sortDir, setSortDir] = useState("asc");

  const sorted = useMemo(() => {
    const copy = [...projects];
    copy.sort((a, b) => {
      const result = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? result : -result;
    });
    return copy;
  }, [projects, sortKey, sortDir]);

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (projects.length === 0) {
    return <p className="empty-state">No projects match your filters.</p>;
  }

  return (
    <table className="project-table">
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th key={col.key} onClick={() => handleSort(col.key)}>
              {col.label}
              {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
            </th>
          ))}
          <th className="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((project) => (
          <tr key={project.id}>
            <td>{project.clientName}</td>
            <td>
              <div className="project-name">{project.projectName}</div>
              {project.description && (
                <div className="project-description">{project.description}</div>
              )}
            </td>
            <td>
              <StatusBadge status={project.status} />
            </td>
            <td>
              <PriorityBadge priority={project.priority} />
            </td>
            <td>{formatDate(project.startDate)}</td>
            <td>{formatDate(project.dueDate)}</td>
            <td className="col-actions">
              <button className="btn btn-small" onClick={() => onEdit(project)}>
                Edit
              </button>
              <button
                className="btn btn-small btn-danger"
                onClick={() => onDelete(project)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
