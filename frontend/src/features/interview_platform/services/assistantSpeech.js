export const TECHNICAL_PHRASES = ["LangChain", "LangGraph", "LlamaIndex", "Django", "FastAPI", "PostgreSQL", "JavaScript", "TypeScript", "Kubernetes", "Docker", "React", "Python", "NumPy", "PyTorch", "TensorFlow", "retrieval augmented generation"];

export function configureSpeech(recognition, language, environment = window, useHints = true) {
  recognition.lang = language;
  recognition.maxAlternatives = 5;
  // Contextual biasing is experimental; unsupported browsers keep normal recognition.
  if ("phrases" in recognition && environment.SpeechRecognitionPhrase) {
    try {
      recognition.phrases = useHints ? TECHNICAL_PHRASES.map((phrase) => new environment.SpeechRecognitionPhrase(phrase, 3)) : [];
    } catch { /* The browser may expose the API without supporting it. */ }
  }
}

export function speechErrorMessage(code) {
  const messages = {
    network: "The browser could not connect to its speech recognition service. Check your internet connection or VPN, then retry. Your local backend is separate from this service.",
    "audio-capture": "The browser could not capture microphone audio. Check your selected microphone and operating system microphone access.",
    "not-allowed": "Microphone access was denied. Allow microphone access in this site's browser settings, then retry.",
    "service-not-allowed": "The browser blocked its speech recognition service. Check browser permissions or try another supported browser.",
    "language-not-supported": "This browser's speech service does not support the selected language. Select another voice language and retry.",
    "phrases-not-supported": "This browser's speech service does not support technical vocabulary hints. Retry without hints.",
  };
  return `${messages[code] || "Speech recognition failed. Stop and restart the microphone, or type your question."} (Voice error: ${code})`;
}

export function speechSuggestions(text) {
  // Ambiguous everyday words require user review, never silent replacement.
  const suggestions = [];
  if (/\b(?:lang\s+chain|language\s+(?:and|chain))\b/i.test(text)) {
    suggestions.push({ label: "LangChain", text: text.replace(/\b(?:lang\s+chain|language\s+(?:and|chain))\b/gi, "LangChain") });
  }
  if (/\blang\s+graph\b/i.test(text)) {
    suggestions.push({ label: "LangGraph", text: text.replace(/\blang\s+graph\b/gi, "LangGraph") });
  }
  return suggestions;
}
