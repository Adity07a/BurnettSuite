import { useState } from "react";

export default function ResumeTemplatesGallery({ onNavigate, onSelectTemplate }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const TEMPLATES = [
    {
      id: "classic",
      name: "Classic ATS",
      category: "ats",
      description: "Traditional single-column layout optimized for high ATS pass rates.",
      accent: "#1e293b",
    },
    {
      id: "professional",
      name: "Navy Professional",
      category: "professional",
      recommended: true,
      description: "Executive navy header with clear section dividers and polished typography.",
      accent: "#1e3a5f",
    },
    {
      id: "modern",
      name: "Modern ATS",
      category: "modern",
      description: "Clean contemporary layout with subtle green accents and timeline layout.",
      accent: "#059669",
    },
    {
      id: "minimal",
      name: "Minimal ATS",
      category: "ats",
      description: "Generous whitespace, bold headers, and crisp typography for fast scanning.",
      accent: "#334155",
    },
    {
      id: "technical",
      name: "Technical ATS",
      category: "professional",
      description: "Structured specifically for software engineers with prominent tech stack chips.",
      accent: "#0f766e",
    },
    {
      id: "executive",
      name: "Executive ATS",
      category: "professional",
      description: "High-density leadership template showcasing metrics, scope, and impact.",
      accent: "#854d0e",
    },
    {
      id: "contemporary",
      name: "Contemporary ATS",
      category: "modern",
      description: "Modern gradient header with crisp typography and clean skill tags.",
      accent: "#0891b2",
    },
    {
      id: "compact",
      name: "Compact ATS",
      category: "ats",
      description: "Dense single-page layout designed to fit extensive career histories.",
      accent: "#7c2d12",
    },
  ];

  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "ats" && t.category === "ats") ||
      (filter === "modern" && t.category === "modern") ||
      (filter === "professional" && t.category === "professional");

    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUseTemplate = (templateId) => {
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
    } else {
      onNavigate("builder");
    }
  };

  return (
    <div className="air-content-wrap">
      {/* Breadcrumbs */}
      <div className="air-breadcrumbs">
        <span>AI Resume Creator</span> / <span>Templates</span>
      </div>

      {/* Header */}
      <div className="air-page-header-row">
        <div className="air-page-title-box">
          <h1>Resume Templates Gallery</h1>
          <p>Choose from a variety of professional templates to make your resume stand out.</p>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="air-search-filter-row" style={{ alignItems: "center", marginBottom: "20px" }}>
        <div className="air-search-field-wide" style={{ maxWidth: "420px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
          />
        </div>

        <div className="air-filter-pills" style={{ margin: 0 }}>
          <button
            type="button"
            className={`air-filter-pill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`air-filter-pill ${filter === "ats" ? "active" : ""}`}
            onClick={() => setFilter("ats")}
          >
            ATS-friendly
          </button>
          <button
            type="button"
            className={`air-filter-pill ${filter === "modern" ? "active" : ""}`}
            onClick={() => setFilter("modern")}
          >
            Modern
          </button>
          <button
            type="button"
            className={`air-filter-pill ${filter === "professional" ? "active" : ""}`}
            onClick={() => setFilter("professional")}
          >
            Professional
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="air-templates-grid">
        {filteredTemplates.map((template) => (
          <div className="air-template-card" key={template.id}>
            {template.recommended && (
              <div className="air-recommended-badge">
                <span>★</span> Recommended
              </div>
            )}

            {/* Template Visual Thumbnail */}
            <div className="air-template-preview-box">
              <div
                style={{
                  width: "180px",
                  height: "240px",
                  background: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  borderRadius: "4px",
                  padding: "12px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderTop: `4px solid ${template.accent}`,
                  fontSize: "7px",
                  color: "#334155",
                  overflow: "hidden",
                }}
              >
                {/* Simulated Header */}
                <div style={{ textAlign: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                  <strong style={{ fontSize: "9px", color: template.accent, display: "block" }}>MAYANK JOSHI</strong>
                  <span style={{ color: "#64748b", fontSize: "6.5px" }}>Full Stack Developer &bull; Indore, India</span>
                </div>

                {/* Simulated Summary */}
                <div>
                  <strong style={{ color: template.accent, fontSize: "7px" }}>SUMMARY</strong>
                  <div style={{ height: "3px", background: "#e2e8f0", borderRadius: "1px", margin: "2px 0" }} />
                  <div style={{ height: "3px", width: "80%", background: "#e2e8f0", borderRadius: "1px" }} />
                </div>

                {/* Simulated Experience */}
                <div>
                  <strong style={{ color: template.accent, fontSize: "7px" }}>EXPERIENCE</strong>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "6.5px", fontWeight: "600", marginTop: "2px" }}>
                    <span>Software Engineer</span>
                    <span style={{ color: "#94a3b8" }}>2024 - Present</span>
                  </div>
                  <div style={{ height: "3px", background: "#f1f5f9", margin: "2px 0" }} />
                  <div style={{ height: "3px", width: "90%", background: "#f1f5f9" }} />
                </div>

                {/* Simulated Skills */}
                <div style={{ marginTop: "auto" }}>
                  <strong style={{ color: template.accent, fontSize: "7px" }}>SKILLS</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginTop: "2px" }}>
                    {["Python", "React", "Django", "SQL"].map((s) => (
                      <span key={s} style={{ background: "#f1f5f9", padding: "1px 3px", borderRadius: "2px", fontSize: "5.5px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Template Card Footer */}
            <div className="air-template-card-footer">
              <h4>{template.name}</h4>
              <div className="air-template-btn-row">
                <button
                  type="button"
                  className="air-btn-preview"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Preview
                </button>
                <button
                  type="button"
                  className="air-btn-use"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            style={{
              background: "var(--bp-card-bg)",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px" }}>{previewTemplate.name}</h3>
              <button
                type="button"
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--bp-text-muted)" }}
                onClick={() => setPreviewTemplate(null)}
              >
                &times;
              </button>
            </div>
            <p style={{ color: "var(--bp-text-muted)", fontSize: "14px", margin: "0 0 20px" }}>
              {previewTemplate.description}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                className="air-btn-secondary"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="air-btn-primary"
                onClick={() => {
                  const id = previewTemplate.id;
                  setPreviewTemplate(null);
                  handleUseTemplate(id);
                }}
              >
                Use this Template &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
