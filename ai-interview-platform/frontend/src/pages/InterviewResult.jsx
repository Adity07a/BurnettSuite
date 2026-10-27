import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function InterviewResult() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `evaluations/interview/${id}/`
        );

        console.log("Interview result:", response.data);

        setResult(response.data);
      } catch (requestError) {
        console.error(
          "Failed to load interview result:",
          requestError
        );

        if (requestError.response?.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        setError(
          requestError.response?.data?.error ||
            "Unable to load interview results."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadResult();
    }
  }, [id, navigate]);

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString();
  };

  const getScoreClass = (score) => {
    const safeScore = Number(score) || 0;

    if (safeScore >= 70) {
      return "text-green-600";
    }

    if (safeScore >= 40) {
      return "text-yellow-600";
    }

    return "text-red-600";
  };

  const getScoreBarClass = (score) => {
    const safeScore = Number(score) || 0;

    if (safeScore >= 70) {
      return "bg-green-500";
    }

    if (safeScore >= 40) {
      return "bg-yellow-500";
    }

    return "bg-red-500";
  };

  const averageCategoryScore = useMemo(() => {
    if (!result?.summary) {
      return 0;
    }

    const values = [
      Number(result.summary.technical_score) || 0,
      Number(result.summary.communication_score) || 0,
      Number(result.summary.relevance_score) || 0,
      Number(result.summary.correctness_score) || 0,
    ];

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, [result]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <h2 className="text-xl font-semibold text-slate-800">
            Loading your results...
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Fetching your interview evaluation.
          </p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>

          <h2 className="text-xl font-bold text-slate-800">
            Unable to load results
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            {error || "No interview result was found."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { interview, summary, questions } = result;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ==========================================
          HEADER
      ========================================== */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">
                Interview Completed
              </h1>

              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                Session #{interview.id}
              </span>

              <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                {interview.status === "completed"
                  ? "Completed"
                  : "In Progress"}
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Here is the AI-generated evaluation of your interview.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* ==========================================
          MAIN
      ========================================== */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {summary.local_questions > 0 && <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950">
          <h2 className="font-bold">Your practice progress</h2>
          <p className="mt-2 text-sm">{summary.mastered_questions} mastered, {summary.revision_questions} to revise in a future session. Mastery requires more than 80% correctness.</p>
          <p className="mt-2 text-sm">{summary.question_generation_calls_avoided} questions came from the local bank without an AI generation request. Answer evaluation still uses AI.</p>
        </section>}
        {/* Completion banner */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-8 items-center">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-3xl mb-5">
                ✓
              </div>

              <h2 className="text-3xl font-bold text-slate-800">
                Great job completing your interview!
              </h2>

              <p className="text-slate-500 mt-3 leading-7 max-w-2xl">
                Your answers were evaluated question by question using the
                interview context and candidate responses. Review the scores
                below to understand where you performed well and where you can
                improve.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <span className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
                  {interview.interview_type} interview
                </span>

                <span className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
                  {interview.difficulty} difficulty
                </span>

                <span className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
                  {interview.duration} minutes
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-7 text-center">
              <p className="text-sm font-medium text-slate-500">
                Overall Score
              </p>

              <p
                className={`text-6xl font-extrabold mt-2 ${getScoreClass(
                  summary.overall_score
                )}`}
              >
                {Math.round(Number(summary.overall_score) || 0)}
              </p>

              <p className="text-sm text-slate-500 mt-2">
                out of 100
              </p>

              <div className="mt-5 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getScoreBarClass(
                    summary.overall_score
                  )}`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        Number(summary.overall_score) || 0
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500">Questions</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {summary.total_questions}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500">Answered</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {summary.answered_questions}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500">Evaluated</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {summary.evaluated_questions}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500">Category Average</p>
            <p
              className={`text-3xl font-bold mt-2 ${getScoreClass(
                averageCategoryScore
              )}`}
            >
              {Math.round(averageCategoryScore)}
            </p>
          </div>
        </section>

        {/* Category scores */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-7 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-7">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Performance Breakdown
              </p>

              <h2 className="text-2xl font-bold text-slate-800 mt-1">
                Evaluation Scores
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              Scores are based on answered and evaluated questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                label: "Technical",
                value: summary.technical_score,
              },
              {
                label: "Communication",
                value: summary.communication_score,
              },
              {
                label: "Relevance",
                value: summary.relevance_score,
              },
              {
                label: "Correctness",
                value: summary.correctness_score,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <p className="font-semibold text-slate-700">
                    {item.label}
                  </p>

                  <p
                    className={`font-bold ${getScoreClass(
                      item.value
                    )}`}
                  >
                    {Math.round(Number(item.value) || 0)}/100
                  </p>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getScoreBarClass(
                      item.value
                    )}`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(item.value) || 0)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interview details */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-7 mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            Interview Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Interview Type
              </p>
              <p className="font-semibold text-slate-700 mt-1 capitalize">
                {interview.interview_type}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Difficulty
              </p>
              <p className="font-semibold text-slate-700 mt-1 capitalize">
                {interview.difficulty}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Started
              </p>
              <p className="font-semibold text-slate-700 mt-1">
                {formatDate(interview.started_at)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Completed
              </p>
              <p className="font-semibold text-slate-700 mt-1">
                {formatDate(interview.completed_at)}
              </p>
            </div>
          </div>
        </section>

        {/* Question-by-question evaluation */}
        <section className="mb-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-blue-600">
              Detailed Review
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mt-1">
              Questions & AI Feedback
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Review each question, your recorded answer, and the AI feedback.
            </p>
          </div>

          <div className="space-y-6">
            {questions.map((item) => {
              const evaluation = item.evaluation;

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
                >
                  {/* Question header */}
                  <div className="px-7 py-5 border-b border-slate-200 bg-slate-50">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-blue-600">
                          Question {item.question_number}
                        </p>
                        {item.practice_status && <p className="mt-1 text-sm font-medium text-blue-700">{item.practice_status === "mastered" ? "Mastered — removed from your practice list" : "Revision — stays in your practice list"}</p>}
                        {item.skipped_at && <p className="mt-1 text-sm text-slate-500">Skipped — not evaluated{item.source === "local" ? "; available for future practice" : ""}</p>}

                        <h3 className="text-lg font-bold text-slate-800 mt-2 leading-7">
                          {item.question}
                        </h3>
                      </div>

                      {evaluation ? (
                        <div className="sm:min-w-[120px] rounded-xl bg-white border border-slate-200 p-4 text-center">
                          <p className="text-xs text-slate-500">
                            Overall
                          </p>

                          <p
                            className={`text-2xl font-bold mt-1 ${getScoreClass(
                              evaluation.overall_score
                            )}`}
                          >
                            {Math.round(
                              Number(evaluation.overall_score) || 0
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex h-fit items-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 border border-slate-200">
                          Not evaluated
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-7">
                    {/* Answer */}
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-3">
                        Your Answer
                      </p>

                      {item.answer ? (
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                          <p className="text-slate-700 leading-7 whitespace-pre-wrap">
                            {item.answer}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                          <p className="text-slate-400 italic">
                            No answer was recorded for this question.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Evaluation */}
                    {evaluation && (
                      <div className="mt-7 space-y-6">
                        {/* Score breakdown */}
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-4">
                            Score Breakdown
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              {
                                label: "Technical",
                                value: evaluation.technical_score,
                              },
                              {
                                label: "Communication",
                                value:
                                  evaluation.communication_score,
                              },
                              {
                                label: "Relevance",
                                value: evaluation.relevance_score,
                              },
                              {
                                label: "Correctness",
                                value: evaluation.correctness_score,
                              },
                            ].map((score) => (
                              <div
                                key={score.label}
                                className="rounded-xl border border-slate-200 p-4"
                              >
                                <p className="text-xs text-slate-500">
                                  {score.label}
                                </p>

                                <p
                                  className={`text-xl font-bold mt-1 ${getScoreClass(
                                    score.value
                                  )}`}
                                >
                                  {Math.round(
                                    Number(score.value) || 0
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Strengths and weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="rounded-xl bg-green-50 border border-green-200 p-5">
                            <h4 className="font-semibold text-green-800">
                              Strengths
                            </h4>

                            {evaluation.strengths?.length ? (
                              <ul className="mt-3 space-y-2">
                                {evaluation.strengths.map(
                                  (strength, index) => (
                                    <li
                                      key={`${item.id}-strength-${index}`}
                                      className="text-sm text-green-900 leading-6"
                                    >
                                      • {strength}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-sm text-green-800 mt-3">
                                No strengths were provided.
                              </p>
                            )}
                          </div>

                          <div className="rounded-xl bg-red-50 border border-red-200 p-5">
                            <h4 className="font-semibold text-red-800">
                              Areas to Improve
                            </h4>

                            {evaluation.weaknesses?.length ? (
                              <ul className="mt-3 space-y-2">
                                {evaluation.weaknesses.map(
                                  (weakness, index) => (
                                    <li
                                      key={`${item.id}-weakness-${index}`}
                                      className="text-sm text-red-900 leading-6"
                                    >
                                      • {weakness}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-sm text-red-800 mt-3">
                                No improvement points were provided.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Feedback */}
                        <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
                          <h4 className="font-semibold text-blue-800">
                            AI Feedback
                          </h4>

                          <p className="text-sm text-blue-950 leading-7 mt-3 whitespace-pre-wrap">
                            {evaluation.feedback ||
                              "No feedback was provided."}
                          </p>
                        </div>

                        {/* Improved answer */}
                        <div className="rounded-xl bg-purple-50 border border-purple-200 p-5">
                          <h4 className="font-semibold text-purple-800">
                            Suggested Improved Answer
                          </h4>

                          <p className="text-sm text-purple-950 leading-7 mt-3 whitespace-pre-wrap">
                            {evaluation.improved_answer ||
                              "No improved answer was generated."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Bottom actions */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Ready for another interview?
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Start a new practice session or return to your dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Back to Dashboard
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/interview-setup")
                }
                className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Start New Interview
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default InterviewResult;
