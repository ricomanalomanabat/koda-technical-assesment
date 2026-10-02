import { useEffect, useState } from "react";
import { api } from "./api";
import FilterBar from "./components/FilterBar";
import ProjectTable from "./components/ProjectTable";
import ProjectForm from "./components/ProjectForm";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getProjects(filters);
      setProjects(data);
    } catch (err) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function openCreateForm() {
    setEditingProject(null);
    setShowForm(true);
  }

  function openEditForm(project) {
    setEditingProject(project);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProject(null);
  }

  async function handleSave(data) {
    if (editingProject) {
      await api.updateProject(editingProject.id, data);
    } else {
      await api.createProject(data);
    }
    closeForm();
    await loadProjects();
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Delete "${project.projectName}" for ${project.clientName}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.deleteProject(project.id);
      await loadProjects();
    } catch (err) {
      setError(err.message || "Failed to delete project.");
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Client Project Tracker</h1>
        <p>Track client projects, progress, and priorities in one place.</p>
      </header>

      <FilterBar filters={filters} onChange={setFilters} onNewProject={openCreateForm} />

      {error && <p className="banner-error">{error}</p>}

      {loading ? (
        <p className="empty-state">Loading projects...</p>
      ) : (
        <ProjectTable
          projects={projects}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <ProjectForm project={editingProject} onSave={handleSave} onClose={closeForm} />
      )}
    </div>
  );
}
