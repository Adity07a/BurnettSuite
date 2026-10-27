import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import AssistantMessage from "../components/AssistantMessage";
import { configureSpeech, speechErrorMessage, speechSuggestions } from "../services/assistantSpeech";

import ModelSelector from "../components/ModelSelector";

const PAUSE_MS = 2500;
const MODES = {
  learn: { label: "Learn an answer", description: "Clear explanations, examples, and answers you can say aloud.", starters: ["Explain database indexing with an example", "Help me introduce myself using my resume", "Explain time complexity with a simple coding example"] },
  practice: { label: "Mock interview", description: "One question at a time, with feedback and follow-up questions.", starters: ["Start a technical mock interview", "Practice behavioral interview questions with me", "Interview me about the projects on my resume"] },
  feedback: { label: "Review my answer", description: "Find gaps in your answer and learn how to improve it.", starters: ["Help me review an interview answer", "How can I make my introduction stronger?"] },
};

export default function InterviewAssistant() {
  const location = useLocation();
  const [draft, setDraft] = useState("");
  const [models, setModels] = useState([]);
  const [modelId, setModelId] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [sessionReady, setSessionReady] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refine, setRefine] = useState(false);
  const [mode, setMode] = useState("learn");
  const [messages, setMessages] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState("en-IN");
  const [autoSend, setAutoSend] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState(false);
  const speechOptionsRef = useRef({ language: "en-IN", autoSend: false });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [voiceSupported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  const recognitionRef = useRef(null);
  const hintsEnabledRef = useRef(true);
  const voiceRef = useRef(false);
  const busyRef = useRef(true);
  const transcriptRef = useRef("");
  const baseTranscriptRef = useRef("");
  const messagesRef = useRef([]);
  const pauseRef = useRef(null);
  const restartRef = useRef(null);
  const controllerRef = useRef(null);
  const aliveRef = useRef(true);
  const answerRef = useRef(null);
  const startRef = useRef(null);
  const bottomRef = useRef(null);

  const clearTimers = () => {
    clearTimeout(pauseRef.current);
    clearTimeout(restartRef.current);
    pauseRef.current = null;
    restartRef.current = null;
  };

  const disableVoice = () => {
    voiceRef.current = false;
    setVoiceEnabled(false);
    setListening(false);
    clearTimers();
    recognitionRef.current?.abort();
  };

  const startRecognition = () => {
    if (!voiceRef.current || busyRef.current || !aliveRef.current) return;
    try {
      configureSpeech(recognitionRef.current, speechOptionsRef.current.language, window, hintsEnabledRef.current);
      recognitionRef.current?.start();
    } catch (startError) {
      // A start can race with the browser's existing listening session.
      if (startError.name !== "InvalidStateError") {
        disableVoice();
        setError("Microphone could not start. Try again or type your question.");
      }
    }
  };

  const ask = async (text) => {
    const question = text.trim();
    if (!question || busyRef.current || !sessionReady) return;
    disableVoice();
    busyRef.current = true;
    setBusy(true);
    setError("");
    clearTimers();
    recognitionRef.current?.abort();
    setListening(false);
    const next = [...messagesRef.current, { role: "user", content: question }];
    messagesRef.current = next;
    setMessages(next);
    const controller = new AbortController();
    controllerRef.current = controller;
    let succeeded = false;
    try {
      const response = await api.post("assistant/answer/", { question, mode, model_id: modelId, refine }, { signal: controller.signal });
      if (!aliveRef.current) return;
      const updated = response.data.messages;
      messagesRef.current = updated;
      setMessages(updated);
      transcriptRef.current = "";
      baseTranscriptRef.current = "";
      setDraft("");
      setVoiceDraft(false);
      succeeded = true;
    } catch (requestError) {
      if (!controller.signal.aborted && aliveRef.current) {
        // Preserve the question for retry without duplicating it in history.
        messagesRef.current = next.slice(0, -1);
        setMessages(messagesRef.current);
        setDraft(question);
        disableVoice();
        setError(requestError.response?.data?.error || "Unable to answer. Please retry.");
      }
    } finally {
      busyRef.current = false;
      if (aliveRef.current) {
        setBusy(false);
        if (succeeded && voiceRef.current) restartRef.current = setTimeout(() => startRef.current(), 300);
      }
    }
  };
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const options = { signal: controller.signal, timeout: 15000 };
    Promise.allSettled([api.get("assistant/conversation/", options), api.get("ai/models/", options)]).then(([chat, catalog]) => {
      if (!active) return;
      const failures = [];
      if (chat.status === "fulfilled") {
        messagesRef.current = chat.value.data.messages;
        setMessages(chat.value.data.messages);
      } else {
        failures.push("Unable to restore your chat history.");
      }
      if (catalog.status === "fulfilled") {
        setModels(catalog.value.data.models);
        setModelId(chat.status === "fulfilled" && chat.value.data.model_id || catalog.value.data.assistant_default);
      } else {
        failures.push(catalog.reason.response?.status === 404
          ? "The backend is missing the model list endpoint. Restart the backend to load the latest code, then retry."
          : "Unable to load AI models. Check that the backend is running, then retry.");
      }
      const ready = failures.length === 0;
      setSessionReady(ready);
      setLoadError(failures.join(" "));
      setInitializing(false);
      busyRef.current = false;
      setBusy(false);
      if (ready && voiceRef.current) startRef.current();
    });
    return () => { active = false; controller.abort(); };
  }, [loadAttempt]);

  const endChat = async () => {
    if (busyRef.current) return;
    disableVoice();
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await api.post("assistant/conversation/");
      if (!aliveRef.current) return;
      messagesRef.current = [];
      setMessages([]);
      setDraft("");
      transcriptRef.current = "";
      baseTranscriptRef.current = "";
    } catch {
      if (aliveRef.current) setError("Unable to end chat. Please retry.");
    } finally {
      busyRef.current = false;
      if (aliveRef.current) setBusy(false);
    }
  };

  useEffect(() => {
    startRef.current = startRecognition;
    answerRef.current = ask;
    speechOptionsRef.current = { language: speechLanguage, autoSend };
  });

  useEffect(() => {
    aliveRef.current = true;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => {
        if (aliveRef.current) setListening(true);
      };
      recognition.onresult = (event) => {
        if (!voiceRef.current || busyRef.current) return;
        const parts = [];
        const finalParts = [];
        let hasInterim = false;
        for (let i = 0; i < event.results.length; i += 1) {
          parts.push(event.results[i][0].transcript);
          if (event.results[i].isFinal) finalParts.push(event.results[i][0].transcript);
          else hasInterim = true;
        }
        const text = [baseTranscriptRef.current, ...parts].join(" ").trim();
        if (!text) return;
        transcriptRef.current = [baseTranscriptRef.current, ...finalParts].join(" ").trim();
        setDraft(text);
        setVoiceDraft(true);
        clearTimeout(pauseRef.current);
        if (speechOptionsRef.current.autoSend && !hasInterim && !speechSuggestions(text).length) {
          pauseRef.current = setTimeout(() => answerRef.current(transcriptRef.current), PAUSE_MS);
        }
      };
      recognition.onend = () => {
        if (!aliveRef.current) return;
        setListening(false);
        baseTranscriptRef.current = transcriptRef.current;
        if (voiceRef.current && !busyRef.current) {
          restartRef.current = setTimeout(() => startRef.current(), 300);
        }
      };
      recognition.onerror = (event) => {
        if (!aliveRef.current || event.error === "aborted" || event.error === "no-speech") return;
        if (event.error === "phrases-not-supported" && hintsEnabledRef.current && voiceRef.current) {
          hintsEnabledRef.current = false;
          // onend performs one restart with hints disabled. Never loop on failure.
          configureSpeech(recognition, speechOptionsRef.current.language, window, false);
          setListening(false);
          return;
        }
        voiceRef.current = false;
        setVoiceEnabled(false);
        setListening(false);
        clearTimers();
        setError(speechErrorMessage(event.error));
      };
      recognitionRef.current = recognition;
    }
    return () => {
      aliveRef.current = false;
      voiceRef.current = false;
      clearTimers();
      controllerRef.current?.abort();
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onstart = null;
        recognition.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (location.state?.startListening && voiceSupported) {
      const timer = setTimeout(() => {
        transcriptRef.current = "";
        baseTranscriptRef.current = "";
        voiceRef.current = true;
        setVoiceEnabled(true);
        startRef.current();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [location.key, location.state, voiceSupported]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const toggleVoice = () => {
    if (voiceRef.current) return disableVoice();
    setError("");
    transcriptRef.current = draft.trim();
    baseTranscriptRef.current = draft.trim();
    setVoiceDraft(true);
    voiceRef.current = true;
    setVoiceEnabled(true);
    startRecognition();
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-slate-100">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl px-5 py-8">
          <Link to="/interview-platform" className="text-sm font-semibold text-blue-600">Back to Dashboard</Link>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Your interview coach</p><h1 className="mt-2 text-3xl font-black text-slate-900">Practice. Understand. Improve.</h1></div><button type="button" onClick={endChat} disabled={busy || messages.length === 0} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">New conversation</button></div>
          <p className="mt-3 text-slate-600">Build confident answers with a coach that remembers your conversation. <Link to="/interview-platform/resume-upload" className="font-semibold text-blue-600">Upload your resume</Link> for personal examples.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Assistant mode">{Object.entries(MODES).map(([value, option]) => <button key={value} type="button" disabled={busy || voiceEnabled} aria-pressed={mode === value} onClick={() => setMode(value)} className={`rounded-2xl border p-4 text-left transition disabled:opacity-60 ${mode === value ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 bg-white hover:border-blue-300"}`}><span className="block text-sm font-bold text-slate-900">{option.label}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{option.description}</span></button>)}</div>
          <div className="mt-5 grid items-end gap-4 sm:grid-cols-2"><ModelSelector models={models} value={modelId} onChange={setModelId} disabled={busy || voiceEnabled} loading={initializing}/><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={refine} disabled={busy || voiceEnabled} onChange={(event) => setRefine(event.target.checked)}/>Refine answers before showing them (takes longer)</label></div>
          <p className="mt-2 text-xs text-slate-500">Changing models keeps this conversation and its resume context.</p>
          {loadError && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert"><p>{loadError}</p><button type="button" disabled={busy} onClick={() => { disableVoice(); busyRef.current = true; setBusy(true); setInitializing(true); setSessionReady(false); setLoadError(""); setLoadAttempt((attempt) => attempt + 1); }} className="mt-2 rounded-lg border border-red-300 px-3 py-2 font-semibold disabled:opacity-50">Retry loading</button></div>}
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="max-h-[50vh] min-h-48 space-y-5 overflow-y-auto" aria-live="polite" aria-label="Conversation">
              {messages.length === 0 && !busy && sessionReady && <div className="py-8"><h2 className="text-xl font-bold text-slate-900">What would you like to work on?</h2><p className="mt-2 text-sm text-slate-500">Choose a starting point or write your own message below.</p><div className="mt-5 flex flex-wrap gap-2">{MODES[mode].starters.map((prompt) => <button key={prompt} type="button" onClick={() => setDraft(prompt)} className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:border-blue-400 hover:bg-blue-50">{prompt}</button>)}</div></div>}
              {messages.map((message, index) => (
                <article key={index} className={`rounded-2xl p-4 ${message.role === "user" ? "ml-6 bg-blue-50" : "mr-6 bg-slate-50"}`}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{message.role === "user" ? "You" : "Interview coach"}</p>
                  {message.role === "user" ? <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">{message.content}</div> : <AssistantMessage content={message.content} />}
                </article>
              ))}
              {busy && <p className="animate-pulse rounded-xl bg-blue-50 p-4 text-sm text-blue-700" role="status">{messages.length ? "Your coach is preparing a responseâ€¦" : "Loading your conversationâ€¦"}</p>}
              <div ref={bottomRef} />
            </div>
            {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
            <form onSubmit={(event) => { event.preventDefault(); ask(draft); }} className="mt-6 border-t border-slate-100 pt-5">
              <label htmlFor="assistant-question" className="mb-2 block text-sm font-semibold text-slate-700">{mode === "feedback" ? "Interview question and your answer" : mode === "practice" ? "Your answer or practice request" : "Your question"}</label>
              <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-slate-600"><label>Voice language <select aria-label="Voice language" value={speechLanguage} disabled={voiceEnabled || busy} onChange={(event) => setSpeechLanguage(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white p-2"><option value="en-IN">English (India)</option><option value="en-US">English (US)</option><option value="en-GB">English (UK)</option></select></label><label className="flex items-center gap-2"><input type="checkbox" checked={autoSend} disabled={voiceEnabled || busy} onChange={(event) => setAutoSend(event.target.checked)} />Send finalized speech automatically</label></div>
              {voiceDraft && speechSuggestions(draft).length > 0 && <div className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Did you mean {speechSuggestions(draft).map((suggestion) => <button key={suggestion.label} type="button" disabled={busy} onClick={() => { disableVoice(); setDraft(suggestion.text); transcriptRef.current = suggestion.text; baseTranscriptRef.current = suggestion.text; }} className="ml-2 rounded-lg border border-amber-300 px-3 py-1 font-semibold">{suggestion.label}</button>)}? Select to correct the transcript before sending.</div>}
              <textarea id="assistant-question" value={draft} onChange={(event) => setDraft(event.target.value)} disabled={busy || voiceEnabled || !sessionReady} maxLength={4000} rows={3} placeholder="Type your interview question..." className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none disabled:bg-slate-50" />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="button" onClick={toggleVoice} disabled={!voiceSupported || !sessionReady || (busy && !voiceEnabled)} aria-pressed={voiceEnabled} className={`rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-40 ${voiceEnabled ? "bg-red-600" : "bg-slate-900"}`}>
                  {voiceEnabled ? "Stop microphone" : "Start microphone"}
                </button>
                <button type="submit" disabled={busy || !sessionReady || !draft.trim()} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-blue-300">{busy ? "Workingâ€¦" : "Send message"}</button>
                <span className="text-sm text-slate-500" role="status">{busy ? "Processing" : listening ? "Listening" : voiceEnabled ? "Connecting microphone" : "Microphone off"}</span>
              </div>
              <p className="mt-3 text-xs text-slate-500">{voiceSupported ? autoSend ? "Only finalized speech is sent after a 2.5-second pause. Suggested technical-term corrections need review. Sending stops the microphone." : "Speak, stop the microphone, then review or edit the transcript and send. Your speech is not sent automatically." : "Voice input is unavailable in this browser. Type your question or use Chrome."}</p>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
