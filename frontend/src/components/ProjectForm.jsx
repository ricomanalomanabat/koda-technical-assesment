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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? "Edit Project" : "New Project"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="clientName">Client Name *</label>
            <input
              id="clientName"
              type="text"
              value={formData.clientName}
              onChange={(e) => handleChange("clientName", e.target.value)}
            />
            {errors.clientName && <p className="field-error">{errors.clientName}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="projectName">Project Name *</label>
            <input
              id="projectName"
              type="text"
              value={formData.projectName}
              onChange={(e) => handleChange("projectName", e.target.value)}
            />
            {errors.projectName && <p className="field-error">{errors.projectName}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && <p className="field-error">{errors.status}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="priority">Priority *</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              {errors.priority && <p className="field-error">{errors.priority}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="startDate">Start Date *</label>
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
              {errors.startDate && <p className="field-error">{errors.startDate}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="dueDate">Due Date *</label>
              <input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
              {errors.dueDate && <p className="field-error">{errors.dueDate}</p>}
            </div>
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
