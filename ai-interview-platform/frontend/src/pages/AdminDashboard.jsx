import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [currentNav, setCurrentNav] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("highest");
  const [loading, setLoading] = useState(true);

  // Question Bank
  const [questions, setQuestions] = useState([]);
  const [qSearch, setQSearch] = useState("");
  const [qTypeFilter, setQTypeFilter] = useState("all");
  const [qDiffFilter, setQDiffFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const initialForm = {
    title: "",
    description: "",
    question_type: "conceptual",
    topic: "Python",
    difficulty: "medium",
    starter_code: "",
    solution_code: "",
  };
  const [qForm, setQForm] = useState(initialForm);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidatesOverview();
    fetchQuestionBank();
  }, []);

  const fetchCandidatesOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get("evaluations/admin/candidates-overview/");
      setCandidates(res.data || []);
    } catch (err) {
      console.error("Candidates fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionBank = async () => {
    try {
      const res = await api.get("interviews/question-bank/");
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Question Bank fetch error:", err);
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await api.put(`interviews/question-bank/${editingQuestion.id}/`, qForm);
      } else {
        await api.post("interviews/question-bank/", qForm);
      }
      setIsModalOpen(false);
      setEditingQuestion(null);
      setQForm(initialForm);
      fetchQuestionBank();
    } catch (err) {
      alert("Error saving question: " + (err.response?.data?.detail || "Check input fields"));
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`interviews/question-bank/${id}/`);
      fetchQuestionBank();
    } catch (err) {
      alert("Error deleting question.");
    }
  };

  const handleToggleUserActive = async (userId, currentStatus) => {
    const actionText = currentStatus ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;

    try {
      const res = await api.patch(`users/admin/toggle-active/${userId}/`);
      alert(res.data?.message || `User ${actionText}d successfully`);
      fetchCandidatesOverview();
    } catch (err) {
      alert("Error updating user status: " + (err.response?.data?.error || "Permission denied"));
    }
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setQForm({
      title: q.title,
      description: q.description,
      question_type: q.question_type,
      topic: q.topic,
      difficulty: q.difficulty,
      starter_code: q.starter_code || "",
      solution_code: q.solution_code || "",
    });
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const calculateCandidateOverall = (c) => {
    if (!c?.interviews?.length) return 0;
    let total = 0, count = 0;
    c.interviews.forEach((inv) => {
      inv.questions?.forEach((q) => {
        if (q.evaluation?.overall_score !== undefined) {
          total += Number(q.evaluation.overall_score);
          count++;
        }
      });
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  const calculateMetricAvg = (c, metricKey) => {
    if (!c?.interviews?.length) return 0;
    let total = 0, count = 0;
    c.interviews.forEach((inv) => {
      inv.questions?.forEach((q) => {
        if (q.evaluation && q.evaluation[metricKey] !== undefined) {
          total += Number(q.evaluation[metricKey]);
          count++;
        }
      });
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  const getScoreTheme = (score) => {
    if (score >= 70) return { text: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
    if (score >= 45) return { text: "text-amber-400", badge: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
    return { text: "text-rose-400", badge: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const openCandidateProfile = (cand) => {
    setSelectedCandidate(cand);
    setSelectedInterview(cand.interviews?.length ? cand.interviews[0] : null);
    setCurrentNav("candidate_detail");
  };

  const totalInterviewsCount = candidates.reduce((acc, c) => acc + (c.interviews?.length || 0), 0);

  const platformAvgScore = useMemo(() => {
    const scores = candidates.map((c) => calculateCandidateOverall(c)).filter((s) => s > 0);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [candidates]);

  const metricAverages = useMemo(() => {
    let tech = 0, comm = 0, count = 0;
    candidates.forEach((c) => {
      const t = calculateMetricAvg(c, "technical_score");
      const cm = calculateMetricAvg(c, "communication_score");
      if (t > 0 || cm > 0) {
        tech += t;
        comm += cm;
        count++;
      }
    });
    return {
      tech: count ? Math.round(tech / count) : 0,
      comm: count ? Math.round(comm / count) : 0,
    };
  }, [candidates]);

  const tierCounts = useMemo(() => {
    let high = 0, avg = 0, low = 0;
    candidates.forEach((c) => {
      const s = calculateCandidateOverall(c);
      if (s >= 70) high++;
      else if (s >= 40) avg++;
      else low++;
    });
    const total = candidates.length || 1;
    return {
      highPct: Math.round((high / total) * 100),
      avgPct: Math.round((avg / total) * 100),
      lowPct: Math.round((low / total) * 100),
    };
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        const q = searchTerm.toLowerCase();
        return (
          c.full_name?.toLowerCase().includes(q) ||
          c.username?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "highest") return calculateCandidateOverall(b) - calculateCandidateOverall(a);
        if (sortBy === "lowest") return calculateCandidateOverall(a) - calculateCandidateOverall(b);
        if (sortBy === "sessions") return (b.interviews?.length || 0) - (a.interviews?.length || 0);
        return 0;
      });
  }, [candidates, searchTerm, sortBy]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch = q.title?.toLowerCase().includes(qSearch.toLowerCase()) || q.topic?.toLowerCase().includes(qSearch.toLowerCase());
      const matchType = qTypeFilter === "all" || q.question_type === qTypeFilter;
      const matchDiff = qDiffFilter === "all" || q.difficulty === qDiffFilter;
      return matchSearch && matchType && matchDiff;
    });
  }, [questions, qSearch, qTypeFilter, qDiffFilter]);

  const weeklyTrends = [
    { day: "Mon", count: 4, height: 45 },
    { day: "Tue", count: 7, height: 75 },
    { day: "Wed", count: 5, height: 55 },
    { day: "Thu", count: 9, height: 95 },
    { day: "Fri", count: 6, height: 65 },
    { day: "Sat", count: 3, height: 35 },
    { day: "Sun", count: 2, height: 25 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-300">
        <p className="text-sm font-mono">Loading Dashboard & Content Suite...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      <header className="h-16 border-b border-slate-800/60 bg-[#090d16]/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
            ◈
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">AI Interview Platform</h1>
            <p className="text-[10px] text-slate-400">Recruitment & Content Control</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            Admin Console
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <aside className="w-60 border-r border-slate-800/60 bg-[#080c15] p-4 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "questions", label: "Question Bank", icon: "📚" },
              { id: "candidates", label: "Candidate Profiles", icon: "👥" },
              { id: "interviews", label: "Interview Sessions", icon: "🎙" },
              { id: "reports", label: "Evaluation Reports", icon: "📑" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentNav(tab.id);
                  if (tab.id === "candidates") setSelectedCandidate(null);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  currentNav === tab.id || (tab.id === "candidates" && currentNav === "candidate_detail")
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#07090e]">
          {/* VIEW 1: DASHBOARD */}
          {currentNav === "dashboard" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#0c101b] border border-slate-800/80 p-5 rounded-2xl shadow-lg">
                  <span className="text-[11px] font-medium text-slate-400 block">Total Registered Candidates</span>
                  <div className="text-3xl font-black mt-2 text-indigo-400">{candidates.length}</div>
                </div>
                <div className="bg-[#0c101b] border border-slate-800/80 p-5 rounded-2xl shadow-lg">
                  <span className="text-[11px] font-medium text-slate-400 block">Total Mock Interviews</span>
                  <div className="text-3xl font-black mt-2 text-violet-400">{totalInterviewsCount}</div>
                </div>
                <div className="bg-[#0c101b] border border-slate-800/80 p-5 rounded-2xl shadow-lg">
                  <span className="text-[11px] font-medium text-slate-400 block">Platform Average Score</span>
                  <div className="text-3xl font-black mt-2 text-emerald-400">{platformAvgScore}%</div>
                </div>
                <div className="bg-[#0c101b] border border-slate-800/80 p-5 rounded-2xl shadow-lg">
                  <span className="text-[11px] font-medium text-slate-400 block">Questions in Library</span>
                  <div className="text-3xl font-black mt-2 text-cyan-400">{questions.length}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-[#0c101b] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
                      <h3 className="text-sm font-bold text-white">Performance Tier Distribution</h3>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {candidates.length} Profiles
                      </span>
                    </div>

                    <div className="flex items-center justify-center my-3 relative">
                      <svg width="180" height="180" viewBox="0 0 42 42" className="transform -rotate-90">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#141a29" strokeWidth="5.5" />
                        <circle
                          cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="5.5"
                          strokeDasharray={`${tierCounts.highPct} ${100 - tierCounts.highPct}`}
                          strokeDashoffset="0" strokeLinecap="round"
                        />
                        <circle
                          cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="5.5"
                          strokeDasharray={`${tierCounts.avgPct} ${100 - tierCounts.avgPct}`}
                          strokeDashoffset={`-${tierCounts.highPct}`} strokeLinecap="round"
                        />
                        <circle
                          cx="21" cy="21" r="15.915" fill="transparent" stroke="#f43f5e" strokeWidth="5.5"
                          strokeDasharray={`${tierCounts.lowPct} ${100 - tierCounts.lowPct}`}
                          strokeDashoffset={`-${tierCounts.highPct + tierCounts.avgPct}`} strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-white">{platformAvgScore}%</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">AVG SCORE</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/60 text-center">
                    <div className="bg-[#101625] p-2 rounded-xl">
                      <span className="text-[11px] text-emerald-400 font-bold block">{tierCounts.highPct}%</span>
                      <span className="text-[9px] text-slate-400">High (&ge;70%)</span>
                    </div>
                    <div className="bg-[#101625] p-2 rounded-xl">
                      <span className="text-[11px] text-amber-400 font-bold block">{tierCounts.avgPct}%</span>
                      <span className="text-[9px] text-slate-400">Mid (40-69%)</span>
                    </div>
                    <div className="bg-[#101625] p-2 rounded-xl">
                      <span className="text-[11px] text-rose-400 font-bold block">{tierCounts.lowPct}%</span>
                      <span className="text-[9px] text-slate-400">Low (&lt;40%)</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#0c101b] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Interview Velocity Trends</h3>
                        <p className="text-xs text-slate-400">Sessions conducted across current week.</p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold">Active</span>
                    </div>

                    <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                      {weeklyTrends.map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <span className="text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition">
                            {bar.count}
                          </span>
                          <div
                            className="w-full max-w-[34px] rounded-t-xl bg-gradient-to-t from-indigo-700/60 via-violet-600 to-cyan-400 transition-all duration-300"
                            style={{ height: `${bar.height}%` }}
                          />
                          <span className="text-[10px] font-bold text-slate-400">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Highest activity: <strong className="text-white">Thursday</strong></span>
                    <span className="text-indigo-400 cursor-pointer" onClick={() => setCurrentNav("interviews")}>
                      View Sessions →
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-[#0c101b] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6">
                  <div className="border-b border-slate-800/60 pb-3">
                    <h3 className="text-sm font-bold text-white">Competency Breakdown Matrix</h3>
                    <p className="text-xs text-slate-400">Pillar breakdown across candidates.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Technical Depth</span>
                        <span className="text-indigo-400 font-bold">{metricAverages.tech}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${metricAverages.tech}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Articulate Communication</span>
                        <span className="text-purple-400 font-bold">{metricAverages.comm}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${metricAverages.comm}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#0c101b] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">Top Evaluated Candidates</h3>
                    <div className="space-y-2.5">
                      {candidates.slice(0, 3).map((c) => {
                        const sc = calculateCandidateOverall(c);
                        const theme = getScoreTheme(sc);
                        return (
                          <div
                            key={c.id}
                            onClick={() => openCandidateProfile(c)}
                            className="p-3 bg-[#101524] hover:bg-[#151c30] border border-slate-800/80 rounded-2xl flex items-center justify-between cursor-pointer transition"
                          >
                            <span className="font-bold text-xs text-white">{c.full_name}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${theme.badge}`}>{sc}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentNav("candidates")}
                    className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                  >
                    Open Candidates Directory
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: QUESTION BANK */}
          {currentNav === "questions" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Question Bank Manager</h2>
                  <p className="text-xs text-slate-400">Predefined spoken and coding challenges.</p>
                </div>
                <button
                  onClick={() => { setEditingQuestion(null); setQForm(initialForm); setIsModalOpen(true); }}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  + Add Question
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredQuestions.map((q) => (
                  <div key={q.id} className="bg-[#0c101b] border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-2">
                        <span className="text-cyan-400">{q.question_type === "coding" ? "⚡ Coding" : "🎙 Spoken"}</span>
                        <span className="text-amber-400 capitalize">{q.difficulty}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{q.title}</h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3">{q.description}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex justify-between text-xs mt-3">
                      <button onClick={() => openEditModal(q)} className="text-indigo-400 font-semibold">Edit</button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="text-rose-400 font-semibold">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: CANDIDATES DIRECTORY */}
          {currentNav === "candidates" && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Candidate Profiles</h2>
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#0c101b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none w-64"
                />
              </div>

              <div className="bg-[#0c101b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#101524] text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Sessions</th>
                      <th className="py-3.5 px-4">Avg Score</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCandidates.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-[#12182b]/60 transition cursor-pointer"
                        onClick={() => openCandidateProfile(c)}
                      >
                        <td className="py-3.5 px-4 font-bold text-white">{c.full_name}</td>
                        <td className="py-3.5 px-4 text-slate-400">{c.email || `@${c.username}`}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.is_active !== false ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          }`}>
                            {c.is_active !== false ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{c.interviews?.length || 0}</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-bold">{calculateCandidateOverall(c)}%</td>
                        <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openCandidateProfile(c); }}
                            className="px-2.5 py-1 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg transition text-[11px] font-semibold"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleUserActive(c.id, c.is_active !== false); }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              c.is_active !== false
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            }`}
                          >
                            {c.is_active !== false ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 4: CANDIDATE DETAIL DEEP DIVE */}
          {currentNav === "candidate_detail" && selectedCandidate && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentNav("candidates")}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  ← Back to Directory
                </button>
                <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
                  Print PDF Report
                </button>
              </div>

              <div className="bg-[#0c101b] border border-slate-800 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300 text-xl">
                    {getInitials(selectedCandidate.full_name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedCandidate.full_name}</h3>
                    <p className="text-xs text-slate-400">{selectedCandidate.email || `@${selectedCandidate.username}`}</p>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-black text-emerald-400">{calculateCandidateOverall(selectedCandidate)}%</span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mt-1">Aggregated Average</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Technical Depth:</span>
                    <span className="text-indigo-400 font-bold">{calculateMetricAvg(selectedCandidate, "technical_score")}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Communication:</span>
                    <span className="text-purple-400 font-bold">{calculateMetricAvg(selectedCandidate, "communication_score")}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {selectedCandidate.interviews?.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedInterview(session)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      selectedInterview?.id === session.id ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#0c101b] text-slate-300 border-slate-800"
                    }`}
                  >
                    {session.interview_type} ({session.difficulty})
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {selectedInterview?.questions?.map((q, idx) => (
                  <div key={q.id} className="bg-[#0c101b] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex justify-between border-b border-slate-800/60 pb-2">
                      <h4 className="text-xs font-bold text-white">Q{idx + 1}. {q.question}</h4>
                      <span className="text-xs font-black text-emerald-400">{((q.evaluation?.overall_score || 0) / 10).toFixed(1)}/10</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-[#07090e] p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Spoken Transcript:</span>
                        <p className="text-slate-300">{q.answer || "No response submitted."}</p>
                      </div>
                      <div className="bg-[#07090e] p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold text-indigo-400 block mb-1">AI Feedback:</span>
                        <p className="text-slate-300">{q.evaluation?.feedback || "Pending evaluation."}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 5: ALL INTERVIEWS */}
          {currentNav === "interviews" && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <h2 className="text-xl font-bold text-white">All Platform Interviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {candidates.flatMap((c) =>
                  (c.interviews || []).map((inv) => (
                    <div key={inv.id} className="bg-[#0c101b] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{inv.interview_type}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">{inv.difficulty}</span>
                      </div>
                      <p className="text-xs text-slate-400">Candidate: <strong className="text-slate-200">{c.full_name}</strong></p>
                      <button
                        onClick={() => { setSelectedCandidate(c); setSelectedInterview(inv); setCurrentNav("candidate_detail"); }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 transition"
                      >
                        Inspect Transcript →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW 6: REPORTS */}
          {currentNav === "reports" && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Assessment Reports</h2>
                <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-xs font-bold rounded-xl">
                  Print Summary
                </button>
              </div>
              <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl">
                <h3 className="font-bold text-base mb-1">Executive Candidate Ledger</h3>
                <p className="text-xs text-slate-600 mb-4">Date: {new Date().toLocaleDateString()}</p>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b font-bold text-slate-700">
                      <th className="py-2">Candidate</th>
                      <th className="py-2">Interviews</th>
                      <th className="py-2 text-right">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c) => (
                      <tr key={c.id} className="border-b">
                        <td className="py-2.5 font-semibold">{c.full_name}</td>
                        <td className="py-2.5">{c.interviews?.length || 0}</td>
                        <td className="py-2.5 text-right font-bold text-indigo-700">{calculateCandidateOverall(c)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODAL: ADD / EDIT QUESTION */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0e1424] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">{editingQuestion ? "Edit Question" : "Add New Question"}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Title</label>
                    <input
                      type="text" required value={qForm.title} onChange={(e) => setQForm({ ...qForm, title: e.target.value })}
                      className="w-full bg-[#080c16] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={qForm.question_type} onChange={(e) => setQForm({ ...qForm, question_type: e.target.value })}
                      className="bg-[#080c16] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="conceptual">Conceptual / Spoken</option>
                      <option value="coding">Coding Challenge</option>
                    </select>
                    <input
                      type="text" value={qForm.topic} onChange={(e) => setQForm({ ...qForm, topic: e.target.value })}
                      placeholder="Topic (Python, etc.)" className="bg-[#080c16] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    />
                    <select
                      value={qForm.difficulty} onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}
                      className="bg-[#080c16] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <textarea
                    rows={4} required value={qForm.description} onChange={(e) => setQForm({ ...qForm, description: e.target.value })}
                    placeholder="Full problem statement..." className="w-full bg-[#080c16] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                  {qForm.question_type === "coding" && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <textarea
                        rows={3} value={qForm.starter_code} onChange={(e) => setQForm({ ...qForm, starter_code: e.target.value })}
                        placeholder="Starter code..." className="w-full font-mono bg-[#05070d] border border-slate-800 rounded-xl p-3 text-cyan-300 outline-none"
                      />
                      <textarea
                        rows={3} value={qForm.solution_code} onChange={(e) => setQForm({ ...qForm, solution_code: e.target.value })}
                        placeholder="Solution code..." className="w-full font-mono bg-[#05070d] border border-slate-800 rounded-xl p-3 text-emerald-300 outline-none"
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}