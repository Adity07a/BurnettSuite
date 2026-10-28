import { useEffect, useState } from "react";

export default function InterviewRoomPage({ sessionData, onFinishInterview, onNavigate }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  const QUESTIONS = [
    {
      id: 1,
      title: "How do you optimize Django ORM queries to prevent the N+1 queries problem?",
      topic: "Django & ORM Optimization",
      difficulty: "Medium",
      context:
        "Focus on select_related for single-valued relationships and prefetch_related for multi-valued sets.",
    },
    {
      id: 2,
      title: "Explain how PostgreSQL handles indexing on high-write tables, and when you would choose B-Tree over GIN/GiST.",
      topic: "Databases & Performance",
      difficulty: "Medium",
      context:
        "Consider write amplification, WAL logs, maintenance cost, and equality vs full-text queries.",
    },
    {
      id: 3,
      title: "Walk me through how you design a resilient background task processing system using Celery and Redis.",
      topic: "System Architecture",
      difficulty: "Hard",
      context:
        "Highlight idempotency, retry backoffs, task deduplication, and dead-letter queues.",
    },
    {
      id: 4,
      title: "Describe a situation where you had a disagreement with a team member over an architectural decision. How did you resolve it?",
      topic: "Behavioral & Conflict",
      difficulty: "Medium",
      context:
        "Use the STAR method: Situation, Task, Action taken, and quantifiable Result.",
    },
  ];

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const handleSpeechSynthesis = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const currentQ = QUESTIONS[currentIdx];
      const utterance = new SpeechSynthesisUtterance(currentQ.title);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeakingQuestion(true);
      utterance.onend = () => setIsSpeakingQuestion(false);
      utterance.onerror = () => setIsSpeakingQuestion(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate live speech recognition or test voice input
      setTimeout(() => {
        setCandidateAnswer(
          (prev) =>
            (prev ? prev + " " : "") +
            "In Django, I optimize queries primarily using select_related for ForeignKey/OneToOne joins, and prefetch_related for ManyToMany relationships, ensuring related instances are evaluated in minimal batch queries."
        );
      }, 1800);
    } else {
      setIsRecording(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setCandidateAnswer("");
      setIsRecording(false);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    } else {
      onFinishInterview({
        score: 84,
        date: new Date().toLocaleDateString(),
        questionsAnswered: QUESTIONS.length,
      });
    }
  };

  const currentQ = QUESTIONS[currentIdx];

  return (
    <div className="aii-content-wrap">
      {/* Active Session Header Bar */}
      <div className="aii-room-header">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span className="aii-live-dot-red" />
          <div>
            <strong style={{ fontSize: "15px", color: "var(--bpi-text-dark)", display: "block" }}>
              Live Mock Interview: {sessionData?.interviewType ? sessionData.interviewType.toUpperCase() : "TECHNICAL"}
            </strong>
            <span style={{ fontSize: "12px", color: "var(--bpi-text-muted)" }}>
              Question {currentIdx + 1} of {QUESTIONS.length}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="aii-timer-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Time Remaining: {formatTimer(secondsRemaining)}</span>
          </div>

          <button
            type="button"
            className="aii-btn-secondary"
            style={{ fontSize: "12px", padding: "6px 12px", color: "#dc2626" }}
            onClick={() => onNavigate("dashboard")}
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="aii-question-display">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                background: "var(--bpi-blue-soft)",
                color: "var(--bpi-primary)",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "999px",
              }}
            >
              {currentQ.topic}
            </span>
            <span
              style={{
                fontSize: "11px",
                background: "#f1f5f9",
                color: "#64748b",
                fontWeight: "600",
                padding: "3px 10px",
                borderRadius: "999px",
              }}
            >
              {currentQ.difficulty}
            </span>
          </div>

          <button
            type="button"
            className="aii-btn-secondary"
            style={{ fontSize: "12px", padding: "4px 10px" }}
            onClick={handleSpeechSynthesis}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            {isSpeakingQuestion ? "Playing Question..." : "Listen"}
          </button>
        </div>

        <h3>{currentQ.title}</h3>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--bpi-text-muted)" }}>
          💡 <strong>Interviewer's Focus:</strong> {currentQ.context}
        </p>
      </div>

      {/* Candidate Response Card */}
      <div className="aii-card-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>Your Answer</h4>
          <button
            type="button"
            className={isRecording ? "aii-btn-secondary" : "aii-btn-primary"}
            style={{ fontSize: "12.5px", padding: "6px 14px", background: isRecording ? "#fee2e2" : undefined, color: isRecording ? "#dc2626" : undefined }}
            onClick={handleToggleVoice}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            {isRecording ? "Recording... (Click to stop)" : "Speak Answer (Mic)"}
          </button>
        </div>

        <textarea
          rows={7}
          value={candidateAnswer}
          onChange={(e) => setCandidateAnswer(e.target.value)}
          placeholder="Speak into your microphone or type your technical response here. Take your time to structure your thoughts clearly..."
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "8px",
            border: "1px solid var(--bpi-card-border)",
            fontSize: "13.5px",
            lineHeight: "1.6",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--bpi-text-muted)" }}>
            {candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0} words
          </span>
          <span style={{ fontSize: "12px", color: "var(--bpi-text-muted)" }}>
            Pro-tip: Include metrics, trade-offs, and examples from your past projects.
          </span>
        </div>
      </div>

      {/* Navigation Footer Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
        <button
          type="button"
          className="aii-btn-secondary"
          onClick={() => {
            if (currentIdx < QUESTIONS.length - 1) {
              setCurrentIdx((prev) => prev + 1);
              setCandidateAnswer("");
            }
          }}
        >
          Skip Question
        </button>

        <button
          type="button"
          className="aii-btn-primary"
          style={{ fontSize: "14.5px", padding: "11px 26px" }}
          onClick={handleNext}
        >
          {currentIdx === QUESTIONS.length - 1 ? "Submit & View Report →" : "Submit Answer & Next →"}
        </button>
      </div>
    </div>
  );
}
