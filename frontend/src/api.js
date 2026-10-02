// Thin wrapper around the backend REST API.
// Relative paths are used so the Vite dev server proxy (see vite.config.js)
// can forward them to the backend without hitting CORS.

const BASE_URL = import.meta.env.VITE_API_URL || "";

class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(body?.message || "Request failed.", {
      status: res.status,
      errors: body?.errors,
    });
  }

  return body;
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  getProjects: (filters) => request(`/projects${buildQuery(filters)}`),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) =>
    request("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id, data) =>
    request(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: "DELETE" }),
};

export { ApiError };
