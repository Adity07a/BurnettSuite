export default function InterviewDashboard({ onNavigate, user }) {
  const userName = user?.first_name || "Mayank";

  return (
    <div className="aii-content-wrap">
      {/* Breadcrumbs */}
      <div className="aii-breadcrumbs">
        <span>AI Services</span> / <span>AI Interview Assistant</span> / <span>Dashboard</span>
      </div>

      {/* Header */}
      <div className="aii-page-header-row" style={{ alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "#ecfdf5",
            color: "#059669",
            border: "1px solid #d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16.01" />
            <line x1="16" y1="16" x2="16" y2="16.01" />
          </svg>
        </div>
        <div className="aii-page-title-box">
          <h1>Interview Dashboard</h1>
          <p>Practice, improve and get personalized feedback with AI.</p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="aii-hero-card" style={{ padding: "26px 32px" }}>
        <div className="aii-hero-card-content" style={{ flex: 1, minWidth: "280px" }}>
          <span className="aii-hero-eyebrow">INTERVIEW PREP DASHBOARD</span>
          <h2>Welcome back, {userName}! 👋</h2>
          <p style={{ maxWidth: "560px", marginBottom: "18px" }}>
            Practice real interview questions, get instant AI feedback and improve your skills.
          </p>

          {/* Feature Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: "600",
                background: "#ecfdf5",
                color: "#047857",
                padding: "5px 12px",
                borderRadius: "999px",
                border: "1px solid #d1fae5",
              }}
            >
              ⚙ AI-Powered Questions
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: "600",
                background: "#ecfdf5",
                color: "#047857",
                padding: "5px 12px",
                borderRadius: "999px",
                border: "1px solid #d1fae5",
              }}
            >
              ✔ Real-time Feedback
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: "600",
                background: "#ecfdf5",
                color: "#047857",
                padding: "5px 12px",
                borderRadius: "999px",
                border: "1px solid #d1fae5",
              }}
            >
              📈 Track Your Progress
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: "600",
                background: "#ecfdf5",
                color: "#047857",
                padding: "5px 12px",
                borderRadius: "999px",
                border: "1px solid #d1fae5",
              }}
            >
              💼 Get Hired Faster
            </span>
          </div>
        </div>

        {/* Center Illustration + Right Start Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ width: "160px", height: "115px", flexShrink: 0 }}>
            <svg viewBox="0 0 160 115" fill="none" width="100%" height="100%">
              {/* Leaves Background */}
              <path d="M15 80 C20 40 50 35 60 75" fill="#34d399" opacity="0.35" />
              <path d="M110 90 C120 45 150 40 160 85" fill="#34d399" opacity="0.35" />

              {/* Chat Bubble with dots */}
              <rect x="90" y="15" width="46" height="26" rx="8" fill="#34d399" />
              <circle cx="103" cy="28" r="2.5" fill="#ffffff" />
              <circle cx="113" cy="28" r="2.5" fill="#ffffff" />
              <circle cx="123" cy="28" r="2.5" fill="#ffffff" />

              {/* Robot Avatar */}
              <rect x="52" y="30" width="56" height="46" rx="12" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
              <line x1="80" y1="30" x2="80" y2="18" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="80" cy="16" r="4.5" fill="#10b981" />
              <circle cx="68" cy="50" r="5" fill="#047857" />
              <circle cx="92" cy="50" r="5" fill="#047857" />
              <path d="M72 63 Q80 70 88 63" stroke="#059669" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Laptop screen */}
              <rect x="68" y="76" width="48" height="30" rx="4" fill="#002b28" />
              <circle cx="92" cy="91" r="5" fill="#10b981" />
            </svg>
          </div>

          <button
            type="button"
            className="aii-btn-primary"
            style={{ background: "#064e43", padding: "12px 24px", fontSize: "14px", flexShrink: 0 }}
            onClick={() => onNavigate("setup")}
          >
            Start New Interview &rarr;
          </button>
        </div>
      </div>

      {/* 3 Large Stat Tiles */}
      <div className="aii-stats-3col">
        {/* Total Interviews */}
        <div className="aii-stat-box">
          <div className="aii-stat-box-left">
            <div className="aii-stat-icon-sq" style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #d1fae5" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="aii-stat-box-info">
              <small>Total Interviews</small>
              <strong>1</strong>
              <span>1 completed</span>
            </div>
          </div>
          <div className="aii-stat-badge-rt" style={{ color: "#2563eb", opacity: 0.6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
        </div>

        {/* Average Score */}
        <div className="aii-stat-box">
          <div className="aii-stat-box-left">
            <div className="aii-stat-icon-sq" style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #d1fae5" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div className="aii-stat-box-info">
              <small>Average Score</small>
              <strong>45%</strong>
              <span>Across completed interviews</span>
            </div>
          </div>
          <div className="aii-stat-badge-rt" style={{ color: "#059669", opacity: 0.8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>

        {/* Best Score */}
        <div className="aii-stat-box">
          <div className="aii-stat-box-left">
            <div className="aii-stat-icon-sq" style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #d1fae5" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <div className="aii-stat-box-info">
              <small>Best Score</small>
              <strong>75%</strong>
              <span>Highest interview score</span>
            </div>
          </div>
          <div className="aii-stat-badge-rt" style={{ color: "#f59e0b" }}>
            👑
          </div>
        </div>
      </div>

      {/* 2-Column Bottom Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Recent Interviews Table */}
        <div className="aii-resume-card-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 2px", color: "var(--bpi-text-dark)" }}>
                Recent Interviews
              </h3>
              <p style={{ fontSize: "12px", color: "var(--bpi-text-muted)", margin: 0 }}>
                Your latest interview sessions
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("interviews")}
              style={{
                background: "none",
                border: "none",
                color: "var(--bpi-primary)",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                padding: 0,
              }}
            >
              View all &rarr;
            </button>
          </div>

          {/* Table */}
          <div className="aii-table-container">
            <table className="aii-table">
              <thead>
                <tr>
                  <th>Interview Title</th>
                  <th>Date &amp; Time</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          background: "#ecfdf5",
                          color: "#059669",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                      </div>
                      <div>
                        <strong style={{ fontSize: "13.5px", color: "var(--bpi-text-dark)", display: "block" }}>
                          Technical Interview
                        </strong>
                        <span style={{ fontSize: "11.5px", color: "var(--bpi-text-muted)" }}>
                          Python • Django • Backend
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: "12.5px", color: "var(--bpi-text-muted)" }}>
                    Oct 25, 2026<br />3:30 PM
                  </td>
                  <td>
                    <strong style={{ color: "#047857", fontSize: "14px", fontWeight: "800" }}>75%</strong>
                  </td>
                  <td>
                    <span className="aii-badge-completed">● Completed</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="aii-btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => onNavigate("results")}
                    >
                      👁 View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Prepare in a few clicks + Resume Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Card 1: Prepare in a few clicks */}
          <div className="aii-resume-card-box">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#ecfdf5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "var(--bpi-text-dark)" }}>
                Prepare in a few clicks
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--bpi-text-muted)", margin: "0 0 16px" }}>
              Everything you need to ace your next interview.
            </p>

            <div
              className="aii-action-item"
              onClick={() => onNavigate("resume")}
            >
              <div className="aii-action-item-left">
                <div className="aii-action-icon-circle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="aii-action-text">
                  <strong>Review my resume</strong>
                  <span>See extracted skills, projects and education.</span>
                </div>
              </div>
              <span className="aii-action-arrow">&gt;</span>
            </div>

            <div
              className="aii-action-item"
              onClick={() => onNavigate("performance")}
            >
              <div className="aii-action-item-left">
                <div className="aii-action-icon-circle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div className="aii-action-text">
                  <strong>View performance</strong>
                  <span>Track your scores across completed sessions.</span>
                </div>
              </div>
              <span className="aii-action-arrow">&gt;</span>
            </div>
          </div>

          {/* Card 2: Resume Status */}
          <div
            className="aii-resume-card-box"
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#059669",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <small style={{ fontSize: "11px", color: "#065f46", textTransform: "uppercase", fontWeight: "700" }}>Resume Status</small>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#065f46", margin: "2px 0 0" }}>
                  Resume uploaded ✓
                </h4>
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "#047857", margin: "0 0 14px", lineHeight: "1.4" }}>
              Your AI Interviewer uses your resume as context to generate personalized questions.
            </p>

            <button
              type="button"
              className="aii-btn-secondary"
              onClick={() => onNavigate("resume")}
              style={{
                width: "100%",
                justifyContent: "center",
                borderColor: "#a7f3d0",
                color: "#065f46",
                fontWeight: "600",
                background: "#ffffff",
                fontSize: "12.5px",
              }}
            >
              📄 Manage Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
