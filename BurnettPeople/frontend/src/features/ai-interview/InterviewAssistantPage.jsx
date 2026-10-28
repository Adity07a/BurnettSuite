import { useState } from "react";

export default function InterviewAssistantPage() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello Mayank! I'm your AI Interview Coach. I can help you prepare for technical questions, master behavioral responses with the STAR method, or review tough questions for your upcoming interviews. What would you like to practice today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const PROMPTS = [
    "How do I answer 'Tell me about yourself'?",
    "Explain the STAR framework for behavioral interviews.",
    "What are good questions to ask the interviewer at the end?",
    "How to explain a production bug I caused?",
  ];

  const handleSend = (textToSend) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg = { sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "That's an important interview topic! ";
      if (q.includes("yourself")) {
        reply +=
          "Structure your answer into Present, Past, and Future: 1. Present: What is your current role and key accomplishments. 2. Past: How your background and key projects prepared you for this moment. 3. Future: Why this specific company and role is the logical next step in your career.";
      } else if (q.includes("STAR")) {
        reply +=
          "The STAR method stands for: Situation (Set the context in 1-2 sentences), Task (Describe your specific responsibility), Action (Explain the concrete technical or communicative actions YOU took), and Result (Quantify the positive outcome or business impact).";
      } else if (q.includes("questions to ask")) {
        reply +=
          "Great questions show engagement: 1. 'What does success look like in this role in the first 90 days?' 2. 'What are the biggest technical or architectural challenges currently facing the team?' 3. 'How does the engineering team handle code reviews and deployment velocity?'";
      } else {
        reply +=
          "When answering, always state the problem clearly, describe your technical reasoning, emphasize your proactive ownership, and conclude with the tangible results achieved.";
      }

      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="aii-content-wrap">
      <div style={{ fontSize: "12px", color: "var(--bpi-text-muted)", marginBottom: "6px" }}>
        <span>AI Interview Platform</span> / <span>Assistant</span>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 4px", color: "var(--bpi-text-dark)" }}>
          AI Interview Coach Chat
        </h1>
        <p style={{ fontSize: "13.5px", color: "var(--bpi-text-muted)", margin: 0 }}>
          Ask any questions about interview techniques, tricky technical concepts, and salary negotiation.
        </p>
      </div>

      {/* Recommended Prompts */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            className="aii-btn-secondary"
            style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "999px" }}
            onClick={() => handleSend(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="aii-card-panel" style={{ display: "flex", flexDirection: "column", height: "560px", padding: "20px" }}>
        <div className="aii-chat-stream" style={{ flex: 1 }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`aii-bubble ${m.sender === "ai" ? "aii-bubble-ai" : "aii-bubble-user"}`}
            >
              {m.text}
            </div>
          ))}
          {isTyping && (
            <div className="aii-bubble aii-bubble-ai" style={{ color: "var(--bpi-text-muted)" }}>
              AI Coach is thinking...
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: "flex", gap: "10px", marginTop: "16px", borderTop: "1px solid var(--bpi-card-border)", paddingTop: "14px" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your interview preparation question here..."
            style={{
              flex: 1,
              padding: "11px 16px",
              borderRadius: "8px",
              border: "1px solid var(--bpi-card-border)",
              fontSize: "13.5px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            className="aii-btn-primary"
            disabled={!input.trim()}
          >
            Send Question
          </button>
        </form>
      </div>
    </div>
  );
}
