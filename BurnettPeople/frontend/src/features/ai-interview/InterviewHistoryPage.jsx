import { useState } from "react";

export default function InterviewHistoryPage({ onNavigate }) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const SESSIONS = [
    {
      id: "INT-301",
      iconType: "code",
      title: "Technical Interview",
      status: "completed",
      tags: ["Python", "Django", "Backend", "REST APIs"],
      date: "Oct 25, 2026",
      time: "3:30 PM",
      duration: "30 minutes",
      questions: "20 questions",
      score: 75,
      scoreColor: "#059669",
      scoreBg: "#ecfdf5",
      scoreBorder: "#a7f3d0",
    },
    {
      id: "INT-302",
      iconType: "chart",
      title: "Data Science Interview",
      status: "in-progress",
      tags: ["Python", "Machine Learning", "SQL", "Data Analysis"],
      date: "Oct 22, 2026",
      time: "11:00 AM",
      duration: "30 minutes",
      questions: "25 questions",
      score: 60,
      scoreColor: "#2563eb",
      scoreBg: "#eff6ff",
      scoreBorder: "#bfdbfe",
    },
    {
      id: "INT-303",
      iconType: "monitor",
      title: "Frontend Developer Interview",
      status: "completed",
      tags: ["React", "JavaScript", "HTML/CSS", "Problem Solving"],
      date: "Oct 18, 2026",
      time: "4:00 PM",
      duration: "30 minutes",
      questions: "20 questions",
      score: 45,
      scoreColor: "#d97706",
      scoreBg: "#fffbeb",
      scoreBorder: "#fde68a",
    },
  ];

  const filteredSessions = SESSIONS.filter((s) => {
    if (filter === "completed" && s.status !== "completed") return false;
    if (filter === "in-progress" && s.status !== "in-progress") return false;
    if (filter === "pending") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchTags = s.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchTags;
    }
    return true;
  });

  return (
    <div className="aii-content-wrap">
      {/* Breadcrumbs */}
      <div className="aii-breadcrumbs">
        <span>AI Services</span> / <span>AI Interview Assistant</span> / <span>Interviews</span>
      </div>

      {/* Header Banner */}
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="m9 16 2 2 4-4" />
          </svg>
        </div>
        <div className="aii-page-title-box">
          <h1>My Interviews</h1>
          <p>Review your interview sessions and continue preparing for your next opportunity.</p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="aii-hero-card" style={{ padding: "24px 32px", marginBottom: "22px" }}>
        <div className="aii-hero-card-content" style={{ flex: 1, minWidth: "280px" }}>
          <span className="aii-hero-eyebrow">INTERVIEW HISTORY</span>
          <h2>Keep practicing. You&apos;re improving!</h2>
          <p style={{ margin: "0 0 16px", maxWidth: "600px" }}>
            Review your past interview sessions, check your performance, and start a new interview to build your confidence.
          </p>
        </div>

        {/* Right Artwork & CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ width: "160px", height: "100px", flexShrink: 0 }}>
            <svg viewBox="0 0 160 100" fill="none" width="100%" height="100%">
              <path d="M15 70 C20 30 50 25 60 65" fill="#34d399" opacity="0.35" />
              <path d="M110 80 C120 35 150 30 160 75" fill="#34d399" opacity="0.35" />
              {/* Laptop screen */}
              <rect x="45" y="15" width="70" height="52" rx="6" fill="#002b28" />
              <circle cx="80" cy="36" r="10" fill="#34d399" />
              <path d="M68 56 C70 48 90 48 92 56" fill="#34d399" />
              <rect x="35" y="67" width="90" height="6" rx="3" fill="#cbd5e1" />
            </svg>
          </div>

          <button
            type="button"
            className="aii-btn-primary"
            style={{ background: "#064e43", fontSize: "13.5px", padding: "10px 20px" }}
            onClick={() => onNavigate("setup")}
          >
            + New Interview
          </button>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="aii-filter-bar">
        {/* Pills */}
        <div className="aii-filter-pills">
          <button
            type="button"
            className={`aii-pill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All (3)
          </button>
          <button
            type="button"
            className={`aii-pill ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            ✔ Completed (2)
          </button>
          <button
            type="button"
            className={`aii-pill ${filter === "in-progress" ? "active" : ""}`}
            onClick={() => setFilter("in-progress")}
          >
            ⏱ In Progress (1)
          </button>
          <button
            type="button"
            className={`aii-pill ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            ⏳ Pending (0)
          </button>
        </div>

        {/* Right Search & Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--bpi-text-muted)", display: "flex" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "7px 12px 7px 32px",
                borderRadius: "8px",
                border: "1px solid var(--bpi-card-border)",
                background: "var(--bpi-card-bg)",
                color: "var(--bpi-text-dark)",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "8px",
              border: "1px solid var(--bpi-card-border)",
              background: "var(--bpi-card-bg)",
              color: "var(--bpi-text-dark)",
              fontSize: "13px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="newest">⇅ Newest First</option>
            <option value="oldest">⇅ Oldest First</option>
            <option value="highest">Highest Score</option>
          </select>
        </div>
      </div>

      {/* 2-Column Grid: List on Left (65%), Tips on Right (35%) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Interview Cards */}
        <div>
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="aii-interview-card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                marginBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0, paddingRight: "16px" }}>
                {/* Left Icon Square */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: "800",
                    flexShrink: 0,
                  }}
                >
                  {session.iconType === "code" && "< / >"}
                  {session.iconType === "chart" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  )}
                  {session.iconType === "monitor" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 2px", color: "var(--bpi-text-dark)" }}>
                    {session.title}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--bpi-text-muted)", margin: "0 0 6px" }}>
                    {session.tags.join(" • ")}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "11.5px", color: "var(--bpi-text-muted)" }}>
                    <span>📅 {session.date}</span>
                    <span>⏱ {session.time}</span>
                    <span>⏱ {session.duration}</span>
                    <span>📋 {session.questions}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Score + Status + Button + Menu */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                <div
                  style={{
                    background: session.scoreBg,
                    border: `1px solid ${session.scoreBorder}`,
                    borderRadius: "8px",
                    padding: "6px 12px",
                    textAlign: "center",
                    minWidth: "55px",
                  }}
                >
                  <strong style={{ display: "block", fontSize: "15px", fontWeight: "800", color: session.scoreColor }}>
                    {session.score}%
                  </strong>
                  <small style={{ display: "block", fontSize: "9px", color: session.scoreColor, textTransform: "uppercase", fontWeight: "700" }}>
                    Score
                  </small>
                </div>

                {session.status === "completed" ? (
                  <span className="aii-badge-completed">● Completed</span>
                ) : (
                  <span className="aii-badge-inprogress">● In Progress</span>
                )}

                <button
                  type="button"
                  className="aii-btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => onNavigate("results")}
                >
                  👁 View Details
                </button>

                <span style={{ color: "var(--bpi-text-muted)", cursor: "pointer", fontSize: "16px" }}>⋮</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Keep Improving Card */}
        <div className="aii-tips-card">
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
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--bpi-text-dark)" }}>
              Keep Improving
            </h3>
          </div>
          <p className="aii-tips-sub">Tips for better interview performance</p>

          <div className="aii-tip-item">
            <div className="aii-tip-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="aii-tip-content">
              <h4>Review Feedback</h4>
              <p>Check detailed feedback and suggestions from your past interviews.</p>
            </div>
          </div>

          <div className="aii-tip-item">
            <div className="aii-tip-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div className="aii-tip-content">
              <h4>Practice Consistently</h4>
              <p>Take more mock interviews to improve your confidence.</p>
            </div>
          </div>

          <div className="aii-tip-item">
            <div className="aii-tip-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="9" y1="18" x2="15" y2="18" />
                <line x1="10" y1="22" x2="14" y2="22" />
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
              </svg>
            </div>
            <div className="aii-tip-content">
              <h4>Focus on Weak Areas</h4>
              <p>Identify topics where you scored low and practice them.</p>
            </div>
          </div>

          <div className="aii-tip-item" style={{ marginBottom: 0 }}>
            <div className="aii-tip-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <div className="aii-tip-content">
              <h4>Track Your Progress</h4>
              <p>Monitor your scores and see improvement over time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
