import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const label = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "—";
const date = (value) => value ? new Date(value).toLocaleDateString() : "—";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("interviews/dashboard/").then((res) => setData(res.data)).catch((err) => {
      if (err.response?.status === 401) navigate("/");
    }).finally(() => setLoading(false));
  }, [navigate]);

  const stats = [
    { label: "Total Interviews", value: data?.total_interviews ?? 0, note: `${data?.completed_interviews ?? 0} completed`, icon: "🎤" },
    { label: "Average Score", value: `${Math.round(data?.average_score ?? 0)}%`, note: "Across evaluated answers", icon: "📈" },
    { label: "Best Score", value: `${Math.round(data?.best_score ?? 0)}%`, note: "Highest answer score", icon: "🏆" },
  ];

  return <div className="flex min-h-screen bg-slate-950"><Sidebar /><div className="flex min-w-0 flex-1 flex-col bg-slate-100"><Navbar />
    <main className="flex-1 overflow-x-hidden"><div className="mx-auto max-w-7xl px-5 py-6 sm:px-7 lg:px-8 lg:py-8">
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" /><div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">Interview Prep Dashboard</span><h1 className="mt-4 text-3xl font-black sm:text-4xl">Welcome back 👋</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Practice, review your previous sessions, and use your resume to get personalized questions.</p></div><button onClick={() => navigate("/interview-platform/setup")} className="rounded-2xl bg-blue-500 px-5 py-3.5 font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-400">Start New Interview →</button></div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">{stats.map((stat) => <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">{stat.label}</p><p className="mt-2 text-4xl font-black text-slate-900">{loading ? "—" : stat.value}</p><p className="mt-2 text-xs text-slate-400">{stat.note}</p></div><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">{stat.icon}</span></div></div>)}</section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-blue-600">Your activity</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Recent Interviews</h2></div><button onClick={() => navigate("/interview-platform/history")} className="text-sm font-semibold text-blue-600">View all →</button></div>
          <div className="mt-6 space-y-3">{loading ? <div className="py-12 text-center text-slate-500">Loading your activity...</div> : !data?.recent_interviews?.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><div className="text-4xl">🎤</div><h3 className="mt-4 font-bold text-slate-800">No interviews yet</h3><p className="mt-1 text-sm text-slate-500">Start your first practice session to build your history.</p><button onClick={() => navigate("/interview-platform/setup")} className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Start Interview</button></div> : data.recent_interviews.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"><div><p className="font-semibold capitalize text-slate-800">{label(item.interview_type)} Interview</p><p className="mt-1 text-xs text-slate-500">{label(item.difficulty)} · {item.duration} min · {date(item.created_at)}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.status === "completed" ? "bg-green-50 text-green-700" : item.status === "in_progress" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{label(item.status).replace("_", " ")}</span></div>)}</div>
        </div>
        <div className="space-y-6"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-violet-600">Quick actions</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Prepare in a few clicks</h2><div className="mt-5 space-y-3"><button onClick={() => navigate("/interview-platform/resume-upload")} className="w-full rounded-2xl border border-slate-200 p-4 text-left hover:border-blue-200 hover:bg-blue-50/50"><span className="font-semibold text-slate-800">📄 Review my resume</span><span className="mt-1 block text-xs text-slate-500">See extracted skills, projects and education.</span></button><button onClick={() => navigate("/interview-platform/performance")} className="w-full rounded-2xl border border-slate-200 p-4 text-left hover:border-violet-200 hover:bg-violet-50/50"><span className="font-semibold text-slate-800">📊 View performance</span><span className="mt-1 block text-xs text-slate-500">Track your scores across completed sessions.</span></button></div></div><div className="rounded-3xl bg-blue-600 p-6 text-white shadow-lg"><p className="text-sm font-semibold text-blue-100">Resume status</p><h3 className="mt-2 text-xl font-bold">{data?.resume_uploaded ? "Resume uploaded ✓" : "Upload your resume"}</h3><p className="mt-2 text-sm leading-6 text-blue-100">{data?.resume_uploaded ? "Your AI interviews can use your resume context." : "Upload a PDF or DOCX to personalize your interview questions."}</p>{!data?.resume_uploaded && <button onClick={() => navigate("/interview-platform/resume-upload")} className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700">Upload Resume</button>}</div></div>
      </section>
    </div></main></div></div>;
}
export default Dashboard;
