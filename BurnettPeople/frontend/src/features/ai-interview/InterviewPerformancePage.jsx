import { useState } from "react";

export default function InterviewPerformancePage({ onNavigate }) {
  const [trendFilter, setTrendFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  return (
    <div className="aii-content-wrap">
      {/* Breadcrumbs */}
      <div className="aii-breadcrumbs">
        <span>AI Services</span> / <span>AI Interview Assistant</span> / <span>Performance</span>
      </div>

      {/* Header Banner */}
      <div
        className="aii-hero-card"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)",
          padding: "24px 32px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
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
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 4px", color: "var(--bpi-text-dark)" }}>
              Your Interview Performance
            </h1>
            <p style={{ fontSize: "13.5px", color: "var(--bpi-text-muted)", margin: 0 }}>
              A simple view of your completed interview scores.
            </p>
          </div>
        </div>

        {/* Right Illustration & CTA Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Chart & Leaves Artwork */}
          <div style={{ width: "120px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 120 70" fill="none" width="100%" height="100%">
              {/* Leaves */}
              <path d="M10 55 C12 35 30 35 35 55" fill="#34d399" opacity="0.4" />
              <path d="M90 60 C95 40 115 40 120 60" fill="#34d399" opacity="0.4" />
              {/* Rising Bars */}
              <rect x="35" y="45" width="12" height="22" rx="3" fill="#a7f3d0" />
              <rect x="52" y="32" width="12" height="35" rx="3" fill="#6ee7b7" />
              <rect x="69" y="18" width="12" height="49" rx="3" fill="#059669" />
              {/* Star */}
              <path d="M60 10 L62 14 L67 15 L63 18 L64 23 L60 20 L56 23 L57 18 L53 15 L58 14 Z" fill="#f59e0b" />
              {/* Arrow */}
              <path d="M72 14 L84 6 M84 6 L78 6 M84 6 L84 12" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <button
            type="button"
            className="aii-btn-primary"
            style={{ background: "#064e43", fontSize: "13px", padding: "10px 18px" }}
            onClick={() => onNavigate("interviews")}
          >
            Review Interviews &rarr;
          </button>
        </div>
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="aii-stats-3col">
        {/* Completed */}
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
              <small>Completed</small>
              <strong>1</strong>
              <span>Interview completed</span>
            </div>
          </div>
          <div className="aii-stat-badge-rt" style={{ color: "#2563eb", opacity: 0.6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
              <strong>45%</strong>
              <span>Highest interview score</span>
            </div>
          </div>
          <div className="aii-stat-badge-rt" style={{ color: "#f59e0b" }}>
            👑
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (~65%) vs Right Column (~35%) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Score Trend + Completed Interviews */}
        <div>
          {/* Card 1: Score Trend */}
          <div className="aii-chart-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--bpi-text-dark)" }}>
                    Score Trend
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--bpi-text-muted)", margin: "2px 0 0" }}>
                    Your interview scores over time.
                  </p>
                </div>
              </div>

              <select
                value={trendFilter}
                onChange={(e) => setTrendFilter(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--bpi-card-border)",
                  background: "var(--bpi-card-bg)",
                  color: "var(--bpi-text-dark)",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="all">All Interviews</option>
                <option value="technical">Technical Only</option>
                <option value="hr">HR Only</option>
              </select>
            </div>

            {/* Dotted Grid Chart */}
            <div className="aii-chart-box">
              {[
                { pct: "100%" },
                { pct: "75%" },
                { pct: "50%" },
                { pct: "25%" },
                { pct: "0%" },
              ].map((grid) => (
                <div key={grid.pct} className="aii-chart-grid-line">
                  <span className="aii-chart-grid-label">{grid.pct}</span>
                  <div className="aii-chart-grid-rule" />
                </div>
              ))}

              {/* Bar Elements */}
              <div className="aii-chart-bars-wrap">
                <div className="aii-chart-bar-col">
                  <span className="aii-chart-bar-value">45%</span>
                  <div className="aii-chart-bar-fill" style={{ height: "95px" }} />
                  <span className="aii-chart-bar-x">Technical Interview</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Completed Interviews (1) */}
          <div className="aii-resume-card-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--bpi-text-dark)" }}>
                    Completed Interviews (1)
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--bpi-text-muted)", margin: "2px 0 0" }}>
                    Your completed interview sessions.
                  </p>
                </div>
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--bpi-card-border)",
                  background: "var(--bpi-card-bg)",
                  color: "var(--bpi-text-dark)",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="newest">⇅ Newest First</option>
                <option value="oldest">⇅ Oldest First</option>
              </select>
            </div>

            {/* Interview Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                background: "var(--bpi-mint-bg)",
                border: "1px solid var(--bpi-card-border)",
                borderRadius: "10px",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
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
                  &lt;/&gt;
                </div>
                <div>
                  <strong style={{ fontSize: "14px", color: "var(--bpi-text-dark)", display: "block" }}>
                    Technical Interview
                  </strong>
                  <span style={{ fontSize: "12px", color: "var(--bpi-text-muted)", display: "block", marginTop: "2px" }}>
                    Python • Django • Backend • REST APIs
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", color: "var(--bpi-text-muted)", marginTop: "4px" }}>
                    <span>📅 Oct 25, 2026</span>
                    <span>⏱ 3:30 PM</span>
                    <span>📋 20 questions</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    textAlign: "center",
                  }}
                >
                  <strong style={{ display: "block", fontSize: "16px", fontWeight: "800", color: "#047857" }}>
                    45%
                  </strong>
                  <small style={{ display: "block", fontSize: "10px", color: "#059669", textTransform: "uppercase", fontWeight: "700" }}>
                    Score
                  </small>
                </div>

                <span className="aii-badge-completed">● Completed</span>

                <button
                  type="button"
                  className="aii-btn-secondary"
                  style={{ padding: "7px 14px", fontSize: "12px" }}
                  onClick={() => onNavigate("results")}
                >
                  👁 View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Performance Insights */}
        <div>
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
                  <line x1="9" y1="18" x2="15" y2="18" />
                  <line x1="10" y1="22" x2="14" y2="22" />
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                </svg>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--bpi-text-dark)" }}>
                Performance Insights
              </h3>
            </div>
            <p className="aii-tips-sub">Ways to improve your interview performance.</p>

            {/* Action 1 */}
            <div
              className="aii-action-item"
              onClick={() => onNavigate("results")}
            >
              <div className="aii-action-item-left">
                <div className="aii-action-icon-circle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div className="aii-action-text">
                  <strong>Review feedback</strong>
                  <span>Check the detailed feedback and suggestions from your past interviews.</span>
                </div>
              </div>
              <span className="aii-action-arrow">&gt;</span>
            </div>

            {/* Action 2 */}
            <div
              className="aii-action-item"
              onClick={() => onNavigate("setup")}
            >
              <div className="aii-action-item-left">
                <div className="aii-action-icon-circle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="6" r="2" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div className="aii-action-text">
                  <strong>Practice weaker topics</strong>
                  <span>Focus on topics where you scored lower to improve your next interviews.</span>
                </div>
              </div>
              <span className="aii-action-arrow">&gt;</span>
            </div>

            {/* Action 3 */}
            <div
              className="aii-action-item"
              onClick={() => onNavigate("interviews")}
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
                  <strong>Track progress</strong>
                  <span>Keep taking interviews and monitor your improvement over time.</span>
                </div>
              </div>
              <span className="aii-action-arrow">&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
