import { useEffect, useState } from "react";
import apiClient from "./api/client";
import { Icon } from "./DashboardIcons";
import { getErrorMessage } from "./dashboardUtils";
import "./AIServices.css";

/* ------------------------------------------------------------------
   Constants — point these at your deployed service URLs.
   In development both sub-projects run on separate Vite ports.
   In production they can be deployed on any origin / path.
   ------------------------------------------------------------------ */
const AI_RESUME_URL = (
  import.meta.env.VITE_AI_RESUME_URL || "http://localhost:5174"
).replace(/\/$/, "");

const AI_INTERVIEW_URL = (
  import.meta.env.VITE_AI_INTERVIEW_URL || "http://localhost:5175"
).replace(/\/$/, "");

/* ------------------------------------------------------------------
   Stat card pulled from the BurnettPeople backend (demo-safe)
   ------------------------------------------------------------------ */
const DEMO_STATS = {
  resumes_created: 3,
  resumes_uploaded: 1,
  interviews_taken: 2,
  average_performance: 78,
};

const RECENT_DEMO = [
  {
    id: 1,
    icon: "file",
    text: "You created a new resume",
    sub: "Software Developer · Oct 26, 2026",
    color: "green",
  },
  {
    id: 2,
    icon: "user",
    text: "You completed an interview",
    sub: "Frontend Developer · Oct 26, 2026",
    color: "blue",
  },
  {
    id: 3,
    icon: "download",
    text: "You downloaded your resume",
    sub: "Backend Developer · Oct 24, 2026",
    color: "teal",
  },
];

const WHY_CARDS = [
  {
    icon: "flame",
    color: "green",
    title: "Stand Out",
    desc: "Create resumes that get noticed by recruiters.",
  },
  {
    icon: "shield",
    color: "blue",
    title: "Build Confidence",
    desc: "Practice interviews anytime, anywhere.",
  },
  {
    icon: "clock",
    color: "orange",
    title: "Save Time",
    desc: "Get results in minutes, not hours.",
  },
  {
    icon: "chart",
    color: "purple",
    title: "Be Future Ready",
    desc: "Gain skills and prepare for your next opportunity.",
  },
];

/* ------------------------------------------------------------------
   Open external AI service in a new tab.
   A future enhancement can pass a short-lived SSO token here.
   ------------------------------------------------------------------ */
