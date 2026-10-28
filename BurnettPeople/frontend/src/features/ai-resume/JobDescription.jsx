import { useState } from "react";

export default function JobDescription({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [selectedResume, setSelectedResume] = useState("");
  const [jdTitle, setJdTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [activeTab, setActiveTab] = useState("paste"); // paste, url, upload
  const [jdText, setJdText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState("");
  const [tone, setTone] = useState("Professional");
  const [tailoringMode, setTailoringMode] = useState("ai"); // ai vs manual

  const handleSaveToHistory = () => {
    alert("Job Description saved to your history library!");
  };

  const handleAnalyze = () => {
    if (!jdText.trim()) {
      alert("Please paste or provide a job description before analyzing.");
      return;
    }
    setStep(2);
  };

  return (
    <div className="air-content-wrap">
      {/* Breadcrumbs */}
      <div className="air-breadcrumbs">
        <span>AI Resume Creator</span> / <span>Job Description</span>
      </div>

      {/* Header */}
      <div className="air-page-header-row">
        <div className="air-page-title-box">
          <h1>Tailor Your Resume for a Job</h1>
          <p>Select a resume, analyze a job description, and tailor it automatically or manually.</p>
        </div>
      </div>

      {/* 3-Step Stepper */}
      <div className="air-stepper-wrap">
        <div className={`air-step-item ${step === 1 ? "active" : ""}`}>
          <div className="air-step-number">1</div>
          <span className="air-step-label">Job & Resume Selection</span>
        </div>
        <div className="air-step-divider" />
        <div className={`air-step-item ${step === 2 ? "active" : ""}`}>
          <div className="air-step-number">2</div>
          <span className="air-step-label">JD Analysis & Match Score</span>
        </div>
        <div className="air-step-divider" />
        <div className={`air-step-item ${step === 3 ? "active" : ""}`}>
          <div className="air-step-number">3</div>
          <span className="air-step-label">Resume Tailoring</span>
        </div>
      </div>

      {step === 1 && (
        <>
          {/* Card 1: Resume & Job Details */}
          <div className="air-form-panel">
            <div className="air-form-panel-header">
              <div className="air-form-panel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <h3>Resume & Job Details</h3>
                <p>Select your resume and provide basic job information.</p>
              </div>
            </div>

            <div className="air-field-group">
              <label>Select Saved Resume</label>
              <select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
              >
                <option value="">-- Select a Resume from Dashboard --</option>
                <option value="1">Mayank Joshi - Full Stack Developer (Latest Draft)</option>
                <option value="2">Mayank Joshi - Software Engineer (ATS Optimized)</option>
              </select>
            </div>

            <div className="air-field-group">
              <label>Job Description Title / Tag</label>
              <input
                type="text"
                placeholder="e.g. Python Developer - Google"
                value={jdTitle}
                onChange={(e) => setJdTitle(e.target.value)}
              />
            </div>

            <div className="air-form-grid-2">
              <div className="air-field-group">
                <label>Company Name</label>
                <input
                  type="text"
                  placeholder="Company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="air-field-group">
                <label>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Backend Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Add Job Description */}
          <div className="air-form-panel">
            <div className="air-form-panel-header">
              <div className="air-form-panel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <h3>Add Job Description</h3>
                <p>Provide the job description using any of the options below.</p>
              </div>
            </div>

            {/* Input Method Tabs */}
            <div className="air-filter-pills" style={{ marginBottom: "16px" }}>
              <button
                type="button"
                className={`air-filter-pill ${activeTab === "paste" ? "active" : ""}`}
                onClick={() => setActiveTab("paste")}
              >
                Paste Text
              </button>
              <button
                type="button"
                className={`air-filter-pill ${activeTab === "url" ? "active" : ""}`}
                onClick={() => setActiveTab("url")}
              >
                Import from URL
              </button>
              <button
                type="button"
                className={`air-filter-pill ${activeTab === "upload" ? "active" : ""}`}
                onClick={() => setActiveTab("upload")}
              >
                Upload File (PDF/DOCX)
              </button>
            </div>

            <div className="air-field-group">
              <label>Job Description (JD)</label>
              <textarea
                rows={8}
                placeholder="Paste job responsibilities, skills, and qualifications here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
              <span style={{ fontSize: "11px", color: "var(--bp-text-muted)", float: "right", marginTop: "4px" }}>
                {jdText.length} characters
              </span>
            </div>
          </div>

          {/* Card 3: Tailoring Preferences */}
          <div className="air-form-panel">
            <div className="air-form-panel-header">
              <div className="air-form-panel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <div>
                <h3>Tailoring Preferences</h3>
                <p>Customize how the AI should tailor your resume for this job.</p>
              </div>
            </div>

            <div className="air-form-grid-2">
              <div className="air-field-group">
                <label>Target Role / Position</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <div className="air-field-group">
                <label>Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior Level (5+ years)</option>
                  <option value="lead">Lead / Principal (8+ years)</option>
                </select>
              </div>
            </div>

            <div className="air-field-group">
              <label>Key Skills to Emphasize</label>
              <input
                type="text"
                placeholder="e.g. Python, Django, REST API, Communication (comma separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div className="air-field-group">
              <label>Resume Tone / Style</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                <option value="Professional">Professional</option>
                <option value="Modern">Modern & Dynamic</option>
                <option value="Technical">Technical & Dense</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div className="air-field-group">
              <label>Tailored Resume Mode</label>
              <div className="air-radio-cards-row">
                <div
                  className={`air-radio-card ${tailoringMode === "ai" ? "active" : ""}`}
                  onClick={() => setTailoringMode("ai")}
                >
                  <div className="air-radio-dot" />
                  <div className="air-radio-card-content">
                    <h4>AI-Assisted (Recommended)</h4>
                    <p>Automatically tailor your resume using AI based on JD analysis.</p>
                  </div>
                </div>

                <div
                  className={`air-radio-card ${tailoringMode === "manual" ? "active" : ""}`}
                  onClick={() => setTailoringMode("manual")}
                >
                  <div className="air-radio-dot" />
                  <div className="air-radio-card-content">
                    <h4>Manual Customization</h4>
                    <p>Get suggestions and edit manually in the next step.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
            <button
              type="button"
              className="air-btn-secondary"
              onClick={handleSaveToHistory}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save JD to History
            </button>

            <button
              type="button"
              className="air-btn-primary"
              onClick={handleAnalyze}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Analyze & Check Match Score &rarr;
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="air-card-panel" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div className="air-empty-graphic" style={{ background: "#ecfdf5", color: "#059669" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 style={{ fontSize: "24px", color: "var(--bp-text-dark)", margin: "0 0 10px" }}>
            JD Match Score: 88%
          </h2>
          <p style={{ maxWidth: "550px", margin: "0 auto 28px", color: "var(--bp-text-muted)", fontSize: "14px" }}>
            Your background matches <strong>8 out of 10 key requirements</strong> for {jobTitle || "the target role"}. We recommend boosting your keywords in REST API development and Cloud infrastructure.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <button type="button" className="air-btn-secondary" onClick={() => setStep(1)}>
              &larr; Back to Details
            </button>
            <button
              type="button"
              className="air-btn-primary"
              onClick={() => onNavigate("builder")}
            >
              Apply Tailoring in Builder &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
