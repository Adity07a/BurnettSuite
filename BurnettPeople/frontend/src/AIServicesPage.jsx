import { useEffect, useState } from "react";
import apiClient from "./api/client";
import { Icon } from "./DashboardIcons";
import { getErrorMessage } from "./dashboardUtils";
import AIResumeWorkspace from "./features/ai-resume/AIResumeWorkspace";
import "./AIServices.css";

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
    sub: "Software Developer &bull; Oct 26, 2026",
    color: "green",
  },
  {
    id: 2,
    icon: "user",
    text: "You completed an interview",
    sub: "Frontend Developer &bull; Oct 26, 2026",
    color: "blue",
  },
  {
    id: 3,
    icon: "download",
    text: "You downloaded your resume",
    sub: "Backend Developer &bull; Oct 24, 2026",
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
    title: "Track Progress",
    desc: "See how your skills and interview scores improve.",
  },
];

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
      <rect x="25" y="10" width="90" height="100" rx="6" fill="#ecfdf5" stroke="#059669" strokeWidth="2" />
      <rect x="37" y="24" width="30" height="6" rx="3" fill="#059669" />
      <rect x="37" y="36" width="66" height="4" rx="2" fill="#a7f3d0" />
      <rect x="37" y="44" width="56" height="4" rx="2" fill="#a7f3d0" />
      <rect x="37" y="52" width="60" height="4" rx="2" fill="#a7f3d0" />
      <line x1="37" y1="64" x2="103" y2="64" stroke="#d1fae5" strokeWidth="2" />
      <circle cx="50" cy="78" r="8" fill="#059669" />
      <rect x="64" y="74" width="39" height="4" rx="2" fill="#059669" />
      <rect x="64" y="82" width="28" height="4" rx="2" fill="#a7f3d0" />
      <circle cx="95" cy="30" r="14" fill="#059669" opacity="0.15" />
      <path d="M95 24l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5 1.5-3.5z" fill="#059669" />
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
      <rect x="20" y="20" width="100" height="80" rx="8" fill="#eff6ff" stroke="#2563eb" strokeWidth="2" />
      <circle cx="50" cy="52" r="14" fill="#2563eb" opacity="0.2" />
      <circle cx="50" cy="48" r="7" fill="#2563eb" />
      <path d="M38 66c0-6 6-8 12-8s12 2 12 8" fill="#2563eb" />
      <rect x="72" y="42" width="38" height="6" rx="3" fill="#2563eb" />
      <rect x="72" y="52" width="26" height="4" rx="2" fill="#93c5fd" />
      <rect x="72" y="60" width="32" height="4" rx="2" fill="#93c5fd" />
      <circle cx="104" cy="84" r="12" fill="#2563eb" />
      <path d="M100 84l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ==================================================================
   Main Component
   ================================================================== */
export default function AIServicesPage({ user }) {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const [showResumeWorkspace, setShowResumeWorkspace] = useState(false);
  const [resumeInitialPage, setResumeInitialPage] = useState("dashboard");

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const response = await apiClient.get("/ai-services/stats/");
        if (!cancelled && response?.data) {
          setStats(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err?.status !== 404) {
            setStatsError(getErrorMessage(err, "Failed to load AI stats."));
          }
          setStats(DEMO_STATS);
        }
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  // If the user navigates into the embedded AI Resume Workspace, render it directly
  if (showResumeWorkspace) {
    return (
      <AIResumeWorkspace
        user={user}
        initialPage={resumeInitialPage}
        onBackToBurnett={() => setShowResumeWorkspace(false)}
      />
    );
  }

  const s = stats || DEMO_STATS;

  return (
    <div className="ais-page">
      {/* Hero banner */}
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
            Create resumes, practice interviews, and get AI-powered guidance &mdash; all
            in one place.
          </p>
        </div>
      </div>

      {statsError && (
        <p className="ais-alert" role="alert">{statsError}</p>
      )}

      {/* Service cards */}
      <div className="ais-cards">
        {/* Resume Creator */}
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
              skills, experience and target role &mdash; get a polished resume ready to
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
              onClick={() => {
                setResumeInitialPage("dashboard");
                setShowResumeWorkspace(true);
              }}
            >
              Create Resume <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="ais-card-visual">
            <ResumeIllustration />
          </div>
        </article>

        {/* Interview Assistant */}
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
              onClick={() => {
                alert("AI Interview Assistant mock interview environment is preparing. You can start by preparing your resume first!");
              }}
            >
              Start Interview <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="ais-card-visual">
            <InterviewIllustration />
          </div>
        </article>
      </div>

      {/* Stats row */}
      <div className="ais-stats-row">
        <div className="ais-stat-tile">
          <span className="ais-stat-val">{s.resumes_created}</span>
          <span className="ais-stat-lbl">Resumes Created</span>
        </div>
        <div className="ais-stat-tile">
          <span className="ais-stat-val">{s.resumes_uploaded}</span>
          <span className="ais-stat-lbl">Resumes Uploaded</span>
        </div>
        <div className="ais-stat-tile">
          <span className="ais-stat-val">{s.interviews_taken}</span>
          <span className="ais-stat-lbl">Interviews Taken</span>
        </div>
        <div className="ais-stat-tile">
          <span className="ais-stat-val ais-stat-val--perf">{s.average_performance}%</span>
          <span className="ais-stat-lbl">Average Performance</span>
        </div>
      </div>

      {/* Bottom section: Why Use + Recent Activity */}
      <div className="ais-bottom-grid">
        <section className="ais-why-section" aria-labelledby="ais-why-title">
          <div className="ais-why-head">
            <h2 id="ais-why-title">Why Use BurnettPeople AI?</h2>
            <p className="ais-why-sub">Everything you need to succeed in one place</p>
          </div>
          <div className="ais-why-grid">
            {WHY_CARDS.map((card) => (
              <div key={card.title} className="ais-why-card">
                <span className={`ais-why-icon ais-why-icon--${card.color}`}>
                  <Icon name={card.icon} size={20} />
                </span>
                <div className="ais-why-text">
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="ais-recent-section" aria-labelledby="ais-recent-title">
          <div className="ais-recent-head">
            <h2 id="ais-recent-title">Recent Activity</h2>
            <button
              type="button"
              className="ais-recent-viewall"
              onClick={() => {
                setResumeInitialPage("dashboard");
                setShowResumeWorkspace(true);
              }}
            >
              View All &rarr;
            </button>
          </div>
          <ul className="ais-recent-list">
            {RECENT_DEMO.map((item) => (
              <li key={item.id} className="ais-recent-item">
                <span className={`ais-recent-icon ais-recent-icon--${item.color}`}>
                  <Icon name={item.icon} size={16} />
                </span>
                <div className="ais-recent-text">
                  <p className="ais-recent-title">{item.text}</p>
                  <small className="ais-recent-sub">{item.sub}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
