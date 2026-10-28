import { useEffect, useState } from "react";
import InterviewDashboard from "./InterviewDashboard";
import MyResumePage from "./MyResumePage";
import InterviewHistoryPage from "./InterviewHistoryPage";
import InterviewPerformancePage from "./InterviewPerformancePage";
import InterviewSetupPage from "./InterviewSetupPage";
import InterviewRoomPage from "./InterviewRoomPage";
import InterviewReportPage from "./InterviewReportPage";
import InterviewAssistantPage from "./InterviewAssistantPage";
import "./AIInterview.css";

export default function AIInterviewWorkspace({ user, onBackToBurnett, initialPage = "dashboard" }) {
  const [activePage, setActivePage] = useState(initialPage);
  const [sessionData, setSessionData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Secondary AI Interview Navigation items
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "resume",
      label: "My Resume",
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
      id: "interviews",
      label: "Interviews",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      ),
    },
    {
      id: "performance",
      label: "Performance",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: "setup",
      label: "AI Interview Assistant",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16.01" />
          <line x1="16" y1="16" x2="16" y2="16.01" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const handleStartInterview = (config) => {
    setSessionData(config);
    setActivePage("room");
  };

  const handleFinishInterview = (results) => {
    setSessionData((prev) => ({ ...prev, ...results }));
    setActivePage("results");
  };

  const userName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "Mayank Joshi";
  const userInitials = user?.first_name ? user.first_name[0] + (user.last_name?.[0] || "") : "MJ";
  const userRole = user?.role || "Employee";

  return (
    <div className="aii-container">
      {/* Secondary AI Interview Sub-Sidebar */}
      <aside className="aii-subsidebar">
        <div>
          {/* Header Brand */}
          <div className="aii-subsidebar-brand">
            <div className="aii-brand-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20M17 5v14M7 5v14M22 10v4M2 10v4" />
              </svg>
            </div>
            <div className="aii-brand-titles">
              <h3>AI Interview Assistant</h3>
              <p>Practice. Prepare. Succeed.</p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="aii-nav-list">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`aii-nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                <span className="aii-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="aii-subsidebar-footer">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", fontSize: "13px", color: "var(--bpi-text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              Dark Mode
            </span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
          </div>

          <button
            type="button"
            className="aii-back-button"
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

      {/* 3. Main Workspace Area */}
      <div className="aii-workspace">
        {/* Topbar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 28px",
            background: "var(--bpi-card-bg)",
            borderBottom: "1px solid var(--bpi-card-border)",
            gap: "24px",
          }}
        >
          {/* Logo brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "#00d084",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "17px",
              }}
            >
              B
            </div>
            <strong style={{ fontSize: "18px", fontWeight: "800", color: "#002b28", letterSpacing: "-0.02em" }}>
              Burnett<span style={{ color: "#00a86b" }}>People</span>
            </strong>
          </div>

          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: "560px", position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--bpi-text-muted)", display: "flex" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search for people, documents, or anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px 8px 36px",
                borderRadius: "999px",
                border: "1px solid var(--bpi-card-border)",
                background: "var(--bpi-mint-bg)",
                color: "var(--bpi-text-dark)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Profile & Notifications */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
            {/* Notification Bell */}
            <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#ef4444",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: "bold",
                  width: "15px",
                  height: "15px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                3
              </span>
            </div>

            {/* User Avatar & Name */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#002b28",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                {userInitials}
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "13px", color: "var(--bpi-text-dark)" }}>{userName}</strong>
                <small style={{ display: "block", fontSize: "11px", color: "var(--bpi-text-muted)" }}>{userRole}</small>
              </div>
              <span style={{ fontSize: "12px", color: "var(--bpi-text-muted)" }}>▾</span>
            </div>
          </div>
        </header>

        {/* Content Body Router */}
        {activePage === "dashboard" && (
          <InterviewDashboard onNavigate={setActivePage} user={user} />
        )}
        {activePage === "resume" && (
          <MyResumePage />
        )}
        {(activePage === "interviews" || activePage === "history") && (
          <InterviewHistoryPage onNavigate={setActivePage} />
        )}
        {activePage === "performance" && (
          <InterviewPerformancePage onNavigate={setActivePage} />
        )}
        {activePage === "setup" && (
          <InterviewSetupPage
            onStartInterview={handleStartInterview}
            onNavigate={setActivePage}
          />
        )}
        {activePage === "room" && (
          <InterviewRoomPage
            sessionData={sessionData}
            onFinishInterview={handleFinishInterview}
            onNavigate={setActivePage}
          />
        )}
        {activePage === "results" && (
          <InterviewReportPage
            sessionData={sessionData}
            onNavigate={setActivePage}
          />
        )}
        {activePage === "assistant" && (
          <InterviewAssistantPage />
        )}
        {activePage === "settings" && (
          <div className="aii-content-wrap">
            <div className="aii-breadcrumbs">
              <span>AI Services</span> / <span>AI Interview Assistant</span> / <span>Settings</span>
            </div>
            <div className="aii-page-header-row">
              <div className="aii-page-title-box">
                <h1>Interview Preferences &amp; Settings</h1>
                <p>Configure audio devices, evaluation difficulty, and AI interview feedback detail.</p>
              </div>
            </div>
            <div className="aii-resume-card-box" style={{ maxWidth: "680px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Preferred Interview Difficulty
                  </label>
                  <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--bpi-card-border)", background: "var(--bpi-mint-bg)", color: "var(--bpi-text-dark)" }}>
                    <option>Adaptive (Adjusts dynamically)</option>
                    <option>Standard / Mid-Level</option>
                    <option>Senior / Staff Level</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Feedback Detail Level
                  </label>
                  <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--bpi-card-border)", background: "var(--bpi-mint-bg)", color: "var(--bpi-text-dark)" }}>
                    <option>Comprehensive (Strengths, Gaps, Better Model Answers)</option>
                    <option>Quick Summary Only</option>
                  </select>
                </div>
                <button type="button" className="aii-btn-primary" style={{ alignSelf: "flex-start", marginTop: "10px" }}>
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
