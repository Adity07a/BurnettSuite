import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";


const EMPTY_FORM = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
};


function Register() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await api.post("users/register/", {
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
        confirm_password: form.confirmPassword,
      });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (requestError) {
      const data = requestError.response?.data;
      setError(
        data?.mobile?.[0] ||
          data?.email?.[0] ||
          data?.confirm_password?.[0] ||
          data?.password?.[0] ||
          data?.full_name?.[0] ||
          "Registration failed. Please check your details.",
      );
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    ["Full name", "fullName", "text", true],
    ["Email", "email", "email", true],
    ["Mobile number (optional)", "mobile", "tel", false],
    ["Password", "password", "password", true],
    ["Confirm password", "confirmPassword", "password", true],
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-5 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-2">
        <section className="hidden lg:block">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-300">
            AI Interview Platform
          </span>
          <h1 className="mt-5 text-5xl font-black leading-tight">
            Build interview confidence with realistic AI practice.
          </h1>
          <p className="mt-5 max-w-xl leading-7 text-slate-400">
            Upload your resume, practice technical or HR questions, answer by
            voice, and review AI-generated feedback.
          </p>
        </section>

        <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
          <Link to="/" className="text-sm font-semibold text-blue-300">
            ← Home
          </Link>
          <h2 className="mt-5 text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in later with your email or mobile number.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-7 space-y-4">
            {fields.map(([label, field, type, required]) => (
              <label key={field} className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  {label}
                </span>
                <input
                  type={type}
                  value={form[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  required={required}
                  autoComplete={
                    field === "confirmPassword" ? "new-password" : field
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3.5 text-white outline-none focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>
            ))}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold hover:bg-blue-500 disabled:bg-blue-400"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-300">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Register;
