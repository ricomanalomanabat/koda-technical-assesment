import { useState } from "react";
import { STATUS_OPTIONS, PRIORITY_OPTIONS, EMPTY_PROJECT } from "../constants";
import { ApiError } from "../api";

// Quick client-side pass so users get instant feedback; the backend
// re-validates everything and is the final authority.
function validateClientSide(data) {
  const errors = {};
  if (!data.clientName.trim()) errors.clientName = "Client Name is required.";
  if (!data.projectName.trim()) errors.projectName = "Project Name is required.";
  if (!data.startDate) errors.startDate = "Start Date is required.";
  if (!data.dueDate) errors.dueDate = "Due Date is required.";
  if (
    data.startDate &&
    data.dueDate &&
    new Date(data.dueDate) < new Date(data.startDate)
  ) {
    errors.dueDate = "Due Date cannot be earlier than Start Date.";
  }
  return errors;
}

export default function ProjectForm({ project, onSave, onClose }) {
  const isEditing = Boolean(project);
  const [formData, setFormData] = useState(project || EMPTY_PROJECT);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const clientErrors = validateClientSide(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSave(formData);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
      }
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
    "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 " +
    "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
  const labelClasses = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";
  const errorClasses = "mt-1 text-sm text-red-600 dark:text-red-400";
  const Required = () => <span className="text-red-500"> *</span>;

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
          {isEditing ? "Edit Project" : "New Project"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="clientName" className={labelClasses}>
              Client Name<Required />
            </label>
            <input
              id="clientName"
              type="text"
              className={inputClasses}
              value={formData.clientName}
              onChange={(e) => handleChange("clientName", e.target.value)}
            />
            {errors.clientName && <p className={errorClasses}>{errors.clientName}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="projectName" className={labelClasses}>
              Project Name<Required />
            </label>
            <input
              id="projectName"
              type="text"
              className={inputClasses}
              value={formData.projectName}
              onChange={(e) => handleChange("projectName", e.target.value)}
            />
            {errors.projectName && <p className={errorClasses}>{errors.projectName}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="description" className={labelClasses}>
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className={inputClasses}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="status" className={labelClasses}>
                Status<Required />
              </label>
              <select
                id="status"
                className={inputClasses}
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && <p className={errorClasses}>{errors.status}</p>}
            </div>

            <div className="flex-1">
              <label htmlFor="priority" className={labelClasses}>
                Priority<Required />
              </label>
              <select
                id="priority"
                className={inputClasses}
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              {errors.priority && <p className={errorClasses}>{errors.priority}</p>}
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="startDate" className={labelClasses}>
                Start Date<Required />
              </label>
              <input
                id="startDate"
                type="date"
                className={inputClasses}
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
              {errors.startDate && <p className={errorClasses}>{errors.startDate}</p>}
            </div>

            <div className="flex-1">
              <label htmlFor="dueDate" className={labelClasses}>
                Due Date<Required />
              </label>
              <input
                id="dueDate"
                type="date"
                className={inputClasses}
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
              {errors.dueDate && <p className={errorClasses}>{errors.dueDate}</p>}
            </div>
          </div>

          {formError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{formError}</p>}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
