import { useEffect, useMemo, useState } from "react";
import { StatusBadge, PriorityBadge } from "./Badge";
import { formatDate } from "../utils";

const COLUMNS = [
  { key: "clientName", label: "Client" },
  { key: "projectName", label: "Project" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "startDate", label: "Start Date" },
  { key: "dueDate", label: "Due Date" },
];

const PAGE_SIZE = 10;

export default function ProjectTable({ projects, trashed, onView, onEdit, onDelete, onRestore }) {
  const [sortKey, setSortKey] = useState("dueDate");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const copy = [...projects];
    copy.sort((a, b) => {
      const result = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? result : -result;
    });
    return copy;
  }, [projects, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  // Keep the page in range whenever filtering/sorting changes the result set.
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  const pageStart = (page - 1) * PAGE_SIZE;
  const visible = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (projects.length === 0) {
    return (
      <p className="py-10 text-center text-gray-500 dark:text-gray-400">
        {trashed ? "No deleted projects." : "No projects match your filters."}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/40">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 font-semibold text-gray-500 dark:text-gray-400"
              >
                {col.label}
                {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </th>
            ))}
            <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((project) => (
            <tr
              key={project.id}
              onClick={() => !trashed && onView(project)}
              className={`border-t border-gray-200 dark:border-gray-700 ${
                trashed ? "" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/30"
              }`}
            >
              <td className="px-4 py-3 align-top">{project.clientName}</td>
              <td className="max-w-xs px-4 py-3 align-top">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {project.projectName}
                </div>
                {project.description && (
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {project.description}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 align-top">
                <StatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3 align-top">
                <PriorityBadge priority={project.priority} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top">
                {formatDate(project.startDate)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top">
                {formatDate(project.dueDate)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top">
                {trashed ? (
                  <button
                    className="rounded-md border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(project);
                    }}
                  >
                    Restore
                  </button>
                ) : (
                  <>
                    <button
                      className="mr-2 rounded-md border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(project);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-md border border-red-300 px-2.5 py-1 text-xs text-red-600 hover:bg-red-600 hover:text-white dark:border-red-700 dark:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project);
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
        {visible.map((project) => (
          <div
            key={project.id}
            onClick={() => !trashed && onView(project)}
            className={`p-4 ${
              trashed ? "" : "cursor-pointer active:bg-gray-50 dark:active:bg-gray-900/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-gray-900 dark:text-gray-100">
                  {project.projectName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {project.clientName}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
              </div>
            </div>

            {project.description && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {project.description}
              </p>
            )}

            <div className="mt-3 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Start: {formatDate(project.startDate)}</span>
              <span>Due: {formatDate(project.dueDate)}</span>
            </div>

            <div className="mt-3 flex gap-2">
              {trashed ? (
                <button
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(project);
                  }}
                >
                  Restore
                </button>
              ) : (
                <>
                  <button
                    className="rounded-md border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(project);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-md border border-red-300 px-2.5 py-1 text-xs text-red-600 hover:bg-red-600 hover:text-white dark:border-red-700 dark:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project);
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, sorted.length)} of{" "}
          {sorted.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            className="rounded-md border border-gray-300 px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
