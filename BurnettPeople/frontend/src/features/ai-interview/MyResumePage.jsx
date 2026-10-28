import { useState, useRef } from "react";

export default function MyResumePage() {
  const [selectedFile, setSelectedFile] = useState({
    name: "Resume_gamastack_JuJOu8.pdf",
    size: "842 KB",
    date: "Oct 25, 2026 at 3:30 PM",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setSelectedFile({
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
        });
        setIsUploading(false);
        setUploadSuccess(true);
      }, 700);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `Mayank Joshi - Python Developer\n` +
      `Email: mayankjoshi@example.com | Phone: +91 9876543210 | Location: Indore, Madhya Pradesh\n` +
      `GitHub: github.com/mayankjoshi341 | LinkedIn: linkedin.com/in/mayank-joshi\n\n` +
      `PROFESSIONAL SUMMARY\n` +
      `Motivated Python Developer with experience in Django, Flask, and machine learning. Passionate about building scalable web applications, working with data, and solving real-world problems. Currently working as an intern, with hands-on experience in developing REST APIs, web portals, and AI-based applications.\n\n` +
      `TECHNICAL SKILLS\n` +
      `Python, Django, Flask, JavaScript, HTML, CSS, SQL, PostgreSQL, Machine Learning, Pandas, NumPy, Scikit-learn, Matplotlib, Git, REST APIs\n\n` +
      `EXPERIENCE\n` +
      `Python Developer Intern — Burnett Brücke Pvt. Ltd. (Jan 2026 - Present)\n` +
      `- Developed and maintained REST APIs using Django.\n` +
      `- Worked on HRMS and internal tools.\n` +
      `- Collaborated with the team to implement new features and fix bugs.\n` +
      `- Gained experience with PostgreSQL, Docker, and deployment.\n\n` +
      `PROJECTS\n` +
      `SnapClass – AI-Powered Attendance System (Mar 2026 - May 2026)\n` +
      `- Built a full-stack attendance platform using face recognition (OpenCV/YOLO).\n` +
      `- Implemented real-time recognition and automated attendance tracking.\n` +
      `- Used Django for backend, React for frontend, and PostgreSQL as database.\n\n` +
      `EDUCATION\n` +
      `B. Tech in Information Technology (2022 - 2026)\n` +
      `Oriental Institute of Science and Technology, Indore\n\n` +
      `CERTIFICATIONS\n` +
      `- AWS Cloud Practitioner (Amazon Web Services, Jun 2024)\n` +
      `- Python for Data Science (Coursera, Jan 2024)\n`
    ], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile?.name || "Mayank_Joshi_Resume.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const SKILLS = [
    "Python", "Django", "Flask", "JavaScript", "HTML", "CSS", "SQL",
    "PostgreSQL", "Machine Learning", "Pandas", "NumPy", "Scikit-learn",
    "Matplotlib", "Git", "REST APIs"
  ];

  return (
    <div className="aii-content-wrap">
      {/* Breadcrumbs */}
      <div className="aii-breadcrumbs">
        <span>AI Services</span> / <span>AI Interview Assistant</span> / <span>My Resume</span>
      </div>

      {/* Header Banner */}
      <div className="aii-page-header-row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="aii-page-title-box">
            <h1>My Resume</h1>
            <p>Upload your resume and we&apos;ll extract the details to personalize your interview practice.</p>
          </div>
        </div>

        {/* Right Decorative Graphic */}
        <div style={{ width: "130px", height: "65px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 130 65" fill="none" width="100%" height="100%">
            <path d="M15 50 C20 25 45 20 55 50" fill="#34d399" opacity="0.35" />
            <path d="M85 55 C95 30 120 25 125 55" fill="#34d399" opacity="0.35" />
            {/* Paper Document */}
            <rect x="42" y="8" width="46" height="52" rx="4" fill="#ffffff" stroke="#059669" strokeWidth="2" />
            <line x1="50" y1="18" x2="78" y2="18" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="26" x2="72" y2="26" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="34" x2="76" y2="34" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="42" x2="68" y2="42" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <circle cx="78" cy="46" r="6" fill="#f59e0b" />
          </svg>
        </div>
      </div>

      {/* 2-Column Split: Upload & Status (Left) vs Resume Sheet (Right) */}
      <div className="aii-resume-split">
        {/* Left Column */}
        <div>
          {/* Card 1: Upload Resume */}
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "var(--bpi-text-dark)" }}>
                Upload Resume
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--bpi-text-muted)", margin: "0 0 16px" }}>
              Upload a PDF or DOCX file (Max 10 MB) and we&apos;ll extract the information.
            </p>

            {/* Dropzone */}
            <div
              className="aii-upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <div className="aii-cloud-icon-circle">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                  <path d="M12 12v9" />
                  <path d="m16 16-4-4-4 4" />
                </svg>
              </div>
              <strong style={{ display: "block", fontSize: "14px", color: "var(--bpi-text-dark)", marginBottom: "4px" }}>
                Drag and drop your resume here
              </strong>
              <span style={{ display: "block", fontSize: "12px", color: "var(--bpi-text-muted)", marginBottom: "12px" }}>
                or choose a file from your computer
              </span>
              <button
                type="button"
                className="aii-btn-secondary"
                style={{ fontSize: "12px", padding: "6px 16px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose File
              </button>
              <div style={{ marginTop: "14px", fontSize: "11px", color: "var(--bpi-text-muted)" }}>
                Supported formats: PDF, DOCX | Maximum size: 10 MB
              </div>
            </div>

            <button
              type="button"
              className="aii-btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {isUploading ? "Analyzing Resume..." : "Upload & Analyze Resume"}
            </button>
          </div>

          {/* Card 2: Uploaded Resume */}
          {selectedFile && (
            <div className="aii-resume-card-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "var(--bpi-text-dark)" }}>
                    Uploaded Resume
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "var(--bpi-text-muted)", margin: "0 0 16px" }}>
                Your latest uploaded resume and analysis status.
              </p>

              {/* File Info Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "var(--bpi-mint-bg)",
                  borderRadius: "10px",
                  border: "1px solid var(--bpi-card-border)",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      background: "#fee2e2",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "800",
                      flexShrink: 0,
                    }}
                  >
                    PDF
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "13px",
                        color: "var(--bpi-text-dark)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedFile.name}
                    </strong>
                    <span style={{ fontSize: "11px", color: "var(--bpi-text-muted)" }}>
                      Uploaded on {selectedFile.date} • File size: {selectedFile.size}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span className="aii-badge-completed">● Analysis Ready</span>
                  <span style={{ color: "var(--bpi-text-muted)", cursor: "pointer", fontSize: "16px" }}>⋮</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="aii-btn-secondary"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                  onClick={handleDownload}
                >
                  👁 View Original
                </button>
                <button
                  type="button"
                  className="aii-btn-secondary"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  🔄 Replace File
                </button>
                <button
                  type="button"
                  className="aii-btn-secondary"
                  style={{ fontSize: "12px", padding: "6px 12px", color: "#dc2626" }}
                  onClick={() => setSelectedFile(null)}
                >
                  🗑 Delete
                </button>
              </div>

              {/* Success Banner */}
              {uploadSuccess && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "8px",
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#059669",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ fontSize: "12px", color: "#065f46" }}>
                    Your resume has been successfully analyzed and is ready to use for personalized interview practice.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Resume Preview */}
        <div className="aii-resume-preview-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--bpi-text-dark)" }}>
                Resume Preview
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                className="aii-btn-secondary"
                style={{ fontSize: "12px", padding: "6px 14px" }}
                onClick={handleDownload}
              >
                ⭳ Download Resume
              </button>
              <span style={{ color: "var(--bpi-text-muted)", cursor: "pointer", fontSize: "16px" }}>⋮</span>
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--bpi-text-muted)", margin: "0 0 18px" }}>
            Here&apos;s the extracted information from your resume.
          </p>

          {/* Document Sheet */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "32px 36px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              color: "#1e293b",
            }}
          >
            {/* Name & Contact */}
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 2px", color: "#0f172a" }}>
                Mayank Joshi
              </h2>
              <span style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#059669", marginBottom: "8px" }}>
                Python Developer
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "12px", color: "#64748b" }}>
                <span>✉ mayankjoshi@example.com</span>
                <span>📞 +91 9876543210</span>
                <span>📍 Indore, Madhya Pradesh</span>
                <span>🔗 github.com/mayankjoshi341</span>
                <span>🔗 linkedin.com/in/mayank-joshi</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", marginBottom: "18px" }} />

            {/* Section: Professional Summary */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                  👤
                </span>
                <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Professional Summary</strong>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.6", color: "#334155" }}>
                Motivated Python Developer with experience in Django, Flask, and machine learning. Passionate about building scalable web applications, working with data, and solving real-world problems. Currently working as an intern, with hands-on experience in developing REST APIs, web portals, and AI-based applications.
              </p>
            </div>

            {/* Section: Technical Skills */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                  &lt;/&gt;
                </span>
                <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Technical Skills</strong>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {SKILLS.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      fontSize: "11px",
                      fontWeight: "500",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "#f0fdf4",
                      color: "#065f46",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Section: Experience */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                  💼
                </span>
                <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Experience</strong>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                    Python Developer Intern — Burnett Brücke Pvt. Ltd.
                  </strong>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    Jan 2026 – Present (5 months)
                  </span>
                </div>
                <div style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 6px" }}>
                  📍 Indore, Madhya Pradesh
                </div>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", lineHeight: "1.6", color: "#334155" }}>
                  <li>Developed and maintained REST APIs using Django.</li>
                  <li>Worked on HRMS and internal tools.</li>
                  <li>Collaborated with the team to implement new features and fix bugs.</li>
                  <li>Gained experience with PostgreSQL, Docker, and deployment.</li>
                </ul>
              </div>
            </div>

            {/* Section: Projects */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                  📁
                </span>
                <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Projects</strong>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                    SnapClass – AI-Powered Attendance System
                  </strong>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    Mar 2026 – May 2026
                  </span>
                </div>
                <ul style={{ margin: "4px 0 0", paddingLeft: "18px", fontSize: "12px", lineHeight: "1.6", color: "#334155" }}>
                  <li>Built a full-stack attendance platform using face recognition (OpenCV/YOLO).</li>
                  <li>Implemented real-time recognition and automated attendance tracking.</li>
                  <li>Used Django for backend, React for frontend, and PostgreSQL as database.</li>
                </ul>
              </div>
            </div>

            {/* Section: Education */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                  🎓
                </span>
                <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Education</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                  B. Tech in Information Technology
                </strong>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>2022 – 2026</span>
              </div>
              <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                📍 Oriental Institute of Science and Technology, Indore
              </div>
            </div>

            {/* Section: Certifications */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                  🎖
                </span>
                <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>Certifications</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "#334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span>• <strong>AWS Cloud Practitioner</strong> — Amazon Web Services</span>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>Jun 2024</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span>• <strong>Python for Data Science</strong> — Coursera</span>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>Jan 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
