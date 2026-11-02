import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Resume() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  // Cache bypass ke sath fresh data fetch karne ka function
  const load = async () => {
    try {
      const res = await api.get(`resumes/latest/?t=${Date.now()}`);
      setResume(res.data);
      return res.data;
    } catch (e) {
      if (e.response?.status !== 404) console.error(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api
      .get(`resumes/latest/?t=${Date.now()}`)
      .then(({ data }) => {
        if (active) setResume(data);
      })
      .catch((error) => {
        if (error.response?.status !== 404) console.error(error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const select = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(ext)) {
      setMessage("Please select a PDF or DOCX file.");
      return;
    }
    setSelectedFile(file);
    setMessage("");
  };

  const upload = async () => {
    if (!selectedFile) {
      setMessage("Please select a resume first.");
      return;
    }

    const fd = new FormData();
    fd.append("file", selectedFile);

    try {
      setUploading(true);
      setMessage("Uploading resume & starting AI analysis...");

      const response = await api.post("resumes/upload/", fd);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await load();
      setMessage(response.data.analysis_status === "failed"
        ? "Resume uploaded, but AI analysis failed. Please retry the analysis."
        : "Resume uploaded and analyzed successfully!");
      setUploading(false);

    } catch (e) {
      setMessage(e.response?.data?.error || "Resume upload failed. Please try again.");
      setUploading(false);
    }
  };

  const analysis = resume?.analysis;
  const retryAnalysis = async () => {
    if (!resume || uploading) return;
    setUploading(true);
    setMessage("Analyzing your resume...");
    try {
      await api.post(`resumes/${resume.id}/analyze/`);
      await load();
      setMessage("Resume analyzed successfully!");
    } catch (error) {
      setMessage(error.response?.data?.error || "Resume analysis failed. Please retry.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-slate-100">
        <Navbar />
        <main>
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-7 lg:px-8">
            <section className="relative mb-7 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
              <p className="text-sm font-semibold text-blue-300">Resume Center</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Your Resume</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Upload a PDF or DOCX and the AI will extract the information used to personalize your interview practice.
              </p>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">Upload resume</h2>
                <p className="mt-1 text-sm text-slate-500">PDF or DOCX · recommended under 10 MB</p>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    select(e.dataTransfer.files?.[0]);
                  }}
                  className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center transition ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"
                  }`}
                >
                  <div className="text-4xl">📄</div>
                  <h3 className="mt-3 font-bold text-slate-800">Drop your resume here</h3>
                  <p className="mt-1 text-sm text-slate-500">or choose a file from your computer</p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => select(e.target.files?.[0])}
                    className="hidden"
                  />
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="mt-5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Choose File
                  </button>
                </div>

                {selectedFile && (
                  <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                    <strong>{selectedFile.name}</strong>
                    <p className="mt-1 text-xs">Ready to upload</p>
                  </div>
                )}

                {message && (
                  <div
                    className={`mt-4 rounded-xl p-4 text-sm ${
                      message.includes("successfully")
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  disabled={uploading || !selectedFile}
                  onClick={upload}
                  className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {uploading ? "Analyzing with AI..." : "Upload & Analyze Resume"}
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                {loading ? (
                  <div className="py-16 text-center text-slate-500">Loading resume...</div>
                ) : !resume ? (
                  <div className="py-16 text-center">
                    <div className="text-4xl">📄</div>
                    <h2 className="mt-4 text-xl font-bold">No resume uploaded</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Upload one to see your AI resume analysis here.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Latest resume
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">{resume.file_name}</h2>
                        <p className="mt-1 text-xs text-slate-500">
                          Uploaded {new Date(resume.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          analysis ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {analysis ? "AI analysis ready" : "Analysis pending"}
                      </span>
                    </div>

                    {!analysis && (
                      <button onClick={retryAnalysis} disabled={uploading} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:bg-blue-300">
                        {uploading ? "Analyzing..." : "Retry AI analysis"}
                      </button>
                    )}
                    {analysis && (
                      <div className="mt-7 space-y-6">
                        <div>
                          <h3 className="font-bold text-slate-900">Professional Summary</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {analysis.summary || "No summary extracted."}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">Skills</h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {[...(analysis.skills || []), ...(analysis.technologies || [])]
                              .filter((v, i, a) => a.indexOf(v) === i)
                              .map((s) => (
                                <span
                                  key={s}
                                  className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                                >
                                  {s}
                                </span>
                              ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">Projects</h3>
                          <div className="mt-3 space-y-3">
                            {analysis.projects?.length ? (
                              analysis.projects.map((p, i) => (
                                <div key={i} className="rounded-2xl border border-slate-200 p-4">
                                  <p className="font-semibold">{p.name || "Project"}</p>
                                  <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {p.description || ""}
                                  </p>
                                  {p.technologies?.length > 0 && (
                                    <p className="mt-2 text-xs text-slate-500">
                                      {p.technologies.join(" · ")}
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-400">No projects found.</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">Experience</h3>
                          <div className="mt-3 space-y-3">
                            {analysis.experience?.length ? (
                              analysis.experience.map((e, i) => (
                                <div key={i} className="rounded-2xl border border-slate-200 p-4">
                                  <p className="font-semibold">
                                    {e.role || "Role"} {e.company ? `· ${e.company}` : ""}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">{e.duration || ""}</p>
                                  {e.responsibilities?.length > 0 && (
                                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                      {e.responsibilities.map((r, j) => (
                                        <li key={j}>• {r}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-400">No experience found.</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">Education</h3>
                          <div className="mt-3 space-y-3">
                            {analysis.education?.length ? (
                              analysis.education.map((e, i) => (
                                <div key={i} className="rounded-2xl border border-slate-200 p-4">
                                  <p className="font-semibold">{e.degree || "Degree"}</p>
                                  <p className="mt-1 text-sm text-slate-600">
                                    {e.institution || ""}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">{e.year || ""}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-400">No education found.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Resume;
