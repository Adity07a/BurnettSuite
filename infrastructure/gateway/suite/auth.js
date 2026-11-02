(() => {
  function errorText(value) {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(errorText).join(" ");
    if (value && typeof value === "object") return Object.values(value).map(errorText).join(" ");
    return "Unable to complete the request.";
  }

  function safeNext() {
    const requested = new URLSearchParams(location.search).get("next");
    if (!requested) return window.BurnettSuite.urls.platform;
    try {
      const target = new URL(requested, location.origin);
      const allowed = Object.values(window.BurnettSuite.urls).some((url) => target.origin === new URL(url).origin);
      return allowed ? target.href : window.BurnettSuite.urls.platform;
    } catch {
      return window.BurnettSuite.urls.platform;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const mode = location.pathname === "/register" ? "register" : location.pathname === "/login" ? "login" : null;
    if (!mode) return;
    const home = document.getElementById("platform-home");
    if (home) home.hidden = true;
    const page = document.createElement("main");
    page.className = "suite-auth-page";
    const registerFields = mode === "register" ? `<label for="full_name">Full name</label><input id="full_name" name="full_name" autocomplete="name" required><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required><label for="mobile">Mobile number</label><input id="mobile" name="mobile" autocomplete="tel"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="new-password" required><label for="confirm_password">Confirm password</label><input id="confirm_password" name="confirm_password" type="password" autocomplete="new-password" required>` : `<label for="identifier">Email or mobile number</label><input id="identifier" name="identifier" autocomplete="username" required><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>`;
    page.innerHTML = `<section class="suite-auth-card"><h1>${mode === "register" ? "Create one account" : "Welcome back"}</h1><p>${mode === "register" ? "Your BurnettSuite account works across all three products." : "Sign in once to use AI Interview, AI Resume Creator, and Burnett People."}</p><form>${registerFields}<div class="suite-auth-error" role="alert" hidden></div><button type="submit">${mode === "register" ? "Create account" : "Login to BurnettSuite"}</button></form><p class="suite-auth-switch">${mode === "register" ? `Already registered? <a href="${window.BurnettSuite.loginUrl(safeNext())}">Login</a>` : `Need an account? <a href="${window.BurnettSuite.registerUrl(safeNext())}">Register</a>`}</p></section>`;
    document.body.insertBefore(page, document.getElementById("burnett-suite-footer"));
    page.querySelector("form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector("button");
      const error = form.querySelector(".suite-auth-error");
      button.disabled = true;
      error.hidden = true;
      const payload = Object.fromEntries(new FormData(form));
      try {
        const response = await fetch(`/api/suite-auth/${mode}/`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(errorText(data));
        location.assign(safeNext());
      } catch (requestError) {
        error.textContent = requestError.message;
        error.hidden = false;
      } finally {
        button.disabled = false;
      }
    });
  });
})();
