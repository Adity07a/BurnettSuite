import { useState } from "react";

export default function DashboardOverview({ onNavigate, user }) {
  const [activeTab, setActiveTab] = useState("all");
  const userName = user?.first_name || (user?.email ? user.email.split("@")[0] : "Mayank");

  const STATS = [
    {
      label: "Total Resumes",
      value: 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      label: "AI Resumes",
      value: 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
        </svg>
      ),
    },
    {
      label: "Manual Drafts",
      value: 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
  ];

  const QUICK_ACTIONS = [
    {
      title: "Create New Resume",
      desc: "Start from scratch with AI or a template.",
      action: () => onNavigate("builder"),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
    },
    {
      title: "Resume Builder",
      desc: "Edit and customize your resume.",
      action: () => onNavigate("builder"),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      title: "Use a Job Description",
      desc: "Tailor your resume for a specific role.",
      action: () => onNavigate("job-description"),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      title: "Browse Templates",
      desc: "Choose from professional templates.",
      action: () => onNavigate("templates"),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
    },
  ];

  return (
    <div className="air-content-wrap">
      {/* Breadcrumbs */}
      <div className="air-breadcrumbs">
        <span>AI Resume Creator</span> / <span>Workspace</span> / <span>Dashboard Overview</span>
      </div>

      {/* Header */}
      <div className="air-page-header-row">
        <div className="air-page-title-box">
          <h1>Dashboard Overview</h1>
          <p>Manage your career documents, check stats, and build your next winning resume.</p>
        </div>
      </div>

      {/* Hero Welcome Card */}
      <div className="air-hero-card">
        <div className="air-hero-card-content">
          <span className="air-eyebrow">WELCOME BACK, {userName.toUpperCase()}!</span>
          <h2>Your Resume Command Center</h2>
          <p>Manage your career documents, check stats, and build your next winning resume.</p>
          <button type="button" className="air-btn-primary" onClick={() => onNavigate("builder")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create New Resume
          </button>
        </div>
        <div className="air-hero-graphic">
          <svg viewBox="0 0 200 130" fill="none" width="100%" height="100%">
            <rect x="30" y="15" width="120" height="90" rx="8" fill="#e6f7f0" stroke="#059669" strokeWidth="2" />
            <circle cx="65" cy="45" r="14" fill="#059669" opacity="0.2" />
            <circle cx="65" cy="45" r="8" fill="#059669" />
            <rect x="90" y="38" width="45" height="6" rx="3" fill="#059669" />
            <rect x="90" y="50" width="30" height="5" rx="2.5" fill="#64748b" opacity="0.6" />
            <line x1="50" y1="75" x2="130" y2="75" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="50" y1="87" x2="110" y2="87" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="160" cy="30" r="16" fill="#10b981" opacity="0.2" />
            <path d="M160 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#059669" />
          </svg>
        </div>
      </div>

      {/* Quick Stats */}
      <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 14px", color: "var(--bp-text-dark)" }}>
        Quick Stats
      </h3>
      <div className="air-stats-grid">
        {STATS.map((stat) => (
          <div className="air-stat-card" key={stat.label}>
            <div className="air-stat-info">
              <small>{stat.label}</small>
              <strong>{stat.value}</strong>
            </div>
            <div className="air-stat-icon-wrap">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 14px", color: "var(--bp-text-dark)" }}>
        Quick Actions
      </h3>
      <div className="air-actions-grid">
        {QUICK_ACTIONS.map((action) => (
          <button
            type="button"
            className="air-action-tile"
            key={action.title}
            onClick={action.action}
          >
            <div className="air-action-tile-icon">{action.icon}</div>
            <div className="air-action-tile-text">
              <h4>{action.title}</h4>
              <p>{action.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Resumes List Panel */}
      <div className="air-card-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Active Documents</h3>
          <div className="air-filter-pills" style={{ margin: 0 }}>
            {["all", "ai", "drafts"].map((tab) => (
              <button
                type="button"
                key={tab}
                className={`air-filter-pill ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "all" ? "All Resumes (0)" : tab === "ai" ? "AI Resumes (0)" : "Manual Drafts (0)"}
              </button>
            ))}
          </div>
        </div>

        <div className="air-empty-state" style={{ margin: "24px auto" }}>
          <div className="air-empty-graphic">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3>No resumes found in this section</h3>
          <p>Start with our AI-powered resume builder or pick a tailored design to generate your first document.</p>
          <div className="air-empty-actions">
            <button type="button" className="air-btn-primary" onClick={() => onNavigate("builder")}>
              Create Resume
            </button>
            <button type="button" className="air-btn-secondary" onClick={() => onNavigate("templates")}>
              Browse Templates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
