(() => {
  const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);
  const suffix = location.hostname.split(".").slice(1).join(".");
  const urls = isLocal
    ? { platform: `${location.protocol}//${location.hostname}`, interview: `${location.protocol}//${location.hostname}:8081`, resume: `${location.protocol}//${location.hostname}:8082`, people: `${location.protocol}//${location.hostname}:8083` }
    : { platform: `${location.protocol}//platform.${suffix}`, interview: `${location.protocol}//interview.${suffix}`, resume: `${location.protocol}//resume.${suffix}`, people: `${location.protocol}//people.${suffix}` };

  window.BurnettSuite = {
    urls,
    loginUrl(next = location.href) {
      return `${urls.platform}/login?next=${encodeURIComponent(next)}`;
    },
    registerUrl(next = location.href) {
      return `${urls.platform}/register?next=${encodeURIComponent(next)}`;
    },
    async refresh() {
      const response = await fetch("/api/suite-auth/refresh/", { method: "POST", credentials: "include" });
      return response.ok;
    },
    async logout() {
      await fetch("/api/suite-auth/logout/", { method: "POST", credentials: "include" }).catch(() => null);
      location.assign(urls.platform);
    },
  };

  async function session() {
    let response = await fetch("/api/suite-auth/session/", { credentials: "include" });
    if (response.status === 401 && await window.BurnettSuite.refresh()) {
      response = await fetch("/api/suite-auth/session/", { credentials: "include" });
    }
    return response.ok ? response.json() : null;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    if (document.getElementById("burnett-suite-header")) return;
    const header = document.createElement("header");
    header.id = "burnett-suite-header";
    header.innerHTML = `<a class="suite-brand" href="${urls.platform}">BurnettSuite</a><nav aria-label="Products"><a href="${urls.interview}/dashboard">AI Interview</a><a href="${urls.resume}/dashboard">AI Resume Creator</a><a href="${urls.people}">Burnett People</a></nav><div class="suite-auth"><span class="suite-user" hidden></span><a class="suite-login" href="${window.BurnettSuite.loginUrl()}">Login</a><a class="suite-register suite-primary" href="${window.BurnettSuite.registerUrl()}">Register</a><button class="suite-logout" type="button" hidden>Logout</button></div>`;
    document.body.prepend(header);
    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--burnett-suite-header-height",
        `${header.offsetHeight}px`,
      );
    };
    syncHeaderHeight();
    if ("ResizeObserver" in window) {
      new ResizeObserver(syncHeaderHeight).observe(header);
    } else {
      window.addEventListener("resize", syncHeaderHeight);
    }
    const footer = document.createElement("footer");
    footer.id = "burnett-suite-footer";
    footer.innerHTML = `<span>&copy; 2026 BurnettSuite. One account across all products.</span><span><a href="${urls.platform}">Platform home</a></span>`;
    document.body.append(footer);

    const user = await session().catch(() => null);
    if (user) {
      header.querySelector(".suite-user").textContent = user.email;
      header.querySelector(".suite-user").hidden = false;
      header.querySelector(".suite-login").hidden = true;
      header.querySelector(".suite-register").hidden = true;
      header.querySelector(".suite-logout").hidden = false;
    }
    header.querySelector(".suite-logout").addEventListener("click", () => window.BurnettSuite.logout());
  });
})();
