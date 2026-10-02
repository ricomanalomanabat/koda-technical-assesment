// Thin wrapper around the backend REST API.
// Relative paths are used so the Vite dev server proxy (see vite.config.js)
// can forward them to the backend without hitting CORS.

import { getToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL || "";

class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
  login: (email, password) =>
    request("/api/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/api/logout", { method: "POST" }),
  me: () => request("/api/me"),

  getProjects: (filters) => request(`/api/projects${buildQuery(filters)}`),
  getProject: (id) => request(`/api/projects/${id}`),
  createProject: (data) =>
    request("/api/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id, data) =>
    request(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: "DELETE" }),
  restoreProject: (id) => request(`/api/projects/${id}/restore`, { method: "POST" }),
};

export { ApiError };
