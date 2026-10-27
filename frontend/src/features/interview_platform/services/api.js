import axios from "axios";

const configuredURL = (
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env?.DEV ? "http://127.0.0.1:8000/api" : "/api")
).replace(/\/+$/, "");

const API_BASE_URL = `${configuredURL.endsWith("/api") ? configuredURL : `${configuredURL}/api`}/`;
const api = axios.create({ baseURL: API_BASE_URL });
const authApi = axios.create({ baseURL: API_BASE_URL });
const isPublicAuth = (url = "") => /(auth|users)\/(login|register|token\/refresh)\//.test(url);
let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("burnett_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("resumeai-access-token");
  if (token && !isPublicAuth(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuth(originalRequest.url)
    ) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refresh =
            localStorage.getItem("burnett_refresh_token") ||
            localStorage.getItem("refresh_token") ||
            localStorage.getItem("resumeai-refresh-token");
          if (!refresh) throw new Error("Session has expired.");
          const response = await authApi.post("auth/token/refresh/", { refresh });
          const newAccess = response.data.access;
          localStorage.setItem("burnett_access_token", newAccess);
          localStorage.setItem("access_token", newAccess);
          localStorage.setItem("resumeai-access-token", newAccess);
          if (response.data.refresh) {
            localStorage.setItem("burnett_refresh_token", response.data.refresh);
            localStorage.setItem("refresh_token", response.data.refresh);
            localStorage.setItem("resumeai-refresh-token", response.data.refresh);
          }
          return newAccess;
        })().finally(() => {
          refreshPromise = null;
        });
      }
      const token = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("burnett_access_token");
      localStorage.removeItem("burnett_refresh_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("resumeai-access-token");
      localStorage.removeItem("resumeai-refresh-token");
      window.location.href = "/";
      return Promise.reject(refreshError);
    }
  }
);

export default api;
