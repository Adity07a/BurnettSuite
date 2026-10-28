import { useState } from "react";

export default function ResumeProfilePage({ user, onNavigate }) {
  const [profile, setProfile] = useState({
    headline: "Full Stack Python & React Developer",
    bio: "Motivated engineer dedicated to building clean, maintainable web services and responsive interfaces.",
    phone: "+91 9876543210",
    location: "Indore, Madhya Pradesh, India",
    linkedin: "https://linkedin.com/in/mayankjoshi",
    github: "https://github.com/mayankjoshi",
    portfolio: "https://mayankjoshi.dev",
  });

  const [savedMsg, setSavedMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg("Career profile updated successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <div className="air-content-wrap">
      <div className="air-breadcrumbs">
        <span>AI Resume Creator</span> / <span>Profile</span>
      </div>

      <div className="air-page-header-row">
        <div className="air-page-title-box">
          <h1>Career Profile Root</h1>
          <p>This master profile synchronizes with BurnettPeople and auto-populates your resume drafts.</p>
        </div>
      </div>

      <div className="air-card-panel" style={{ maxWidth: "760px" }}>
        <form onSubmit={handleSave}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--bp-card-border)" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#059669",
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {user?.first_name ? user.first_name[0] : "M"}
            </div>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "18px" }}>
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Mayank Joshi"}
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--bp-text-muted)" }}>
                {user?.email || "mayank@example.com"} &bull; {user?.role || "EMPLOYEE"} (BurnettPeople Verified)
              </p>
            </div>
          </div>

          <div className="air-field-group">
            <label>Professional Headline</label>
            <input
              type="text"
              value={profile.headline}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            />
          </div>

          <div className="air-field-group">
            <label>Professional Bio</label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <div className="air-form-grid-2">
            <div className="air-field-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="air-field-group">
              <label>Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
          </div>

          <div className="air-form-grid-2">
            <div className="air-field-group">
              <label>LinkedIn URL</label>
              <input
                type="url"
                value={profile.linkedin}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
              />
            </div>
            <div className="air-field-group">
              <label>GitHub URL</label>
              <input
                type="url"
                value={profile.github}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
              />
            </div>
          </div>

          {savedMsg && (
            <div className="air-alert-box" style={{ margin: "16px 0" }}>
              {savedMsg}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
            <button type="button" className="air-btn-secondary" onClick={() => onNavigate("dashboard")}>
              Cancel
            </button>
            <button type="submit" className="air-btn-primary">
              Save Career Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
