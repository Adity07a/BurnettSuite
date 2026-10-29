import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import apiClient, { ApiError } from "./client.js";

function fakeResponse(status, data, contentType = "application/json") {
  const raw = data === null || data === undefined ? "" : (typeof data === "string" ? data : JSON.stringify(data));
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (name) => name.toLowerCase() === "content-type" ? contentType : null },
    text: async () => raw,
  };
}

let originalFetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  apiClient.clearSession();
  apiClient.setSessionExpiredHandler(null);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  apiClient.clearSession();
  apiClient.setSessionExpiredHandler(null);
});

test("uses the shared HttpOnly cookie for protected requests", async () => {
  globalThis.fetch = async (_url, options) => {
    assert.equal(new Headers(options.headers).get("Authorization"), null);
    assert.equal(options.credentials, "include");
    return fakeResponse(200, { ok: true });
  };
  assert.deepEqual(await apiClient.get("/auth/me/"), { ok: true });
});

test("preserves DRF field validation errors", async () => {
  globalThis.fetch = async () => fakeResponse(400, {
    employee_code: ["This employee code already exists."],
    detail: "Validation failed.",
  });
  await assert.rejects(apiClient.post("/employees/", {}), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 400);
    assert.equal(error.fieldErrors.employee_code[0], "This employee code already exists.");
    return true;
  });
});

test("handles a 205 empty logout response", async () => {
  apiClient.setSessionTokens({ access: "access-test", refresh: "refresh-test" });
  globalThis.fetch = async () => fakeResponse(205, null);
  assert.equal(await apiClient.logout(), null);
});

test("coalesces concurrent refresh attempts and retries safe GET requests", async () => {
  let refreshCalls = 0;
  const attempts = new Map();
  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith("/api/suite-auth/refresh/")) {
      refreshCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return fakeResponse(200, { detail: "Session refreshed." });
    }
    const auth = new Headers(options.headers).get("Authorization");
    assert.equal(auth, null);
    const count = attempts.get(String(url)) || 0;
    attempts.set(String(url), count + 1);
    if (count === 0) return fakeResponse(401, { detail: "Session expired" });
    return fakeResponse(200, { ok: true });
  };

  const [one, two] = await Promise.all([apiClient.get("/auth/me/"), apiClient.get("/employees/")]);
  assert.deepEqual(one, { ok: true });
  assert.deepEqual(two, { ok: true });
  assert.equal(refreshCalls, 1);
  assert.equal(apiClient.getRefreshToken(), null);
});

test("does not automatically replay a non-idempotent POST after refreshing", async () => {
  let postCalls = 0;
  globalThis.fetch = async (url) => {
    if (String(url).endsWith("/api/suite-auth/refresh/")) {
      return fakeResponse(200, { detail: "Session refreshed." });
    }
    if (String(url).endsWith("/employees/")) {
      postCalls += 1;
      return fakeResponse(401, { detail: "Access token expired" });
    }
    throw new Error("Unexpected request");
  };

  await assert.rejects(apiClient.post("/employees/", { employee_code: "BP005" }), (error) => {
    assert.equal(error.status, 401);
    assert.match(error.message, /submit this action again/i);
    return true;
  });
  assert.equal(postCalls, 1);
  assert.equal(apiClient.getAccessToken(), null);
});
