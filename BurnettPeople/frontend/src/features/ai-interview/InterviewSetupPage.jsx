import { useState } from "react";

export default function InterviewSetupPage({ onStartInterview, onNavigate }) {
  const [interviewType, setInterviewType] = useState("technical");
  const [difficulty, setDifficulty] = useState("medium");
  const [duration, setDuration] = useState(30);
  const [targetRole, setTargetRole] = useState("Python Backend Developer");
  const [jobDescription, setJobDescription] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  const TYPES = [
    {
      id: "technical",
      title: "Technical Interview",
      desc: "Coding fundamentals, frameworks, database queries, and system concepts.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      id: "hr",
      title: "HR & Behavioral",
      desc: "STAR method questions, teamwork, workplace conflicts, and career ambitions.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "project",
      title: "Project Architecture",
      desc: "Deep-dive into your past projects, technical trade-offs, and scaling bottlenecks.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
    },
  ];

  const LEVELS = [
    { id: "easy", title: "Easy", desc: "Core fundamentals and conceptual definitions" },
    { id: "medium", title: "Medium", desc: "Applied problem solving and scenario handling" },
    { id: "hard", title: "Hard", desc: "Edge cases, trade-offs, and architectural design" },
  ];

  const handleLaunch = (e) => {
    e.preventDefault();
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      onStartInterview({
        interviewType,
        difficulty,
        duration,
        targetRole,
        jobDescription,
      });
    }, 600);
  };

  return (
    <div className="aii-content-wrap">
      {/* Breadcrumbs */}
      <div style={{ fontSize: "12px", color: "var(--bpi-text-muted)", marginBottom: "6px" }}>
        <span>AI Interview Platform</span> / <span>Setup</span>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 4px", color: "var(--bpi-text-dark)" }}>
          Configure Your Mock Interview
        </h1>
        <p style={{ fontSize: "13.5px", color: "var(--bpi-text-muted)", margin: 0 }}>
          Customize your session to match the exact role, difficulty, and duration you want to practice.
        </p>
      </div>

      <form onSubmit={handleLaunch}>
        {/* Step 1: Select Type */}
        <div className="aii-card-panel">
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>
            1. Select Interview Focus
          </h3>
          <div className="aii-grid-3">
            {TYPES.map((t) => (
              <div
                key={t.id}
                className={`aii-select-card ${interviewType === t.id ? "active" : ""}`}
                onClick={() => setInterviewType(t.id)}
              >
                <div className="aii-select-card-header">
                  <span style={{ color: "var(--bpi-primary)" }}>{t.icon}</span>
                  <h4>{t.title}</h4>
                </div>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Select Difficulty */}
        <div className="aii-card-panel">
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>
            2. Choose Difficulty Level
          </h3>
          <div className="aii-grid-3">
            {LEVELS.map((lvl) => (
              <div
                key={lvl.id}
                className={`aii-select-card ${difficulty === lvl.id ? "active" : ""}`}
                onClick={() => setDifficulty(lvl.id)}
              >
                <div className="aii-select-card-header">
                  <h4>{lvl.title}</h4>
                </div>
                <p>{lvl.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Role & Context */}
        <div className="aii-card-panel">
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>
            3. Target Role & Context
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                Target Role / Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--bpi-card-border)",
                  fontSize: "13.5px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                Session Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--bpi-card-border)",
                  fontSize: "13.5px",
                  boxSizing: "border-box",
                }}
              >
                <option value={15}>15 Minutes (Express - 3 Questions)</option>
                <option value={30}>30 Minutes (Standard - 5 Questions)</option>
                <option value={45}>45 Minutes (Full Simulation - 8 Questions)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
              Job Description (Optional context for personalized questions)
            </label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste responsibilities, key tech stack requirements or company background..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--bpi-card-border)",
                fontSize: "13px",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            className="aii-btn-secondary"
            onClick={() => onNavigate("dashboard")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="aii-btn-primary"
            disabled={isLaunching}
            style={{ fontSize: "15px", padding: "12px 28px" }}
          >
            {isLaunching ? "Preparing AI Room..." : "Launch Mock Interview →"}
          </button>
        </div>
      </form>
    </div>
  );
}
