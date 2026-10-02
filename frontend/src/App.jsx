import { useEffect, useState } from "react";
import { api } from "./api";
import { getToken, clearToken } from "./auth";
import FilterBar from "./components/FilterBar";
import ProjectTable from "./components/ProjectTable";
import ProjectForm from "./components/ProjectForm";
import ProjectDetailsModal from "./components/ProjectDetailsModal";
import LoginForm from "./components/LoginForm";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", view: "active" });
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);

  useEffect(() => {
    if (!getToken()) {
      setAuthChecked(true);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true));
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getProjects({
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        trashed: filters.view === "deleted" ? "1" : undefined,
      });
      setProjects(data);
    } catch (err) {
      if (err.status === 401) {
        clearToken();
        setUser(null);
        return;
      }
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, user]);

  function openCreateForm() {
    setEditingProject(null);
    setShowForm(true);
  }

  function openEditForm(project) {
    setViewingProject(null);
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

  async function handleRestore(project) {
    try {
      await api.restoreProject(project.id);
      await loadProjects();
    } catch (err) {
      setError(err.message || "Failed to restore project.");
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Token may already be invalid; clear local state regardless.
    }
    clearToken();
    setUser(null);
    setProjects([]);
  }

  if (!authChecked) return null;

  if (!user) {
    return <LoginForm onLogin={setUser} />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Client Project Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track client projects, progress, and priorities in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <ThemeToggle />
          <span>{user.name}</span>
          <button
            className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <FilterBar filters={filters} onChange={setFilters} onNewProject={openCreateForm} />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-gray-500 dark:text-gray-400">
          Loading projects...
        </p>
      ) : (
        <ProjectTable
          projects={projects}
          trashed={filters.view === "deleted"}
          onView={setViewingProject}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      )}

      {viewingProject && (
        <ProjectDetailsModal
          project={viewingProject}
          onEdit={openEditForm}
          onClose={() => setViewingProject(null)}
        />
      )}

      {showForm && (
        <ProjectForm project={editingProject} onSave={handleSave} onClose={closeForm} />
      )}
    </div>
  );
}
