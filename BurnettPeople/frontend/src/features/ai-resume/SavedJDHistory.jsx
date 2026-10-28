import { useState } from "react";

export default function SavedJDHistory({ onNavigate }) {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const newJob = {
      id: Date.now(),
      title: importText.slice(0, 35) + "...",
      company_name: "Imported Company",
      job_title: "Role Description",
      description: importText,
      created_at: new Date().toISOString(),
    };
    setJobs([newJob, ...jobs]);
    setImportText("");
    setShowImportModal(false);
  };

  const filteredJobs = jobs.filter((j) =>
    (j.title + j.company_name + j.description).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="air-content-wrap">
      {/* Breadcrumbs */}
      <div className="air-breadcrumbs">
        <span>AI Resume Creator</span> / <span>Saved JD History</span>
      </div>

      {/* Header Actions Row */}
      <div className="air-page-header-row">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="air-brand-icon-box" style={{ width: "48px", height: "48px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="air-page-title-box">
            <h1>Saved JD History</h1>
            <p>Manage saved job descriptions and revisit your resume match analyses.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            className="air-btn-primary"
            onClick={() => setShowImportModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Import Job Description
          </button>
          <button
            type="button"
            className="air-btn-secondary"
            onClick={() => onNavigate("dashboard")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Hero Banner Illustration */}
      <div className="air-hero-card" style={{ padding: "20px 28px", minHeight: "100px", marginBottom: "20px" }}>
        <div className="air-hero-card-content">
          <p style={{ margin: 0, fontSize: "14.5px", color: "var(--bp-text-dark)", fontWeight: "500" }}>
            Keep track of job requirements and analyze how well your resumes align with each opening.
          </p>
        </div>
        <div className="air-hero-graphic" style={{ width: "160px", height: "90px" }}>
          <svg viewBox="0 0 160 90" fill="none" width="100%" height="100%">
            <rect x="25" y="10" width="85" height="70" rx="6" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
            <text x="32" y="26" fill="#047857" fontSize="8" fontWeight="bold">JOB DESCRIPTION</text>
            <line x1="32" y1="36" x2="85" y2="36" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="32" y1="46" x2="75" y2="46" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="32" y1="56" x2="80" y2="56" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="105" cy="50" r="18" fill="#e6f7f0" stroke="#059669" strokeWidth="2" />
            <line x1="118" y1="63" x2="135" y2="80" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Info Alert Box */}
      <div className="air-alert-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          All <strong>job descriptions</strong> imported or saved to your account <strong>will appear here</strong>. Choose one to return to the Job Description page and <strong>analyze it</strong> against a resume.
        </span>
      </div>

      {/* Search Bar + Refresh */}
      <div className="air-search-filter-row">
        <div className="air-search-field-wide">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, company, job title, or description..."
          />
        </div>

        <button
          type="button"
          className="air-btn-secondary"
          onClick={() => {}}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Content Card Panel */}
      <div className="air-card-panel">
        {filteredJobs.length === 0 ? (
          <div className="air-empty-state">
            <div className="air-empty-graphic">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <circle cx="11" cy="14" r="3" />
                <line x1="13.5" y1="16.5" x2="16" y2="19" />
              </svg>
            </div>
            <h3>No saved job descriptions yet</h3>
            <p>
              Import or save job descriptions to your account and they will appear here. You can then analyze them against your resumes anytime.
            </p>
            <div className="air-empty-actions">
              <button
                type="button"
                className="air-btn-primary"
                onClick={() => setShowImportModal(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Import Job Description
              </button>
              <button
                type="button"
                className="air-btn-secondary"
                onClick={() => onNavigate("job-description")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                </svg>
                Create Job Description
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: "1px solid var(--bp-card-border)",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--bp-card-bg)",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "16px", color: "var(--bp-text-dark)" }}>{job.title}</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--bp-text-muted)" }}>
                    {job.company_name} &bull; Saved on {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  className="air-btn-primary"
                  onClick={() => onNavigate("job-description")}
                >
                  Analyze Match
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "var(--bp-card-bg)",
              borderRadius: "16px",
              padding: "24px 28px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>Import Job Description</h3>
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--bp-text-muted)" }}>
              Paste the text of the job description below to save it to your library.
            </p>
            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste job requirements, responsibilities, skills here..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--bp-card-border)",
                boxSizing: "border-box",
                fontSize: "13px",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                className="air-btn-secondary"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="air-btn-primary"
                onClick={handleImportSubmit}
              >
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
