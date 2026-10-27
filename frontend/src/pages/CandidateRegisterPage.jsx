import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { homeForUser } from "../config/roles";
import burnettLogo from "../assets/burnettpeople-logo.png";
import loginDarkTeal from "../assets/login-dark-teal.png";
import loginSoftMint from "../assets/login-soft-mint.png";

export default function CandidateRegisterPage({ onLoginSuccess }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setBusy(true);
    try {
      const data = await apiClient.post(
        "/auth/register/",
        {
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
        { auth: false, skipRefresh: true }
      );

      if (data?.tokens) {
        apiClient.setSessionTokens(data.tokens);
        if (onLoginSuccess && data.user) {
          onLoginSuccess(data.user);
        }
        navigate(homeForUser(data.user), { replace: true });
      } else {
        navigate("/", { replace: true, state: { registered: true } });
      }
    } catch (err) {
      setError(err?.message || "Registration failed. Please check your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section
        className="brand-panel"
        style={{
          backgroundImage: `url(${loginDarkTeal})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="brand-top">
          <img src={burnettLogo} alt="BurnettSuite logo" className="brand-image" />
        </div>

        <div className="brand-content">
          <div className="eyebrow">
            <span className="live-dot" />
            BURNETTSUITE AI CAREER PLATFORM
          </div>

          <h1 className="hero-title">
            Build your resume.
            <br />
            Ace your interview.
          </h1>

          <p className="brand-description">
            Join BurnettSuite to craft ATS-optimized resumes tailored to job descriptions,
            practice with AI mock interviews, and land your dream job faster.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">📄</div>
              <div>
                <strong>AI Resume Creator</strong>
                <p>ATS scoring, instant bullet generation, and customizable templates.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🎙️</div>
              <div>
                <strong>AI Interview Platform</strong>
                <p>Voice-enabled mock interviews with real-time feedback & code sandbox.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-bottom">
          <p>
            <strong>Your career journey starts here.</strong>
            <br />
            Powered by BurnettPeople identity and security.
          </p>
        </div>
      </section>

      <section
        className="form-panel"
        style={{
          backgroundImage: `url(${loginSoftMint})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mobile-brand">
          <img src={burnettLogo} alt="BurnettSuite logo" className="brand-image" />
        </div>

        <div className="login-card">
          <div className="welcome-tag">JOIN BURNETTSUITE</div>
          <h2>Create Candidate Account</h2>
          <p className="form-subtitle">
            Get instant access to AI Resume Creator &amp; Interview Platform.
          </p>

          <form onSubmit={handleRegister}>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="firstName">First Name</label>
                <div className="input-wrap">
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Aditya"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="lastName">Last Name</label>
                <div className="input-wrap">
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <label htmlFor="email" style={{ marginTop: "12px" }}>Email Address</label>
            <div className="input-wrap">
              <span className="input-icon">✉</span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <label htmlFor="password" style={{ marginTop: "12px" }}>Password</label>
            <div className="input-wrap password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label htmlFor="confirmPassword" style={{ marginTop: "12px" }}>Confirm Password</label>
            <div className="input-wrap password-wrap">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div role="alert" className="employee-form-error" style={{ marginTop: "14px" }}>
                {error}
              </div>
            )}

            <button
              className="sign-in-button"
              type="submit"
              disabled={busy}
              style={{ marginTop: "20px" }}
            >
              {busy ? "Creating account…" : "Create Candidate Account"} <span>→</span>
            </button>
          </form>

          <div className="forgot-row" style={{ marginTop: "18px", textAlign: "center" }}>
            <span>Already have an account? </span>
            <Link to="/" style={{ color: "#006666", fontWeight: "600", textDecoration: "none" }}>
              Sign in to BurnettSuite
            </Link>
          </div>
        </div>

        <footer className="form-footer">
          <span>© 2026 BurnettSuite</span>
          <div>
            <a href="#privacy">Privacy</a>
            <a href="#help">Help &amp; Support</a>
          </div>
        </footer>
      </section>
    </main>
  );
}
