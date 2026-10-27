const configuredBaseUrl = import.meta.env?.VITE_API_BASE_URL;
const API_BASE_URL = (configuredBaseUrl || "http://localhost:8000/api").replace(/\/+$/, "");
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Tokens sync to memory and localStorage for cross-module compatibility
let accessToken = null;
let refreshToken = null;
let refreshPromise = null;
let sessionExpiredHandler = null;

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, fieldErrors = {} } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.fieldErrors = fieldErrors;
  }
}

function buildUrl(endpoint) {
  const cleanEndpoint = String(endpoint || "").replace(/^\/+/, "");
  // If endpoint already starts with http, return it directly
  if (cleanEndpoint.startsWith("http://") || cleanEndpoint.startsWith("https://")) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

function extractMessages(value) {
  if (typeof value === "string" && value.trim()) return [value.trim()];
  if (Array.isArray(value)) return value.flatMap(extractMessages);
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => key !== "detail" && key !== "code")
      .flatMap(([key, item]) => extractMessages(item).map((message) => `${key}: ${message}`));
  }
  return [];
}

function getFieldErrors(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  return Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => !["detail", "code", "non_field_errors"].includes(key))
      .map(([key, value]) => [key, extractMessages(value)])
      .filter(([, messages]) => messages.length > 0),
  );
}

function statusMessage(status) {
  const messages = {
    400: "Please check the submitted fields and try again.",
    401: "Your session or credentials are invalid. Please sign in again.",
    403: "You do not have permission to perform this action.",
    404: "The requested record or endpoint was not found.",
    409: "This request conflicts with the current record. Refresh and try again.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "The server encountered an error. Please try again later.",
  };
  return messages[status] || (status >= 500
    ? "A server error occurred. Please try again later."
    : `Request failed (${status}).`);
}

function makeApiError(status, data, overrideMessage) {
  const detail = data?.detail;
  let message = overrideMessage || statusMessage(status);
  if (!overrideMessage && status < 500 && typeof detail === "string" && detail.trim()) {
    message = detail.trim();
  } else if (!overrideMessage && status < 500 && Array.isArray(detail)) {
    message = extractMessages(detail).join(" ") || message;
  }

  const nonFieldErrors = data?.non_field_errors;
  if (!overrideMessage && status < 500 && nonFieldErrors) {
    message = extractMessages(nonFieldErrors).join(" ") || message;
  }

  return new ApiError(message, {
    status,
    data,
    fieldErrors: getFieldErrors(data),
  });
}

async function readResponse(response) {
  if (response.status === 204 || response.status === 205) return null;
  const raw = await response.text();
  if (!raw) return null;

  const contentType = response.headers?.get?.("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return { detail: "The server returned invalid JSON." };
    }
  }
  return raw;
}

