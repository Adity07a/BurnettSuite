import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

const TypingHeadline = lazy(() => import("./TypingHeadline"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const HRDashboard = lazy(() => import("./HRDashboard"));
const EmployeeDashboard = lazy(() => import("./EmployeeDashboard"));
const ManagerDashboard = lazy(() => import("./ManagerDashboard"));
const EmployeeList = lazy(() => import("./EmployeeList"));
const EmployeeForm = lazy(() => import("./EmployeeForm"));
const EmployeeProfile = lazy(() => import("./EmployeeMyProfile"));
const EmployeeActivation = lazy(() => import("./EmployeeActivation"));
const PasswordResetPage = lazy(() => import("./pages/PasswordResetPage"));
const CandidateRegisterPage = lazy(() => import("./pages/CandidateRegisterPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ForbiddenPage = lazy(() => import("./pages/ForbiddenPage"));
const ServerErrorPage = lazy(() => import("./pages/ServerErrorPage"));
const RouteErrorBoundary = lazy(() => import("./components/RouteErrorBoundary"));

// Resume Creator Feature Pages
const ResumeDashboard = lazy(() => import("./features/resume_creator/pages/ResumeDashboard"));
const CreateResume = lazy(() => import("./features/resume_creator/pages/CreateResume"));
const ResumeBuilder = lazy(() => import("./features/resume_creator/pages/ResumeBuilder"));
const Templates = lazy(() => import("./features/resume_creator/pages/Templates"));
const JobDescription = lazy(() => import("./features/resume_creator/pages/JobDescription"));
const SavedJDHistory = lazy(() => import("./features/resume_creator/pages/SavedJDHistory"));
const GapAnalysis = lazy(() => import("./features/resume_creator/pages/GapAnalysis"));
const OptimizationWorkspace = lazy(() => import("./features/resume_creator/pages/OptimizationWorkspace"));
const Profile = lazy(() => import("./features/resume_creator/pages/Profile"));

// Interview Platform Feature Pages
const InterviewDashboard = lazy(() => import("./features/interview_platform/pages/InterviewDashboard"));
const InterviewSetup = lazy(() => import("./features/interview_platform/pages/InterviewSetup"));
const InterviewRoom = lazy(() => import("./features/interview_platform/pages/InterviewRoom"));
const InterviewResult = lazy(() => import("./features/interview_platform/pages/InterviewResult"));
const Interviews = lazy(() => import("./features/interview_platform/pages/Interviews"));
const Performance = lazy(() => import("./features/interview_platform/pages/Performance"));
const InterviewAssistant = lazy(() => import("./features/interview_platform/pages/InterviewAssistant"));
const CandidateResumeUpload = lazy(() => import("./features/interview_platform/pages/CandidateResumeUpload"));
const InterviewSettings = lazy(() => import("./features/interview_platform/pages/Settings"));
const InterviewAdminDashboard = lazy(() => import("./features/interview_platform/pages/InterviewAdminDashboard"));

import SuiteBar from "./components/SuiteBar";
import apiClient from "./api/client";
import { ROLE_HOME, homeForUser } from "./config/roles";

import "./App.css";
import "./auth.css";
import burnettLogo from "./assets/burnettpeople-logo.png";
import loginDarkTeal from "./assets/login-dark-teal.png";
import loginSoftMint from "./assets/login-soft-mint.png";

function ThemeToggle({ theme, onToggle }) {
  const dark = theme === "dark";

  return (
    <button
      type="button"
      className="global-theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span aria-hidden="true">{dark ? "☀" : "☾"}</span>
    </button>
  );
}

function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const user = await onLogin(email.trim(), password);
      navigate(homeForUser(user), { replace: true });
    } catch (requestError) {
      setError(
        requestError?.message || "Unable to sign in. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section
        className="brand-panel"
        style={{
          backgroundImage: `url(${loginDarkTeal})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="brand-top">
          <img
            src={burnettLogo}
            alt="BurnettSuite logo"
            className="brand-image"
          />
        </div>

        <div className="brand-content">
          <div className="eyebrow">
            <span className="live-dot" />
            YOUR PEOPLE. YOUR FUTURE.
          </div>

          <h1 className="hero-title">
            Great people
            <br />
            build <TypingHeadline />
          </h1>

          <p className="brand-description">
            A unified suite for HR management, AI-powered resume creation,
            and realistic mock interview practice. All in one simple, elegant place.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">🏢</div>
              <div>
                <strong>BurnettPeople HRMS</strong>
                <p>People, attendance, leave, performance and organization.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📄</div>
              <div>
                <strong>AI Resume Creator</strong>
                <p>ATS scoring, instant bullet optimization, and export templates.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🎙️</div>
              <div>
                <strong>AI Interview Platform</strong>
                <p>Realistic technical &amp; behavioral mock interviews with live evaluation.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-bottom">
          <div className="avatar-stack">
            <span>D</span>
            <span>M</span>
            <span>A</span>
            <span>R</span>
          </div>

          <p>
            <strong>People first, always.</strong>
            <br />
            A unified workplace and career platform for everyone.
          </p>
        </div>

        <div className="decor decor-one" />
        <div className="decor decor-two" />
      </section>

      <section
        className="form-panel"
        style={{
          backgroundImage: `url(${loginSoftMint})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mobile-brand">
          <img
            src={burnettLogo}
            alt="BurnettSuite logo"
            className="brand-image"
          />
        </div>

        <div className="login-card">
          <div className="welcome-tag">WELCOME TO BURNETTSUITE</div>
          <h2>Sign in to your account</h2>
          <p className="form-subtitle">
            Access HRMS, AI Resume Creator &amp; Interview Platform.
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Work or Candidate Email</label>

            <div className="input-wrap">
              <span className="input-icon">✉</span>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="password-label">
              <label htmlFor="password">Password</label>
            </div>

            <div className="input-wrap password-wrap">
              <span className="input-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error && (
              <div role="alert" className="employee-form-error">
                {error}
              </div>
            )}

            <div
              className="forgot-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "12px",
              }}
            >
              <button
                className="text-button"
                type="button"
                onClick={() => navigate("/password-reset")}
              >
                Forgot Password?
              </button>
              <button
                className="text-button"
                type="button"
                style={{ fontWeight: "600", color: "#006666" }}
                onClick={() => navigate("/register")}
              >
                Candidate Sign Up →
              </button>
            </div>

            <button
              className="sign-in-button"
              type="submit"
              disabled={busy}
              style={{ marginTop: "16px" }}
            >
              {busy ? "Signing in…" : "Sign in to BurnettSuite"}{" "}
              <span>→</span>
            </button>
          </form>

          <div className="security-note" style={{ marginTop: "16px" }}>
            <span>🔒</span>
            Your session is secured with central BurnettSuite authentication.
          </div>
        </div>

        <footer className="form-footer">
          <span>© 2026 BurnettSuite</span>
          <div>
            <a href="#privacy">Privacy</a>
            <a href="#help">Help &amp; Support</a>
          </div>
        </footer>
      </section>
    </main>
  );
}

function RequireRole({ user, roles, children }) {
  if (!user) return <Navigate to="/" replace />;
  if (!roles.includes(user.role)) {
    return <ForbiddenPage user={user} />;
  }
  return children;
}

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes({ user, onLogin, onLogout }) {
  const home = homeForUser(user);
  const peopleRoles = ["ADMIN", "HR"];

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={home} replace />
          ) : (
            <LoginPage onLogin={onLogin} />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={home} replace />
          ) : (
            <CandidateRegisterPage
              onLoginSuccess={(u) => {
                // login handled
              }}
            />
          )
        }
      />

      <Route
        path="/password-reset"
        element={
          user ? (
            <Navigate to={home} replace />
          ) : (
            <PasswordResetPage />
          )
        }
      />

      <Route path="/activate-account" element={<EmployeeActivation />} />
      <Route path="/activate" element={<EmployeeActivation />} />

      {/* HRMS Suite Routes */}
      <Route
        path="/employee"
        element={
          <RequireRole user={user} roles={["EMPLOYEE"]}>
            <EmployeeDashboard user={user} onLogout={onLogout} />
          </RequireRole>
        }
      />

      <Route
        path="/hr"
        element={
          <RequireRole user={user} roles={["HR"]}>
            <HRDashboard user={user} onLogout={onLogout} />
          </RequireRole>
        }
      />

      <Route
        path="/manager"
        element={
          <RequireRole user={user} roles={["MANAGER"]}>
            <ManagerDashboard user={user} onLogout={onLogout} />
          </RequireRole>
        }
      />

      <Route
        path="/admin/*"
        element={
          <RequireRole user={user} roles={["ADMIN"]}>
            <AdminDashboard user={user} onLogout={onLogout} />
          </RequireRole>
        }
      />

      <Route
        path="/employees"
        element={
          <RequireRole user={user} roles={peopleRoles}>
            <EmployeeList />
          </RequireRole>
        }
      />

      <Route
        path="/employees/new"
        element={
          <RequireRole user={user} roles={peopleRoles}>
            <EmployeeForm />
          </RequireRole>
        }
      />

      <Route
        path="/employees/:id"
        element={
          <RequireRole user={user} roles={peopleRoles}>
            <EmployeeProfile />
          </RequireRole>
        }
      />

      {/* AI Resume Creator Routes */}
      <Route
        path="/resume-creator"
        element={
          <RequireAuth user={user}>
            <ResumeDashboard user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth user={user}>
            <ResumeDashboard user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/resume-creator/create"
        element={
          <RequireAuth user={user}>
            <CreateResume user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/create-resume"
        element={
          <RequireAuth user={user}>
            <CreateResume user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/resume-creator/builder"
        element={
          <RequireAuth user={user}>
            <ResumeBuilder user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/resume-builder"
        element={
          <RequireAuth user={user}>
            <ResumeBuilder user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/resume-creator/templates"
        element={
          <RequireAuth user={user}>
            <Templates user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/templates"
        element={
          <RequireAuth user={user}>
            <Templates user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/resume-creator/job-description"
        element={
          <RequireAuth user={user}>
            <JobDescription user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/job-description"
        element={
          <RequireAuth user={user}>
            <JobDescription user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/resume-creator/job-description/history"
        element={
          <RequireAuth user={user}>
            <SavedJDHistory user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/saved-jd-history"
        element={
          <RequireAuth user={user}>
            <SavedJDHistory user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/resume-creator/gap-analysis"
        element={
          <RequireAuth user={user}>
            <GapAnalysis user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/analysis"
        element={
          <RequireAuth user={user}>
            <GapAnalysis user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/resume-creator/optimization"
        element={
          <RequireAuth user={user}>
            <OptimizationWorkspace user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/optimization"
        element={
          <RequireAuth user={user}>
            <OptimizationWorkspace user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/resume-creator/profile"
        element={
          <RequireAuth user={user}>
            <Profile user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth user={user}>
            <Profile user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />

      {/* AI Interview Platform Routes */}
      <Route
        path="/interview-platform"
        element={
          <RequireAuth user={user}>
            <InterviewDashboard user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-platform/setup"
        element={
          <RequireAuth user={user}>
            <InterviewSetup user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-setup"
        element={
          <RequireAuth user={user}>
            <InterviewSetup user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-platform/room/:id"
        element={
          <RequireAuth user={user}>
            <InterviewRoom user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview/:id"
        element={
          <RequireAuth user={user}>
            <InterviewRoom user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-platform/results/:id"
        element={
          <RequireAuth user={user}>
            <InterviewResult user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-result/:id"
        element={
          <RequireAuth user={user}>
            <InterviewResult user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-platform/history"
        element={
          <RequireAuth user={user}>
            <Interviews user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interviews"
        element={
          <RequireAuth user={user}>
            <Interviews user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-platform/performance"
        element={
          <RequireAuth user={user}>
            <Performance user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/performance"
        element={
          <RequireAuth user={user}>
            <Performance user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-platform/assistant"
        element={
          <RequireAuth user={user}>
            <InterviewAssistant user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/assistant"
        element={
          <RequireAuth user={user}>
            <InterviewAssistant user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-platform/resume-upload"
        element={
          <RequireAuth user={user}>
            <CandidateResumeUpload user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/resume"
        element={
          <RequireAuth user={user}>
            <CandidateResumeUpload user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-platform/settings"
        element={
          <RequireAuth user={user}>
            <InterviewSettings user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth user={user}>
            <InterviewSettings user={user} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/interview-platform/admin"
        element={
          <RequireRole user={user} roles={["ADMIN"]}>
            <InterviewAdminDashboard user={user} onLogout={onLogout} />
          </RequireRole>
        }
      />

      {/* Error pages */}
      <Route path="/forbidden" element={<ForbiddenPage user={user} />} />
      <Route path="/server-error" element={<ServerErrorPage user={user} />} />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage user={user} />} />
    </Routes>
  );
}

function GuardedRoutes(props) {
  const location = useLocation();

  return (
    <RouteErrorBoundary
      resetKey={location.key}
      fallback={(reset) => <ServerErrorPage user={props.user} onReset={reset} />}
    >
      <AppRoutes {...props} />
    </RouteErrorBoundary>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loadingInitialUser, setLoadingInitialUser] = useState(true);

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("burnettpeople-theme") === "dark"
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("burnettpeople-theme", theme);
    } catch {
      // theme works for session
    }
  }, [theme]);

  // Rehydrate user on refresh if tokens exist
  useEffect(() => {
    const token = apiClient.getAccessToken();
    if (token) {
      apiClient
        .get("/auth/me/")
        .then((profile) => {
          if (profile?.id && profile?.role && profile.is_active === true) {
            setUser(profile);
          } else {
            apiClient.clearSession();
            setUser(null);
          }
        })
        .catch(() => {
          apiClient.clearSession();
          setUser(null);
        })
        .finally(() => {
          setLoadingInitialUser(false);
        });
    } else {
      setLoadingInitialUser(false);
    }

    apiClient.setSessionExpiredHandler(() => setUser(null));
    return () => apiClient.setSessionExpiredHandler(null);
  }, []);

  async function handleLogin(email, password) {
    const tokens = await apiClient.post(
      "/auth/token/",
      { email, password },
      { auth: false, skipRefresh: true }
    );

    if (!tokens?.access || !tokens?.refresh) {
      throw new Error(
        "The login endpoint did not return both access and refresh tokens."
      );
    }

    apiClient.setSessionTokens(tokens);

    try {
      const profile = await apiClient.get("/auth/me/");

      if (!profile?.id || !profile?.role || profile.is_active !== true) {
        throw new Error("The server did not return an active user profile.");
      }

      if (!ROLE_HOME[profile.role]) {
        throw new Error(
          "Your account has an unsupported role. Please contact administrator."
        );
      }

      setUser(profile);
      return profile;
    } catch (error) {
      apiClient.clearSession();
      setUser(null);
      throw error;
    }
  }

  async function handleLogout() {
    try {
      if (apiClient.getRefreshToken()) {
        await apiClient.logout();
      }
    } catch {
      // Always clear session
    } finally {
      apiClient.clearSession();
      setUser(null);
    }
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  if (loadingInitialUser) {
    return (
      <div className="app-boot" role="status">
        Loading BurnettSuite…
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user && <SuiteBar user={user} onLogout={handleLogout} />}
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <Suspense fallback={<div className="app-boot" role="status">Loading BurnettSuite…</div>}>
        <GuardedRoutes user={user} onLogin={handleLogin} onLogout={handleLogout} />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
