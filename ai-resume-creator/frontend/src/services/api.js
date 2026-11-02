const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

function getAccessToken() {
  return null;
}

function clearTokens() {
  localStorage.removeItem("resumeai-access-token");
  localStorage.removeItem("resumeai-refresh-token");
  sessionStorage.removeItem("resumeai-access-token");
  sessionStorage.removeItem("resumeai-refresh-token");
  localStorage.removeItem("resumeai-user");
}

let refreshPromise = null;

async function refreshAccessToken() {
  // Multiple failed requests share the same refresh operation.
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`/api/suite-auth/refresh/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: "{}",
        });

        if (!response.ok) {
          clearTokens();
          return null;
        }
        return true;
      } 
      finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function sendRequest(path, options, token) {
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : options.body
        ? { "Content-Type": "application/json" }
        : {}),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    delete headers.Authorization;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  const result = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      result?.detail ||
      (result && JSON.stringify(result)) ||
      `Request failed (${response.status})`;

    throw new Error(message);
  }

  return result;
}

export async function apiRequest(path, options = {}) {
  let response = await sendRequest(path, options, getAccessToken());

  // Refresh and retry only when the API responds with 401 Unauthorized.
  if (response.status === 401 && !path.includes("/auth/refresh/")) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      response = await sendRequest(path, options, newToken);
    } else {
      clearTokens();
      window.location.assign(window.BurnettSuite?.loginUrl?.() || "/login");
      throw new Error("Session expired. Please log in again.");
    }
  }

  return parseResponse(response);
}