function notifySessionExpired() {
  accessToken = null;
  refreshToken = null;
  try {
    localStorage.removeItem("burnett_access_token");
    localStorage.removeItem("burnett_refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("resumeai-access-token");
    localStorage.removeItem("resumeai-refresh-token");
    localStorage.removeItem("resumeai-user");
  } catch {
    // ignore
  }
  if (typeof sessionExpiredHandler === "function") sessionExpiredHandler();
}

async function refreshSession() {
  if (refreshPromise) return refreshPromise;

  const oldRefreshToken = refreshToken || (typeof localStorage !== "undefined" ? (localStorage.getItem("burnett_refresh_token") || localStorage.getItem("refresh_token") || localStorage.getItem("resumeai-refresh-token")) : null);
  if (!oldRefreshToken) {
    notifySessionExpired();
    throw new ApiError("Your session has expired. Please sign in again.", { status: 401 });
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(buildUrl("/auth/token/refresh/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh: oldRefreshToken }),
      });
      const data = await readResponse(response);

      if (!response.ok || !data?.access) {
        throw makeApiError(response.status || 401, data, "Your session has expired. Please sign in again.");
      }

      accessToken = data.access;
      refreshToken = data.refresh || oldRefreshToken;
      try {
        localStorage.setItem("burnett_access_token", accessToken);
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("resumeai-access-token", accessToken);
        if (refreshToken) {
          localStorage.setItem("burnett_refresh_token", refreshToken);
          localStorage.setItem("refresh_token", refreshToken);
          localStorage.setItem("resumeai-refresh-token", refreshToken);
        }
      } catch {
        // ignore
      }
      return true;
    } catch (error) {
      notifySessionExpired();
      if (error instanceof ApiError) throw error;
      throw new ApiError("Could not refresh your session. Please sign in again.", { status: 401 });
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function headersFor(options, useAuth) {
  const headers = new Headers(options.headers || {});
  const body = options.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  
  if (body !== undefined || options.bodyFactory) {
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  
  const token = accessToken || (typeof localStorage !== "undefined" ? (localStorage.getItem("burnett_access_token") || localStorage.getItem("access_token") || localStorage.getItem("resumeai-access-token")) : null);
  if (useAuth && token) headers.set("Authorization", `Bearer ${token}`);
  else headers.delete("Authorization");
  return headers;
}

async function send(endpoint, method, rawOptions = {}) {
  const {
    auth = true,
    skipRefresh = false,
    retryAfterRefresh = false,
    bodyFactory,
    ...fetchOptions
  } = rawOptions;
  const url = buildUrl(endpoint);
  const normalizedMethod = method.toUpperCase();
  const requestAccessToken = accessToken;
  const runFetch = () => fetch(url, {
    ...fetchOptions,
    method: normalizedMethod,
    headers: headersFor({ ...fetchOptions, bodyFactory }, auth),
    ...(bodyFactory ? { body: bodyFactory() } : {}),
  });

  let response = await runFetch();
  const isAuthEndpoint = String(endpoint).includes("/auth/token/") || String(endpoint).includes("/auth/password-reset/") || String(endpoint).includes("/auth/activate/");

  if (
    response.status === 401 && auth && !skipRefresh && !isAuthEndpoint &&
    (requestAccessToken || accessToken) && refreshToken
  ) {
    if (accessToken === requestAccessToken) await refreshSession();
    if (SAFE_METHODS.has(normalizedMethod) || retryAfterRefresh) {
      response = await runFetch();
      if (response.status === 401) notifySessionExpired();
    } else {
      const originalData = await readResponse(response);
      throw makeApiError(
        401,
        originalData,
        "Your session was refreshed. Please submit this action again to avoid duplicate changes.",
      );
    }
  }

  const data = await readResponse(response);
  if (!response.ok) throw makeApiError(response.status, data);
  return data;
}

const apiClient = {
  setSessionTokens(tokens) {
    accessToken = tokens?.access || null;
    refreshToken = tokens?.refresh || null;
    try {
      if (tokens?.access) {
        localStorage.setItem("burnett_access_token", tokens.access);
        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("resumeai-access-token", tokens.access);
      }
      if (tokens?.refresh) {
        localStorage.setItem("burnett_refresh_token", tokens.refresh);
        localStorage.setItem("refresh_token", tokens.refresh);
        localStorage.setItem("resumeai-refresh-token", tokens.refresh);
      }
    } catch {
      // ignore
    }
  },

  clearSession() {
    accessToken = null;
    refreshToken = null;
    try {
      localStorage.removeItem("burnett_access_token");
      localStorage.removeItem("burnett_refresh_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("resumeai-access-token");
      localStorage.removeItem("resumeai-refresh-token");
      localStorage.removeItem("resumeai-user");
      sessionStorage.removeItem("resumeai-access-token");
      sessionStorage.removeItem("resumeai-refresh-token");
    } catch {
      // ignore
    }
  },

  getAccessToken() {
    if (!accessToken && typeof localStorage !== "undefined") {
      accessToken = localStorage.getItem("burnett_access_token") || localStorage.getItem("access_token") || localStorage.getItem("resumeai-access-token") || null;
    }
    return accessToken;
  },

  getRefreshToken() {
    if (!refreshToken && typeof localStorage !== "undefined") {
      refreshToken = localStorage.getItem("burnett_refresh_token") || localStorage.getItem("refresh_token") || localStorage.getItem("resumeai-refresh-token") || null;
    }
    return refreshToken;
  },

  setSessionExpiredHandler(handler) {
    sessionExpiredHandler = typeof handler === "function" ? handler : null;
  },

  get(endpoint, options = {}) {
    return send(endpoint, "GET", options);
  },

  post(endpoint, body, options = {}) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return send(endpoint, "POST", {
      ...options,
      body: body === undefined ? undefined : (isFormData ? body : (typeof body === 'string' ? body : JSON.stringify(body))),
    });
  },

  put(endpoint, body, options = {}) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return send(endpoint, "PUT", {
      ...options,
      body: body === undefined ? undefined : (isFormData ? body : (typeof body === 'string' ? body : JSON.stringify(body))),
    });
  },

  patch(endpoint, body, options = {}) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return send(endpoint, "PATCH", {
      ...options,
      body: body === undefined ? undefined : (isFormData ? body : (typeof body === 'string' ? body : JSON.stringify(body))),
    });
  },

  delete(endpoint, options = {}) {
    return send(endpoint, "DELETE", options);
  },

  logout() {
    return send("/auth/logout/", "POST", {
      retryAfterRefresh: true,
      bodyFactory: () => JSON.stringify({ refresh: refreshToken }),
    });
  },
};

export default apiClient;
