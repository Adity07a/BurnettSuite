import axios from "axios";

const configuredURL = (import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api")).replace(/\/+$/, "");
const API_BASE_URL = `${configuredURL.endsWith("/api") ? configuredURL : `${configuredURL}/api`}/`;
const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
const authApi = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
const isPublicAuth = (url = "") => /users\/(login|register|token\/refresh)\//.test(url);
let refreshPromise = null;

api.interceptors.request.use((config) => {
  delete config.headers.Authorization;
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
          await authApi.post("suite-auth/refresh/", {});
          return true;
        })().finally(() => { refreshPromise = null; });
      }
      await refreshPromise;
      delete originalRequest.headers.Authorization;
      return api(originalRequest);
    } catch (refreshError) {
      window.location.assign(window.BurnettSuite?.loginUrl?.() || "/login");
      return Promise.reject(refreshError);
    }
  }
);

export default api;
