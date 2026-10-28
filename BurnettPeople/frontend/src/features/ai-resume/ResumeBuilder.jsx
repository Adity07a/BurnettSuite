import { useState } from "react";

export default function ResumeBuilder({ user, templateParam }) {
  const [selectedTemplate, setSelectedTemplate] = useState(templateParam || "classic");

  const [form, setForm] = useState({
    fullName: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Mayank Joshi",
    email: user?.email || "mayank@example.com",
    phone: "+91 9876543210",
    location: "Indore, MP",
    github: "https://github.com/mayankjoshi",
    linkedin: "https://linkedin.com/in/mayankjoshi",
    summary:
      "Passionate Python developer with experience in building web applications and working with modern technologies. Seeking opportunities to contribute and grow in a dynamic organization.",
    experience:
      "# Python Developer Intern — Company Name\nDuration: 5 months\n- Developed REST APIs using Django.\n- Worked on authentication and database models.\n- Collaborated with team on feature development.",
    projects:
      "# AI Resume Creator\nBuilt a resume builder using React.\n# Student Training Portal\nDeveloped a student portal using Django.",
    skills: "Python, Java, SQL, React, Django, HTML, CSS, JavaScript, REST API",
    education: "B.Tech in Computer Science\nCollege name, 2026",
    certifications:
      "# Python Certification — Issuer (Completion date)\n# AWS Cloud Practitioner (Completion date)",
  });

  const [aiJobTitle, setAiJobTitle] = useState("");
  const [aiJobDesc, setAiJobDesc] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const TEMPLATES = [
    { id: "classic", name: "Classic ATS", accent: "#0f766e" },
    { id: "professional", name: "Navy Professional", accent: "#1e3a5f" },
    { id: "modern", name: "Modern ATS", accent: "#059669" },
    { id: "minimal", name: "Minimal ATS", accent: "#334155" },
    { id: "technical", name: "Technical ATS", accent: "#0d9488" },
    { id: "executive", name: "Executive ATS", accent: "#854d0e" },
    { id: "contemporary", name: "Contemporary ATS", accent: "#0891b2" },
    { id: "compact", name: "Compact ATS", accent: "#7c2d12" },
    { id: "burgundy", name: "Burgundy Professional", accent: "#831843" },
  ];

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateSummary = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const generated = `Results-oriented ${aiJobTitle || "Software Engineer"} skilled in ${form.skills.split(",").slice(0, 3).join(", ")}. Proven track record developing scalable web services and responsive applications with high efficiency.`;
      setForm((prev) => ({ ...prev, summary: generated }));
      setIsGeneratingAi(false);
    }, 800);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleSaveDraft = () => {
    alert("Resume saved successfully as draft!");
  };

  const activeTemplate = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  return (
    <div className="air-content-wrap">
      {/* Breadcrumbs */}
      <div className="air-breadcrumbs">
        <span>AI Resume Creator</span> / <span>Resume Builder</span>
      </div>

      {/* Header */}
      <div className="air-page-header-row">
        <div className="air-page-title-box">
          <h1>Resume Builder</h1>
          <p>Add your details below and see your resume update in real time. You can also choose a template and download your resume.</p>
        </div>
      </div>

      {/* Builder Top Promo Card */}
      <div className="air-hero-card" style={{ padding: "18px 24px", marginBottom: "24px" }}>
        <div className="air-hero-card-content" style={{ maxWidth: "700px" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: "16px", color: "var(--bp-text-dark)" }}>
            Create a professional resume that gets you hired
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--bp-text-muted)" }}>
            Fill in your details, choose a template, and download instantly.
          </p>
        </div>
        <div className="air-hero-graphic" style={{ width: "120px", height: "60px" }}>
          <svg viewBox="0 0 120 60" fill="none" width="100%" height="100%">
            <rect x="20" y="5" width="70" height="50" rx="4" fill="#ffffff" stroke="#059669" strokeWidth="1.5" />
            <line x1="28" y1="16" x2="65" y2="16" stroke="#059669" strokeWidth="2" />
            <line x1="28" y1="24" x2="78" y2="24" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="28" y1="32" x2="72" y2="32" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="95" cy="20" r="8" fill="#10b981" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* Split View */}
      <div className="air-builder-split">
        {/* Left Column: Form Inputs */}
        <div className="air-builder-left-col">
          {/* 1. Personal Details */}
          <div className="air-form-panel">
            <div className="air-form-panel-header">
              <div className="air-form-panel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3>Personal Details</h3>
                <p>Tell us about yourself. This information will appear at the top of your resume.</p>
              </div>
            </div>

            <div className="air-form-grid-2">
              <div className="air-field-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleFieldChange("fullName", e.target.value)}
                  placeholder="e.g. Mayank Joshi"
                />
              </div>
              <div className="air-field-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="air-form-grid-2">
              <div className="air-field-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="air-field-group">
                <label>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="air-form-grid-2">
              <div className="air-field-group">
                <label>GitHub Profile URL</label>
                <input
                  type="url"
                  value={form.github}
                  onChange={(e) => handleFieldChange("github", e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="air-field-group">
                <label>LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>

          {/* 2. Professional Summary */}
          <div className="air-form-panel">
            <div className="air-form-panel-header">
              <div className="air-form-panel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <h3>Professional Summary</h3>
                <p>Write a short introduction about yourself or generate one using AI.</p>
              </div>
            </div>

            <div className="air-field-group">
              <label>About You *</label>
              <textarea
                rows={4}
                value={form.summary}
                onChange={(e) => handleFieldChange("summary", e.target.value)}
                placeholder="Write a short professional introduction..."
              />
            </div>

            {/* AI Summary Box */}
            <div className="air-ai-summary-box">
              <h5>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                </svg>
                Generate AI Summary
              </h5>
              <p style={{ margin: "0 0 10px", fontSize: "11.5px", color: "var(--bp-text-muted)" }}>
                Generate a professional summary from your resume details. You can optionally tailor it to a target role.
              </p>
              <div className="air-form-grid-2" style={{ marginBottom: "10px" }}>
                <input
                  type="text"
                  placeholder="Target Job Title (optional)"
                  value={aiJobTitle}
                  onChange={(e) => setAiJobTitle(e.target.value)}
                  style={{ fontSize: "12px", padding: "8px 10px" }}
                />
                <input
                  type="text"
                  placeholder="Job Description (optional)"
                  value={aiJobDesc}
                  onChange={(e) => setAiJobDesc(e.target.value)}
                  style={{ fontSize: "12px", padding: "8px 10px" }}
                />
              </div>
              <button
                type="button"
                className="air-btn-primary"
                style={{ fontSize: "12px", padding: "7px 14px" }}
                onClick={handleGenerateSummary}
                disabled={isGeneratingAi}
              >
                {isGeneratingAi ? "Generating..." : "Generate AI Summary"}
              </button>
            </div>
          </div>

          {/* 3. Experience */}
          <div className="air-form-panel">
            <div className="air-form-panel-header" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="air-form-panel-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div>
                  <h3>Experience</h3>
                  <p>Add your internship or work experience. Start each role with # to make the title bold.</p>
                </div>
              </div>
              <button
                type="button"
                className="air-btn-secondary"
                style={{ fontSize: "12px", padding: "6px 12px" }}
                onClick={() =>
                  handleFieldChange(
                    "experience",
                    form.experience + "\n\n# New Role — Company\nDuration: Date Range\n- Contribution point"
                  )
                }
              >
                + Add Experience
              </button>
            </div>
            <div className="air-field-group">
              <textarea
                rows={6}
                value={form.experience}
                onChange={(e) => handleFieldChange("experience", e.target.value)}
              />
            </div>
          </div>

          {/* 4. Projects */}
          <div className="air-form-panel">
            <div className="air-form-panel-header" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="air-form-panel-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <h3>Projects</h3>
                  <p>Add your projects. Start each project title with # to make it bold.</p>
                </div>
              </div>
              <button
                type="button"
                className="air-btn-secondary"
                style={{ fontSize: "12px", padding: "6px 12px" }}
                onClick={() =>
                  handleFieldChange(
                    "projects",
                    form.projects + "\n\n# New Project\nDescription and key technologies used."
                  )
                }
              >
                + Add Project
              </button>
            </div>
            <div className="air-field-group">
              <textarea
                rows={5}
                value={form.projects}
                onChange={(e) => handleFieldChange("projects", e.target.value)}
              />
            </div>
          </div>

          {/* 5. Technical Skills */}
          <div className="air-form-panel">
            <div className="air-form-panel-header">
              <div className="air-form-panel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <div>
                <h3>Technical Skills</h3>
                <p>Add your key skills separated by commas.</p>
              </div>
            </div>
            <div className="air-field-group">
              <input
                type="text"
                value={form.skills}
                onChange={(e) => handleFieldChange("skills", e.target.value)}
                placeholder="e.g. Python, Java, SQL, React, Django..."
              />
            </div>
          </div>

          {/* 6. Certifications */}
          <div className="air-form-panel">
            <div className="air-form-panel-header">
              <div className="air-form-panel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
              <div>
                <h3>Certifications</h3>
                <p>Add your certifications and courses. Start each with # to make it bold.</p>
              </div>
            </div>
            <div className="air-field-group">
              <textarea
                rows={4}
                value={form.certifications}
                onChange={(e) => handleFieldChange("certifications", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Templates Selection + Live Preview */}
        <div className="air-builder-right-col">
          {/* Template Selector Carousel */}
          <div className="air-form-panel" style={{ padding: "18px 20px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "700" }}>
              Choose a Resume Template
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "8px",
              }}
            >
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  style={{
                    border: selectedTemplate === t.id ? "2px solid #059669" : "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "6px 4px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: selectedTemplate === t.id ? "#ecfdf5" : "#ffffff",
                    position: "relative",
                  }}
                >
                  {selectedTemplate === t.id && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "#059669",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "14px",
                        height: "14px",
                        fontSize: "9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✓
                    </span>
                  )}
                  <div
                    style={{
                      height: "38px",
                      background: "#f1f5f9",
                      borderRadius: "3px",
                      marginBottom: "4px",
                      borderTop: `3px solid ${t.accent}`,
                    }}
                  />
                  <span style={{ fontSize: "9px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="air-live-preview-box" id="printable-resume">
            <div style={{ marginBottom: "16px", overflow: "hidden" }}>
              <span className="air-preview-live-badge">
                <span className="air-live-dot" /> Live Preview
              </span>
            </div>

            {/* Rendered CV Header */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                paddingBottom: "16px",
                borderBottom: `2px solid ${activeTemplate.accent}`,
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "8px",
                  background: activeTemplate.accent,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {form.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: "0 0 2px", fontSize: "18px", color: activeTemplate.accent }}>
                  {form.fullName}
                </h2>
                <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
                  Python Developer
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "#64748b" }}>
                  <span>✉ {form.email}</span>
                  <span>☎ {form.phone}</span>
                  <span>📍 {form.location}</span>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 6px", fontSize: "11px", letterSpacing: "0.05em", color: activeTemplate.accent, textTransform: "uppercase" }}>
                Professional Summary
              </h4>
              <p style={{ margin: 0, fontSize: "11.5px", lineHeight: "1.6", color: "#334155" }}>
                {form.summary}
              </p>
            </div>

            {/* Experience Section */}
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 6px", fontSize: "11px", letterSpacing: "0.05em", color: activeTemplate.accent, textTransform: "uppercase" }}>
                Experience
              </h4>
              <div style={{ fontSize: "11.5px", lineHeight: "1.6", whiteSpace: "pre-line", color: "#334155" }}>
                {form.experience}
              </div>
            </div>

            {/* Projects Section */}
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 6px", fontSize: "11px", letterSpacing: "0.05em", color: activeTemplate.accent, textTransform: "uppercase" }}>
                Projects
              </h4>
              <div style={{ fontSize: "11.5px", lineHeight: "1.6", whiteSpace: "pre-line", color: "#334155" }}>
                {form.projects}
              </div>
            </div>

            {/* Skills Section */}
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 6px", fontSize: "11px", letterSpacing: "0.05em", color: activeTemplate.accent, textTransform: "uppercase" }}>
                Technical Skills
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {form.skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((skill) => (
                    <span
                      key={skill}
                      style={{
                        background: "#f1f5f9",
                        color: "#334155",
                        fontSize: "10.5px",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>

            {/* Education & Certifications */}
            <div>
              <h4 style={{ margin: "0 0 6px", fontSize: "11px", letterSpacing: "0.05em", color: activeTemplate.accent, textTransform: "uppercase" }}>
                Education & Certifications
              </h4>
              <div style={{ fontSize: "11px", lineHeight: "1.6", whiteSpace: "pre-line", color: "#334155" }}>
                {form.education}
                {"\n"}
                {form.certifications}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              className="air-btn-secondary"
              style={{ flex: 1 }}
              onClick={handleSaveDraft}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save as Draft
            </button>

            <button
              type="button"
              className="air-btn-primary"
              style={{ flex: 1.4 }}
              onClick={handleDownloadPDF}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Resume as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
