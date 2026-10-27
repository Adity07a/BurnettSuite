import apiClient from "../../../api/client";

const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const normalizedPath = path.startsWith("/v1/") ? path : `/v1${path.startsWith("/") ? path : `/${path}`}`;
  const method = (options.method || "GET").toUpperCase();
  
  if (method === "GET") {
    return apiClient.get(normalizedPath);
  }
  if (method === "POST") {
    return apiClient.post(normalizedPath, options.body);
  }
  if (method === "PUT") {
    return apiClient.put(normalizedPath, options.body);
  }
  if (method === "PATCH") {
    return apiClient.patch(normalizedPath, options.body);
  }
  if (method === "DELETE") {
    return apiClient.delete(normalizedPath);
  }
  return apiClient.get(normalizedPath);
}

export function saveAccessToken(token) {
  localStorage.setItem("burnett_access_token", token);
  localStorage.setItem("access_token", token);
  localStorage.setItem("resumeai-access-token", token);
}

export function clearTokens() {
  apiClient.clearSession();
}
