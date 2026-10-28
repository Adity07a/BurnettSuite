
export default function GapAnalysisPage({ onNavigate }) {

  const SKILL_GAPS = [
    { skill: "Docker & Containerization", match: false, importance: "High", rec: "Add hands-on container build projects to your experience." },
    { skill: "PostgreSQL & Database Indexing", match: true, importance: "High", rec: "Highlighted in your backend technical skills section." },
    { skill: "REST API Design & Swagger/OpenAPI", match: true, importance: "High", rec: "Strong match from your Django development experience." },
    { skill: "CI/CD Pipeline Setup (GitHub Actions)", match: false, importance: "Medium", rec: "Include workflow configurations from your student portal project." },
  ];

  return (
    <div className="air-content-wrap">
      <div className="air-breadcrumbs">
        <span>AI Resume Creator</span> / <span>Gap Analysis</span>
      </div>

      <div className="air-page-header-row">
        <div className="air-page-title-box">
          <h1>Resume Gap Analysis</h1>
          <p>Identify missing keywords, qualifications, and industry standards to maximize your interview callbacks.</p>
        </div>
      </div>

      <div className="air-stats-grid" style={{ marginBottom: "24px" }}>
        <div className="air-stat-card">
          <div className="air-stat-info">
            <small>Overall ATS Match Score</small>
            <strong style={{ color: "var(--bp-primary)" }}>82%</strong>
          </div>
          <div className="air-stat-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <div className="air-stat-card">
          <div className="air-stat-info">
            <small>Matched Core Skills</small>
            <strong>14 / 18</strong>
          </div>
          <div className="air-stat-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div className="air-stat-card">
          <div className="air-stat-info">
            <small>Identified Gaps</small>
            <strong style={{ color: "#e11d48" }}>4 Missing</strong>
          </div>
          <div className="air-stat-icon-wrap" style={{ color: "#e11d48", background: "#ffe4e6" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>
      </div>

      <div className="air-card-panel">
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>
          Target Role Alignment & Recommendations
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {SKILL_GAPS.map((gap) => (
            <div
              key={gap.skill}
              style={{
                border: "1px solid var(--bp-card-border)",
                borderRadius: "10px",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--bp-card-bg)",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: gap.match ? "#10b981" : "#e11d48",
                    }}
                  />
                  <strong style={{ fontSize: "14px", color: "var(--bp-text-dark)" }}>{gap.skill}</strong>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: gap.importance === "High" ? "#fee2e2" : "#fef3c7",
                      color: gap.importance === "High" ? "#991b1b" : "#92400e",
                      fontWeight: "600",
                    }}
                  >
                    {gap.importance} Priority
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12.5px", color: "var(--bp-text-muted)" }}>
                  {gap.rec}
                </p>
              </div>

              {!gap.match && (
                <button
                  type="button"
                  className="air-btn-secondary"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                  onClick={() => onNavigate("builder")}
                >
                  Add to Resume
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
