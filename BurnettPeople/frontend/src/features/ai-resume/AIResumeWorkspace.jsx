import { useEffect, useState } from "react";
import DashboardOverview from "./DashboardOverview";
import ResumeBuilder from "./ResumeBuilder";
import JobDescription from "./JobDescription";
import SavedJDHistory from "./SavedJDHistory";
import ResumeTemplatesGallery from "./ResumeTemplatesGallery";
import GapAnalysisPage from "./GapAnalysisPage";
import ResumeProfilePage from "./ResumeProfilePage";
import burnettLogo from "../../assets/burnettpeople-logo.png";
import "./AIResume.css";

export default function AIResumeWorkspace({ user, onBackToBurnett, initialPage = "dashboard" }) {
  const [activePage, setActivePage] = useState(initialPage);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.getAttribute("data-theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [darkMode]);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: "create",
      label: "Create Resume",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      id: "builder",
      label: "Resume Builder",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      id: "job-description",
      label: "Job Description",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      id: "saved-jd",
      label: "Saved JD History",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "templates",
      label: "Templates",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
    },
    {
      id: "analysis",
      label: "Gap Analysis",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const handleNavClick = (id) => {
    if (id === "create") {
      setActivePage("builder");
    } else {
      setActivePage(id);
    }
  };

  const userName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "Mayank Joshi";
  const userInitials = user?.first_name ? user.first_name[0] + (user.last_name?.[0] || "") : "MJ";
  const userRole = user?.role || "Employee";

  return (
    <div className="air-container">
      {/* Sub-Sidebar */}
      <aside className="air-subsidebar">
        <div>
          {/* Brand Box */}
          <div className="air-subsidebar-brand">
            <div className="air-brand-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="air-brand-titles">
              <h3>AI Resume Creator</h3>
              <p>Build. Tailor. Get Hired.</p>
            </div>
          </div>

          <div className="air-workspace-label">Workspace</div>

          {/* Navigation Links */}
          <nav className="air-nav-list">
            {navItems.map((item) => {
              const isCurrent =
                activePage === item.id || (item.id === "create" && activePage === "builder");
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`air-nav-item ${isCurrent ? "active" : ""}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="air-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: Dark Mode & Back to BurnettPeople */}
        <div className="air-subsidebar-footer">
          <div className="air-theme-row">
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              Dark Mode
            </span>
            <label className="air-switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="air-slider" />
            </label>
          </div>

          <button
            type="button"
            className="air-back-button"
            onClick={onBackToBurnett}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to BurnettPeople
          </button>
        </div>
      </aside>

      {/* Main Workspace View */}
      <div className="air-workspace">
        {/* Topbar */}
        <header className="air-topbar">
          <div className="air-topbar-brand">
            <img src={burnettLogo} alt="BurnettPeople" style={{ height: "30px", objectFit: "contain" }} />
          </div>

          <div className="air-topbar-search">
            <span className="air-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search for people, documents, or anything..."
            />
          </div>

          <div className="air-topbar-actions">
            <button type="button" className="air-notification-bell" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="air-notification-badge">3</span>
            </button>

            <div className="air-topbar-profile">
              <div className="air-topbar-avatar">{userInitials}</div>
              <div className="air-topbar-user-info">
                <strong>{userName}</strong>
                <small>{userRole}</small>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </header>

        {/* Content Body Router */}
        {activePage === "dashboard" && (
          <DashboardOverview onNavigate={setActivePage} user={user} />
        )}
        {activePage === "builder" && (
          <ResumeBuilder
            user={user}
            templateParam={selectedTemplate}
            onNavigate={setActivePage}
          />
        )}
        {activePage === "job-description" && (
          <JobDescription onNavigate={setActivePage} user={user} />
        )}
        {activePage === "saved-jd" && (
          <SavedJDHistory onNavigate={setActivePage} user={user} />
        )}
        {activePage === "templates" && (
          <ResumeTemplatesGallery
            onNavigate={setActivePage}
            onSelectTemplate={(templateId) => {
              setSelectedTemplate(templateId);
              setActivePage("builder");
            }}
          />
        )}
        {activePage === "analysis" && (
          <GapAnalysisPage onNavigate={setActivePage} user={user} />
        )}
        {activePage === "profile" && (
          <ResumeProfilePage onNavigate={setActivePage} user={user} />
        )}
      </div>
    </div>
  );
}
