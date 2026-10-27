import { Link, useLocation } from "react-router-dom";
import { userDisplayName, userInitials, roleLabel } from "../auth/userDisplay";
import { homeForUser } from "../config/roles";
import burnettLogo from "../assets/burnettpeople-logo.png";
import "./SuiteBar.css";

export default function SuiteBar({ user, onLogout }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isHRMSActive =
    currentPath.startsWith("/admin") ||
    currentPath.startsWith("/hr") ||
    currentPath.startsWith("/manager") ||
    currentPath.startsWith("/employee") ||
    currentPath.startsWith("/employees");

  const isResumeActive =
    currentPath.startsWith("/resume-creator") ||
    currentPath.startsWith("/resume-builder") ||
    currentPath.startsWith("/create-resume") ||
    currentPath.startsWith("/job-description") ||
    currentPath.startsWith("/saved-jd-history") ||
    currentPath.startsWith("/optimization");

  const isInterviewActive =
    currentPath.startsWith("/interview-platform") ||
    currentPath.startsWith("/interviews") ||
    currentPath.startsWith("/assistant") ||
    currentPath.startsWith("/performance");

  const isProfileActive =
    currentPath === "/resume-creator/profile" ||
    currentPath === "/profile";

  const showHRMS = user && user.role !== "CANDIDATE";

  return (
    <header className="burnett-suite-bar">
      <div className="suite-brand-zone">
        <Link to={homeForUser(user)} className="suite-brand-link">
          <img src={burnettLogo} alt="BurnettSuite" className="suite-brand-icon" />
          <div className="suite-brand-titles">
            <span className="suite-title">BurnettSuite</span>
            <span className="suite-subtitle">Unified Enterprise &amp; Career Hub</span>
          </div>
        </Link>
      </div>

      <nav className="suite-nav-tabs" aria-label="Suite Switcher">
        {showHRMS && (
          <Link
            to={homeForUser(user)}
            className={`suite-tab-btn ${isHRMSActive ? "active" : ""}`}
          >
            <span className="suite-tab-icon">🏢</span>
            <span>HRMS Workspace</span>
          </Link>
        )}

        <Link
          to="/resume-creator"
          className={`suite-tab-btn ${isResumeActive && !isProfileActive ? "active" : ""}`}
        >
          <span className="suite-tab-icon">📄</span>
          <span>Resume Creator</span>
        </Link>

        <Link
          to="/interview-platform"
          className={`suite-tab-btn ${isInterviewActive ? "active" : ""}`}
        >
          <span className="suite-tab-icon">🎙️</span>
          <span>Interview Platform</span>
        </Link>

        <Link
          to="/resume-creator/profile"
          className={`suite-tab-btn ${isProfileActive ? "active" : ""}`}
        >
          <span className="suite-tab-icon">👤</span>
          <span>Career Profile</span>
        </Link>
      </nav>

      <div className="suite-user-zone">
        <div className="suite-user-meta">
          <span className="suite-avatar-circle">{userInitials(user)}</span>
          <div className="suite-user-texts">
            <span className="suite-user-name">{userDisplayName(user)}</span>
            <span className="suite-user-role">{roleLabel(user?.role)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="suite-logout-button"
          title="Sign out of BurnettSuite"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
