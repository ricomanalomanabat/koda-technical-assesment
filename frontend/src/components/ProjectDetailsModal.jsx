import { StatusBadge, PriorityBadge } from "./Badge";
import { formatDate } from "../utils";

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <div className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm text-gray-900 dark:text-gray-100">{children}</div>
    </div>
  );
}

export default function ProjectDetailsModal({ project, onEdit, onClose }) {
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 sm:p-7 dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {project.projectName}
        </h2>

        <Field label="Client Name">{project.clientName}</Field>
        <Field label="Project Name">{project.projectName}</Field>
        {project.description && <Field label="Description">{project.description}</Field>}

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:gap-8">
          <Field label="Status">
            <StatusBadge status={project.status} />
          </Field>
          <Field label="Priority">
            <PriorityBadge priority={project.priority} />
          </Field>
        </div>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:gap-8">
          <Field label="Start Date">{formatDate(project.startDate)}</Field>
          <Field label="Due Date">{formatDate(project.dueDate)}</Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            onClick={() => onEdit(project)}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
