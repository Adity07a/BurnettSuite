import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import companyLogo from "../assets/company_logo.jpeg";

function Login() {
  const [selectedRole, setSelectedRole] = useState("candidate"); // 'candidate' | 'admin'
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your email/mobile and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("users/login/", {
        identifier: identifier.trim(),
        password,
      });

      const { access, refresh, user } = response.data;

      // Role check: Agar Admin choose kiya hai par account staff nahi hai
      if (selectedRole === "admin" && !user?.is_staff) {
        setError("Access Denied: You do not have administrator permissions.");
        setLoading(false);
        return;
      }

      // Role check: Agar Candidate choose kiya hai par account staff ka hai
      if (selectedRole === "candidate" && user?.is_staff) {
        setError("This is a staff account. Please switch to 'Admin Login'.");
        setLoading(false);
        return;
      }

      // Tokens aur user state browser storage mein save karein
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login successful!");

      // Role ke hisaab se redirection
      if (user?.is_staff) {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (requestError) {
      console.error("Login failed:", requestError);
      setError(
        requestError.response?.data?.detail ||
          "Invalid email/mobile or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative min-h-screen overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -right-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
          {/* Left side */}
          <section className="hidden lg:flex flex-col justify-between px-10 py-10 xl:px-16">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-3 text-white transition hover:opacity-90"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg">
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="h-full w-full object-contain"
                  />
                </div>

                <span>
                  <span className="block text-lg font-bold tracking-tight">
                    Interview Prep
                  </span>
                  <span className="block text-xs text-slate-400">
                    Practice. Improve. Get Ready.
                  </span>
                </span>
              </Link>

              <div className="mt-24 max-w-xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Your interview practice space
                </div>

                <h1 className="text-5xl font-black leading-tight tracking-tight xl:text-6xl">
                  Walk into your next interview with{" "}
                  <span className="text-blue-400">confidence.</span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                  Practice realistic interviews, answer naturally with your
                  voice, and understand how you can improve after every
                  session.
                </p>
              </div>

              <div className="mt-12 grid max-w-xl grid-cols-2 gap-4">
                {[
                  {
                    title: "Voice practice",
                    text: "Answer questions naturally",
                  },
                  {
                    title: "Personalized",
                    text: "Questions based on your profile",
                  },
                  {
                    title: "Detailed feedback",
                    text: "See strengths and weak areas",
                  },
                  {
                    title: "Progress tracking",
                    text: "Review your interview journey",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Prepare smarter. Speak better. Perform with confidence.
            </p>
          </section>

          {/* Right side */}
          <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
            <div className="w-full max-w-md">
              <div className="mb-7 flex items-center justify-between lg:hidden">
                <Link
                  to="/"
                  className="flex items-center gap-3 text-white"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
                    <img
                      src={companyLogo}
                      alt="Company Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="font-bold">Interview Prep</span>
                </Link>

                <Link
                  to="/"
                  className="text-sm font-medium text-slate-300 hover:text-white"
                >
                  Home
                </Link>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
                {/* Role Switcher Tabs */}
                <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-slate-900/80 p-1 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("candidate");
                      setError("");
                    }}
                    className={`rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                      selectedRole === "candidate"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("admin");
                      setError("");
                    }}
                    className={`rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                      selectedRole === "admin"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Admin / Staff
                  </button>
                </div>

                <div className="mb-8">
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    selectedRole === "admin"
                      ? "bg-purple-500/15 text-purple-300"
                      : "bg-blue-500/15 text-blue-300"
                  }`}>
                    <svg
                      width="27"
                      height="27"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Z" />
                      <path d="M19 11a7 7 0 0 1-14 0" />
                      <path d="M12 18v3" />
                      <path d="M8 21h8" />
                    </svg>
                  </div>

                  <p className={`text-sm font-medium ${selectedRole === "admin" ? "text-purple-300" : "text-blue-300"}`}>
                    {selectedRole === "admin" ? "Staff Control Portal" : "Welcome back"}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold tracking-tight">
                    {selectedRole === "admin" ? "Admin Sign In" : "Sign in to account"}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {selectedRole === "admin"
                      ? "Enter authorized credentials to review candidate evaluations."
                      : "Continue your interview preparation journey."}
                  </p>
                </div>

                {error && (
                  <div
                    className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label
                      htmlFor="identifier"
                      className="mb-2 block text-sm font-semibold text-slate-200"
                    >
                      Email or mobile number
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M20 21a8 8 0 0 0-16 0" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>

                      <input
                        id="identifier"
                        type="text"
                        autoComplete="username"
                        placeholder="Enter your email or mobile number"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-400/60 focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-200"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect x="4" y="10" width="16" height="10" rx="2" />
                          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        </svg>
                      </span>

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-400/60 focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-200"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <svg
                            width="19"
                            height="19"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="m3 3 18 18" />
                            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                            <path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c5.2 0 8.8 4 10 8a14 14 0 0 1-3 4.8" />
                            <path d="M6.1 6.1C3.8 7.7 2.6 10.1 2 12c1.2 4 4.8 8 10 8 1 0 2-.2 2.9-.4" />
                          </svg>
                        ) : (
                          <svg
                            width="19"
                            height="19"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`group flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      selectedRole === "admin"
                        ? "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20"
                        : "bg-blue-500 hover:bg-blue-400 shadow-blue-500/20"
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In as {selectedRole === "admin" ? "Admin" : "Candidate"}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="transition group-hover:translate-x-0.5"
                        >
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-7 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-slate-500">OR</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <p className="mt-6 text-center text-sm text-slate-400">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-300 transition hover:text-blue-200"
                  >
                    Create one
                  </Link>
                </p>

                <Link
                  to="/"
                  className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-200"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back to Home
                </Link>
              </div>

              <p className="mt-6 text-center text-xs leading-5 text-slate-600">
                Your account is protected with role-based JWT authentication.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Login;