function openService(baseUrl, path = "") {
  const url = path ? `${baseUrl}${path}` : baseUrl;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ------------------------------------------------------------------
   Hero illustration for Resume Creator card (inline SVG)
   ------------------------------------------------------------------ */
function ResumeIllustration() {
  return (
    <svg
      className="ais-card-illustration"
      viewBox="0 0 140 120"
      fill="none"
      aria-hidden="true"
    >
      {/* Paper */}
      <rect x="20" y="8" width="80" height="104" rx="6" fill="#e8f9f4" stroke="#1f9d73" strokeWidth="1.2" />
      {/* Header line */}
      <rect x="32" y="22" width="40" height="8" rx="3" fill="#1f9d73" />
      <rect x="32" y="35" width="56" height="5" rx="2.5" fill="#b2e8d8" />
      {/* Section lines */}
      <rect x="32" y="50" width="28" height="4" rx="2" fill="#1f9d73" opacity="0.7" />
      <rect x="32" y="58" width="56" height="3" rx="1.5" fill="#d1f0e8" />
      <rect x="32" y="64" width="48" height="3" rx="1.5" fill="#d1f0e8" />
      <rect x="32" y="70" width="52" height="3" rx="1.5" fill="#d1f0e8" />
      {/* Skills */}
      <rect x="32" y="82" width="28" height="4" rx="2" fill="#1f9d73" opacity="0.7" />
      <rect x="32" y="90" width="18" height="7" rx="3.5" fill="#b2e8d8" />
      <rect x="54" y="90" width="18" height="7" rx="3.5" fill="#b2e8d8" />
      <rect x="76" y="90" width="18" height="7" rx="3.5" fill="#b2e8d8" />
      {/* AI badge */}
      <circle cx="112" cy="30" r="16" fill="#1f9d73" />
      <text x="112" y="35" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">AI</text>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Hero illustration for Interview Assistant card
   ------------------------------------------------------------------ */
function InterviewIllustration() {
  return (
    <svg
      className="ais-card-illustration"
      viewBox="0 0 140 120"
      fill="none"
      aria-hidden="true"
    >
      {/* Robot head */}
      <rect x="45" y="20" width="50" height="44" rx="10" fill="#e8f4ff" stroke="#3b82f6" strokeWidth="1.4" />
      {/* Eyes */}
      <circle cx="63" cy="38" r="6" fill="#3b82f6" />
      <circle cx="77" cy="38" r="6" fill="#3b82f6" />
      <circle cx="65" cy="36" r="2" fill="white" />
      <circle cx="79" cy="36" r="2" fill="white" />
      {/* Mouth */}
      <rect x="58" y="51" width="24" height="4" rx="2" fill="#3b82f6" opacity="0.6" />
      {/* Antenna */}
      <line x1="70" y1="20" x2="70" y2="10" stroke="#3b82f6" strokeWidth="1.5" />
      <circle cx="70" cy="8" r="3" fill="#3b82f6" />
      {/* Speech bubble */}
      <rect x="95" y="25" width="36" height="22" rx="6" fill="#3b82f6" />
      <path d="M95 38 L88 43 L97 38" fill="#3b82f6" />
      <rect x="101" y="30" width="24" height="3" rx="1.5" fill="white" opacity="0.8" />
      <rect x="101" y="36" width="18" height="3" rx="1.5" fill="white" opacity="0.8" />
      {/* Answer bubble */}
      <rect x="10" y="65" width="58" height="18" rx="6" fill="#e8f4ff" stroke="#3b82f6" strokeWidth="1" />
      <rect x="16" y="70" width="40" height="3" rx="1.5" fill="#3b82f6" opacity="0.5" />
      <rect x="16" y="76" width="28" height="3" rx="1.5" fill="#3b82f6" opacity="0.5" />
      {/* Bottom text */}
      <text x="70" y="108" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="600">Great answer!</text>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Stat value card
   ------------------------------------------------------------------ */
function StatTile({ icon, label, value, note }) {
  return (
    <div className="ais-stat-tile">
      <span className="ais-stat-icon">
        <Icon name={icon} size={22} />
      </span>
      <div className="ais-stat-body">
        <p className="ais-stat-label">{label}</p>
        <strong className="ais-stat-value">{value ?? "—"}</strong>
        {note && <small className="ais-stat-note">{note}</small>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Main AI Services Page
   ------------------------------------------------------------------ */
export default function AIServicesPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(RECENT_DEMO);
  const [statsError, setStatsError] = useState("");

  /* Attempt to load real stats from BurnettPeople backend.
     The endpoint /ai-services/stats/ can be added later;
     if it returns 404 we fall back to demo numbers silently. */
  useEffect(() => {
    let active = true;
    apiClient
      .get("/ai-services/stats/")
      .then((data) => {
        if (!active) return;
        setStats(data);
        if (Array.isArray(data?.recent_activity)) {
          setRecent(data.recent_activity);
        }
        setStatsError("");
      })
      .catch((err) => {
        if (!active) return;
        // 404 = endpoint not yet deployed — use demo silently
        if (err?.status !== 404) {
          setStatsError(getErrorMessage(err, ""));
        }
        setStats(DEMO_STATS);
      });
    return () => { active = false; };
  }, []);

  const s = stats || DEMO_STATS;

  return (
    <div className="ais-page">

      {/* ── Hero banner ────────────────────────────────────────── */}
      <div className="ais-hero">
        <div className="ais-hero-left">
          <span className="ais-hero-eyebrow">
            <Icon name="sun" size={18} />
            AI Services
          </span>
          <h1 className="ais-hero-title">Smarter Tools. Better Opportunities.</h1>
          <p className="ais-hero-desc">
            Leverage the power of AI to build your career, improve your skills and
            unlock new opportunities.
          </p>
        </div>
        <div className="ais-hero-right">
          <p className="ais-hero-right-tag">
            Create resumes, practice interviews, and get AI-powered guidance — all
            in one place.
          </p>
        </div>
      </div>

      {statsError && (
        <p className="ais-alert" role="alert">{statsError}</p>
      )}

      {/* ── Service cards ──────────────────────────────────────── */}
      <div className="ais-cards">

        {/* ── Resume Creator ─── */}
        <article className="ais-card ais-card--resume">
          <div className="ais-card-content">
            <div className="ais-card-header">
              <span className="ais-card-badge ais-card-badge--green">
                <Icon name="file" size={18} />
              </span>
              <h2 className="ais-card-title">AI Resume Creator</h2>
            </div>
            <p className="ais-card-tagline">
              Build a professional resume tailored to your goals.
            </p>
            <p className="ais-card-desc">
              Create a modern, ATS-friendly resume using AI. Just add your
              skills, experience and target role — get a polished resume ready to
              download in minutes.
            </p>
            <ul className="ais-card-features">
              <li><Icon name="check" size={14} /> AI-powered content suggestions</li>
              <li><Icon name="check" size={14} /> Multiple professional templates</li>
              <li><Icon name="check" size={14} /> ATS-friendly format</li>
              <li><Icon name="check" size={14} /> Download as PDF</li>
            </ul>
            <button
              type="button"
              className="ais-card-cta ais-card-cta--green"
              onClick={() => openService(AI_RESUME_URL, "/dashboard")}
            >
              Create Resume <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="ais-card-visual">
            <ResumeIllustration />
          </div>
        </article>

        {/* ── Interview Assistant ─── */}
        <article className="ais-card ais-card--interview">
          <div className="ais-card-content">
            <div className="ais-card-header">
              <span className="ais-card-badge ais-card-badge--blue">
                <Icon name="user" size={18} />
              </span>
              <h2 className="ais-card-title">AI Interview Assistant</h2>
            </div>
            <p className="ais-card-tagline">
              Practice, improve and get interview ready.
            </p>
            <p className="ais-card-desc">
              Use your resume to start an AI-powered mock interview. Get
              real-time feedback, improve your answers and build confidence for
              your next opportunity.
            </p>
            <ul className="ais-card-features">
              <li><Icon name="check" size={14} /> Resume-based personalized questions</li>
              <li><Icon name="check" size={14} /> Real-time feedback &amp; score</li>
              <li><Icon name="check" size={14} /> Answer suggestions</li>
              <li><Icon name="check" size={14} /> Track your progress</li>
            </ul>
            <button
              type="button"
              className="ais-card-cta ais-card-cta--blue"
              onClick={() => openService(AI_INTERVIEW_URL, "/dashboard")}
            >
              Start Interview <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="ais-card-visual">
            <InterviewIllustration />
          </div>
        </article>

      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div className="ais-stats">
        <StatTile
          icon="file"
          label="Total Resumes Created"
          value={s.resumes_created}
          note="↑ +2 this month"
        />
        <StatTile
          icon="download"
          label="Resumes Uploaded"
          value={s.resumes_uploaded}
          note="↑ +1 this month"
        />
        <StatTile
          icon="user"
          label="Total Interviews Taken"
          value={s.interviews_taken}
          note="↑ +1 this week"
        />
        <StatTile
          icon="chart"
          label="Average Performance"
          value={s.average_performance != null ? `${s.average_performance}%` : null}
          note="↑ +12%, this month"
        />
      </div>

      {/* ── Why Use section + Recent Activity ─────────────────── */}
      <div className="ais-lower">

        <section className="ais-why" aria-labelledby="ais-why-title">
          <h2 id="ais-why-title">Why Use Our AI Services?</h2>
          <div className="ais-why-grid">
            {WHY_CARDS.map(({ icon, color, title, desc }) => (
              <div className="ais-why-card" key={title}>
                <span className={`ais-why-icon ais-why-icon--${color}`}>
                  <Icon name={icon} size={22} />
                </span>
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="ais-recent" aria-labelledby="ais-recent-title">
          <div className="ais-recent-head">
            <h2 id="ais-recent-title">Recent Activity</h2>
            <button
              type="button"
              className="ais-recent-viewall"
              onClick={() => openService(AI_RESUME_URL, "/dashboard")}
            >
              View All →
            </button>
          </div>
          <ul className="ais-recent-list">
            {recent.map((item) => (
              <li key={item.id} className="ais-recent-item">
                <span className={`ais-recent-icon ais-recent-icon--${item.color || "green"}`}>
                  <Icon name={item.icon || "file"} size={16} />
                </span>
                <div>
                  <p className="ais-recent-text">{item.text}</p>
                  <small className="ais-recent-sub">{item.sub}</small>
                </div>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="ais-recent-empty">No recent activity yet.</li>
            )}
          </ul>
        </aside>

      </div>

      {/* ── Footer breadcrumb ──────────────────────────────────── */}
      <p className="ais-footer-note">
        BurnettPeople &nbsp;|&nbsp; AI Services
      </p>
    </div>
  );
}
