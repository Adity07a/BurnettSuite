import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import ModelSelector from "../components/ModelSelector";

const types = [
  ["technical", "💻", "Technical", "Programming, frameworks, databases and technical concepts."],
  ["hr", "👥", "HR", "Behavioral, communication, teamwork and career questions."],
  ["project", "🚀", "Project", "Questions about projects, decisions, challenges and implementation."],
];
const levels = [
  ["easy", "🟢", "Easy", "Fundamentals and basic understanding"],
  ["medium", "🟡", "Medium", "Practical reasoning and implementation"],
  ["hard", "🔴", "Hard", "Deeper technical and decision-making questions"],
];

function InterviewSetup() {
  const navigate = useNavigate();
  const [type, setType] = useState("technical");
  const [difficulty, setDifficulty] = useState("medium");
  const [duration, setDuration] = useState(30);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [models, setModels] = useState([]);
  const [modelId, setModelId] = useState("");
  const [questionSource, setQuestionSource] = useState("local");
  const [progress, setProgress] = useState(null);
  const [progressError, setProgressError] = useState("");

  useEffect(() => {
    let active = true;
    setProgress(null);
    setProgressError("");
    api
      .get("interviews/question-bank/progress/", {
        params: { interview_type: type, difficulty },
      })
      .then(({ data }) => {
        if (active) setProgress(data);
      })
      .catch(() => {
        if (active)
          setProgressError(
            "Practice progress unavailable. Please refresh to retry."
          );
      });
    return () => {
      active = false;
    };
  }, [type, difficulty]);

  useEffect(() => {
    let active = true;
    api
      .get("ai/models/")
      .then(({ data }) => {
        if (active) {
          setModels(data.models);
          setModelId(data.interview_default);
        }
      })
      .catch(() => {
        if (active) setError("Unable to load models. Refresh to retry.");
      });
    return () => {
      active = false;
    };
  }, []);

  const start = async () => {
    try {
      setLoading(true);
      setError("");
      const r = await api.post("interviews/create/", {
        interview_type: type,
        difficulty,
        duration,
        model_id: modelId,
        question_source: questionSource,
        job_description: jobDescription.trim(),
      });
      localStorage.setItem("current_interview_id", r.data.id);
      navigate(`/interview/${r.data.id}`);
    } catch (e) {
      if (e.response?.status === 401) navigate("/");
      else
        setError(
          e.response?.data?.detail ||
            "Unable to create the interview. Please try again."
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-7 lg:px-8">
        <button
          onClick={() => navigate("/interview-platform")}
          className="mb-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-7">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Interview Setup
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Configure your practice session
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choose what you want to practice. The AI will use your resume and target job description when available.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* 1. Interview Type */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">1. Interview Type</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {types.map(([v, icon, title, desc]) => (
                <button
                  key={v}
                  onClick={() => setType(v)}
                  className={`rounded-2xl border-2 p-5 text-left transition ${
                    type === v
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="text-3xl">{icon}</div>
                  <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Difficulty */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">2. Difficulty</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {levels.map(([v, icon, title, desc]) => (
                <button
                  key={v}
                  onClick={() => setDifficulty(v)}
                  className={`rounded-2xl border-2 p-5 text-left transition ${
                    difficulty === v
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="text-xl">{icon}</div>
                  <h3 className="mt-2 font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Duration */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">3. Duration</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[10, 20, 30, 45, 60].map((t) => (
                <button
                  key={t}
                  onClick={() => setDuration(t)}
                  className={`rounded-2xl border-2 py-4 font-bold transition ${
                    duration === t
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-700 hover:border-blue-300"
                  }`}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>

          {/* 4. Job Description (Optional) */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                4. Target Job Description (JD)
              </h2>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Optional
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Paste the role requirements, required tech stack, or job posting. AI will tailor questions to match this profile.
            </p>
            <div className="mt-3">
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="e.g., We are looking for a Python Backend Developer with experience in Django, REST APIs, PostgreSQL, AWS, and problem-solving skills..."
                className="w-full rounded-2xl border-2 border-slate-200 p-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600"
              />
            </div>
          </div>

          {/* 5. Question Source */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">5. Question source</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                [
                  "local",
                  "Local practice bank",
                  "Resume-matched questions. Questions scored above 80% correctness leave your practice list; weaker answers return for revision.",
                ],
                [
                  "ai",
                  "AI generated",
                  "New questions tailored to your resume, job description, and previous answers. Uses AI for question generation.",
                ],
              ].map(([value, title, description]) => (
                <button
                  key={value}
                  onClick={() => setQuestionSource(value)}
                  className={`rounded-2xl border-2 p-5 text-left ${
                    questionSource === value
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200"
                  }`}
                >
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                </button>
              ))}
            </div>
            {questionSource === "local" && (
              <p className="mt-3 text-sm text-slate-600">
                {progress
                  ? `${progress.remaining} remaining: ${progress.unseen} new, ${progress.revision} to revise. ${progress.mastered} mastered for this type and difficulty.`
                  : progressError || "Loading practice progress..."}
              </p>
            )}
            <p className="mt-2 text-sm text-slate-500">
              Answer evaluation uses your selected AI model in both modes.
            </p>
          </div>

          {/* Model Selector */}
          <div className="mb-8">
            <ModelSelector
              models={models}
              value={modelId}
              onChange={setModelId}
              disabled={loading}
            />
            <p className="mt-2 text-sm text-slate-500">
              This model evaluates your answers and generates questions when AI generated mode is selected.
            </p>
          </div>

          {/* Configuration Summary */}
          <div className="mb-6 rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selected configuration
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500">Type</p>
                <p className="mt-1 font-bold capitalize">{type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Difficulty</p>
                <p className="mt-1 font-bold capitalize">{difficulty}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Duration</p>
                <p className="mt-1 font-bold">{duration} min</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Target JD</p>
                <p className="mt-1 font-bold text-emerald-400">
                  {jobDescription.trim() ? "Provided ✓" : "None (Resume only)"}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={start}
            disabled={
              loading ||
              !modelId ||
              (questionSource === "local" &&
                (!progress || progress.remaining === 0))
            }
            className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Creating Interview..." : "Start Interview →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewSetup;
