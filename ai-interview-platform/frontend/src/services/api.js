import axios from "axios";

const configuredURL = (import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api")).replace(/\/+$/, "");
const API_BASE_URL = `${configuredURL.endsWith("/api") ? configuredURL : `${configuredURL}/api`}/`;
const api = axios.create({ baseURL: API_BASE_URL });
const authApi = axios.create({ baseURL: API_BASE_URL });
const isPublicAuth = (url = "") => /users\/(login|register|token\/refresh)\//.test(url);
let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && !isPublicAuth(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || !originalRequest ||
        originalRequest._retry || isPublicAuth(originalRequest.url)) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refresh = localStorage.getItem("refresh_token");
          if (!refresh) throw new Error("Session has expired.");
          const response = await authApi.post("users/token/refresh/", { refresh });
          localStorage.setItem("access_token", response.data.access);
          if (response.data.refresh) {
            localStorage.setItem("refresh_token", response.data.refresh);
          }
          return response.data.access;
        })().finally(() => { refreshPromise = null; });
      }
      const token = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);

export default api;
