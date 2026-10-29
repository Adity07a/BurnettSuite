import { useNavigate } from "react-router-dom";
import companyLogo from "../assets/company_logo.jpeg";

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Voice-Based Interviews",
      description:
        "Practice realistic interviews by answering questions naturally with your voice.",
      icon: "🎤",
    },
    {
      title: "AI-Generated Questions",
      description:
        "Get personalized questions based on your interview type, difficulty, and profile.",
      icon: "🤖",
    },
    {
      title: "Personalized Feedback",
      description:
        "Understand your strengths, weak areas, and how to improve each answer.",
      icon: "📝",
    },
    {
      title: "Track Your Progress",
      description:
        "Review previous interview results and follow your improvement over time.",
      icon: "📈",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <header className="relative z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
              <img
                src={companyLogo}
                alt="Company Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Interview Prep
            </span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-slate-100 transition"
            >
              Open workspace
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute top-32 right-0 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-semibold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  PRACTICE FOR REAL INTERVIEWS
                </div>

                <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight">
                  Practice.
                  <span className="block text-slate-300">Improve.</span>
                  <span className="block">Get Ready.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8 text-slate-300">
                  Build confidence with realistic interview practice, voice
                  conversations, personalized feedback, and detailed results
                  that help you improve one answer at a time.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-9">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="px-7 py-4 rounded-2xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition"
                  >
                    Open Interview Workspace
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-xl mt-10">
                  <div>
                    <p className="text-2xl font-extrabold">24/7</p>
                    <p className="text-sm text-slate-400 mt-1">Practice anytime</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold">Voice</p>
                    <p className="text-sm text-slate-400 mt-1">Speak naturally</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold">AI</p>
                    <p className="text-sm text-slate-400 mt-1">Personalized practice</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-2xl" />
                <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/90 overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">
                          Live Practice Session
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Technical • Medium
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-300 text-xs font-semibold">
                        ● Listening
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center font-bold shrink-0">
                            AI
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">
                              Interviewer
                            </p>
                            <p className="mt-2 text-base sm:text-lg leading-7 text-slate-100">
                              Tell me about a technical challenge you faced in
                              one of your projects and how you solved it.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-950 border border-white/10 p-5">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5" aria-hidden="true">
                            <span className="w-2.5 h-8 rounded-full bg-blue-400/80" />
                            <span className="w-2.5 h-12 rounded-full bg-blue-300/90" />
                            <span className="w-2.5 h-16 rounded-full bg-blue-400/80" />
                            <span className="w-2.5 h-10 rounded-full bg-blue-300/80" />
                            <span className="w-2.5 h-7 rounded-full bg-blue-400/70" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Your answer
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Voice response in progress
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-xs text-slate-500">Question</p>
                          <p className="text-lg font-bold mt-1">01</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-xs text-slate-500">Time</p>
                          <p className="text-lg font-bold mt-1">08:42</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-xs text-slate-500">Status</p>
                          <p className="text-lg font-bold text-emerald-300 mt-1">Live</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 bg-slate-900/60">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Why Interview Prep
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
                Practice in a way that feels closer to a real interview.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-10">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.06] transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-white text-slate-950 flex items-center justify-center text-xl">
                    {feature.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 sm:p-12 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Start Today
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Your next interview can feel different.
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-slate-400 leading-7">
                Practice your answers, understand your weak points, and build
                confidence before the real interview.
              </p>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="mt-8 px-7 py-4 rounded-2xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition"
              >
                Open Interview Workspace
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-7 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Interview Prep
          </p>
          <p className="text-sm text-slate-500">
            Practice smarter. Interview with confidence.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
