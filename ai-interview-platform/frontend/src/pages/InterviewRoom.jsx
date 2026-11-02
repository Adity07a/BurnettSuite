import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { configureInterviewVoice } from "../services/interviewVoice";
import { voiceFailureMessage } from "../services/interviewAudio";
import { speechErrorMessage } from "../services/assistantSpeech";

// Comprehensive Technical Phonetic Auto-Correction Dictionary
const correctTechTerms = (text) => {
  if (!text) return "";
  const corrections = [
    // --- PYTHON CORE CONCEPTS & DATA STRUCTURES ---
    [/\b(two pull|topple|toopul|tupel|tupple)\b/gi, "tuple"],
    [/\b(dictionery|diction dry|dictinary|dikshanari)\b/gi, "dictionary"],
    [/\b(compre hension|list comp)\b/gi, "comprehension"],
    [/\b(lamda|lamb da)\b/gi, "lambda"],
    [/\b(iter ator|eye terator)\b/gi, "iterator"],
    [/\b(gener ator|jen erator)\b/gi, "generator"],
    [/\b(deco rator|deck orater)\b/gi, "decorator"],
    [/\b(dunder|double under score|d under)\b/gi, "dunder"],
    [/\b(g i l|gil lock|global inter preter lock)\b/gi, "GIL"],
    [/\b(pie thon|pie than|py thon|pi thon|paithan)\b/gi, "Python"],
    [/\b(p i p|pip install)\b/gi, "pip"],
    [/\b(v env|virtual env|virtual e n v)\b/gi, "virtualenv"],
    [/\b(a sync|a sink|async await)\b/gi, "async"],

    // --- DJANGO FRAMEWORK & CONCEPTS ---
    [/\b(jungle|jan go|jangoo|jango|jingo|d jungle|jan google)\b/gi, "Django"],
    [/\b(o r m|orm mapper)\b/gi, "ORM"],
    [/\b(query set|curie set|quri set)\b/gi, "QuerySet"],
    [/\b(middle ware|midle ware)\b/gi, "middleware"],
    [/\b(m v t|m v c)\b/gi, "MVT"],
    [/\b(w s g i|wis gi|whiskey)\b/gi, "WSGI"],
    [/\b(a s g i|as gi|ass gi)\b/gi, "ASGI"],
    [/\b(gun i corn|guni corn|goonicorn)\b/gi, "Gunicorn"],
    [/\b(d r f|django rest frame work)\b/gi, "DRF"],
    [/\b(serial izer|serialiser)\b/gi, "serializer"],
    [/\b(sign als|django signal)\b/gi, "signals"],

    // --- FASTAPI & MODERN ASYNC ECOSYSTEM ---
    [/\b(fast a p i|fast api|fast a pi)\b/gi, "FastAPI"],
    [/\b(pie dantic|pi dantic|py dantic)\b/gi, "Pydantic"],
    [/\b(u vi corn|uvi corn|you vi corn)\b/gi, "Uvicorn"],
    [/\b(depend ency injection|depend ency)\b/gi, "dependency injection"],
    [/\b(path param|path parameter)\b/gi, "path parameters"],
    [/\b(query param|query parameter)\b/gi, "query parameters"],
    [/\b(star lette|starlet)\b/gi, "Starlette"],
    [/\b(swagger u i|open a p i)\b/gi, "Swagger UI"],

    // --- DATABASES, CACHE & MESSAGE BROKERS ---
    [/\b(seq uel|es que el|c quel|sequel)\b/gi, "SQL"],
    [/\b(no sequel|no c quel|no secquel)\b/gi, "NoSQL"],
    [/\b(post grass|post gres|postgres sql|post gray sql|post grey)\b/gi, "PostgreSQL"],
    [/\b(my sequel|my c quel|mai sequel)\b/gi, "MySQL"],
    [/\b(mongo db|mongo d b)\b/gi, "MongoDB"],
    [/\b(red is|redist)\b/gi, "Redis"],
    [/\b(sqlite 3|cqlite|s q l lite)\b/gi, "SQLite"],
    [/\b(cell ery|salari|celeri)\b/gi, "Celery"],
    [/\b(rabbit m q|rabbit em queue|rabbit mq)\b/gi, "RabbitMQ"],
    [/\b(kaf ka|cuff ka)\b/gi, "Kafka"],

    // --- DATA SCIENCE & AI LIBRARIES ---
    [/\b(pan das|pan da's)\b/gi, "Pandas"],
    [/\b(num pie|num pi)\b/gi, "NumPy"],
    [/\b(pie torch|pi torch)\b/gi, "PyTorch"],
    [/\b(tensor flow)\b/gi, "TensorFlow"],
    [/\b(scikit learn|sci kit learn|sy kit learn)\b/gi, "scikit-learn"],
    [/\b(r a g|rag model)\b/gi, "RAG"],
    [/\b(l l m|l l ms)\b/gi, "LLM"],

    // --- FRONTEND & WEB TECH ---
    [/\b(re act|react js|react dot js)\b/gi, "React"],
    [/\b(java script|js)\b/gi, "JavaScript"],
    [/\b(type script|ts)\b/gi, "TypeScript"],
    [/\b(tail wind|tailwind css)\b/gi, "Tailwind CSS"],
    [/\b(next js|neck st js)\b/gi, "Next.js"],
    [/\b(node js|know d js)\b/gi, "Node.js"],

    // --- DEVOPS, CLOUD & API ARCHITECTURE ---
    [/\b(a p i|apis)\b/gi, "API"],
    [/\b(rest a p i|rest api|rest full)\b/gi, "RESTful API"],
    [/\b(graph q l|graph queue l)\b/gi, "GraphQL"],
    [/\b(doc er|dock er|dakar)\b/gi, "Docker"],
    [/\b(kubernets|cooper netes|cuber netes|koobernetes)\b/gi, "Kubernetes"],
    [/\b(micro services|micro service)\b/gi, "microservices"],
    [/\b(git hub|get hub)\b/gi, "GitHub"],
    [/\b(git lab)\b/gi, "GitLab"],
    [/\b(a w s)\b/gi, "AWS"],
    [/\b(e c 2|easy two)\b/gi, "EC2"],
    [/\b(s 3|s three)\b/gi, "S3"],
    [/\b(o auth|o outh)\b/gi, "OAuth"],
    [/\b(j w t|jot token|j w token)\b/gi, "JWT"],
    [/\b(c i c d|c i \/ c d)\b/gi, "CI/CD"],
    [/\b(c o r s|core s)\b/gi, "CORS"],
  ];

  let cleaned = text;
  corrections.forEach(([pattern, replacement]) => {
    cleaned = cleaned.replace(pattern, replacement);
  });
  return cleaned;
};

function InterviewRoom() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ==========================================
  // QUESTION STATE & CODING MODE
  // ==========================================

  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("conceptual");
  const [code, setCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [questionLoading, setQuestionLoading] = useState(true);
  const [questionError, setQuestionError] = useState("");
  const [bankExhausted, setBankExhausted] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  // ==========================================
  // INTERVIEW STATUS
  // ==========================================

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [, setVoiceSource] = useState("Voice");
  const [, setVoiceWarning] = useState("");
  const [, setMicrophoneError] = useState("");
  const [changingQuestion, setChangingQuestion] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

  // ==========================================
  // TIMERS (30s Initial / 30s Guaranteed Answer / 15s Pause)
  // ==========================================

  const [timeLeft, setTimeLeft] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const [answerTimeRemaining, setAnswerTimeRemaining] = useState(30);
  const [isAnsweringActive, setIsAnsweringActive] = useState(false);
  const [hasCompletedMinTime, setHasCompletedMinTime] = useState(false);

  // ==========================================
  // ANSWER / TRANSCRIPT
  // ==========================================

  const [transcript, setTranscript] = useState("");
  const [, setAnswerError] = useState("");
  const [, setEvaluationError] = useState(null);
  const pendingEvaluationsRef = useRef(new Set());
  const endedRef = useRef(false);

  // ==========================================
  // REFS
  // ==========================================

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const hasSpokenRef = useRef(false);
  const answerProcessingRef = useRef(false);

  const currentQuestionIdRef = useRef(null);
  const answerTranscriptRef = useRef("");

  const initialSilenceTimerRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const restartTimerRef = useRef(null);
  const interviewTimerRef = useRef(null);
  const interviewEndTimeRef = useRef(null);

  const answerCountdownIntervalRef = useRef(null);
  const isAnsweringActiveRef = useRef(false);
  const hasCompletedMinTimeRef = useRef(false);

  const spokenQuestionRef = useRef("");
  const audioStopRef = useRef(null);
  const questionTextRef = useRef("");
  const blockedAudioRef = useRef(null);
  const browserSpeechRef = useRef(null);
  const latestTranscriptRef = useRef("");
  const changingQuestionRef = useRef(false);

  const stopBrowserSpeech = () => {
    const speech = browserSpeechRef.current;
    if (speech) {
      speech.onstart = null;
      speech.onend = null;
      speech.onerror = null;
    }
    browserSpeechRef.current = null;
    window.speechSynthesis.cancel();
  };

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const startInterviewTimer = (durationMinutes, startedAt) => {
    if (!durationMinutes || interviewStarted) return;
    const totalSeconds = durationMinutes * 60;
    const startTime = startedAt ? new Date(startedAt).getTime() : Date.now();
    const endTime = startTime + totalSeconds * 1000;

    interviewEndTimeRef.current = endTime;
    setTimeLeft(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    setInterviewStarted(true);

    clearInterval(interviewTimerRef.current);
    interviewTimerRef.current = setInterval(async () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        endedRef.current = true;
        shouldListenRef.current = false;
        clearAllTimers();
        clearInterval(interviewTimerRef.current);
        interviewTimerRef.current = null;
        try {
          recognitionRef.current?.stop();
        } catch {
          // Recognition may already be stopped during timer cleanup.
        }
        audioStopRef.current?.();
        stopBrowserSpeech();
        setIsListening(false);
        setIsSpeaking(false);
        try {
          await api.post(`interviews/${id}/complete/`);
        } catch {
          // Completion is best effort; pending evaluations still settle below.
        }
        await Promise.allSettled([...pendingEvaluationsRef.current]);
        alert("Interview completed successfully.");
        navigate(`/interview-result/${id}`);
      }
    }, 1000);
  };

  const startInterviewTimerEvent = useEffectEvent(startInterviewTimer);

  useEffect(() => {
    let active = true;
    const loadInterviewDetails = async () => {
      try {
        const response = await api.get(`interviews/${id}/`);
        if (!active) return;
        if (response.data.status === "completed") {
          navigate(`/interview-result/${id}`, { replace: true });
          return;
        }
        const started = await api.post(`interviews/${id}/start/`);
        if (!active) return;
        startInterviewTimerEvent(response.data.duration, started.data.started_at);
      } catch (error) {
        if (!active) return;
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/login");
        }
      }
    };
    loadInterviewDetails();
    return () => {
      active = false;
      clearInterval(interviewTimerRef.current);
    };
  }, [id, navigate]);

  async function fetchQuestion(signal) {
    if (endedRef.current) return;
    try {
      setQuestionLoading(true);
      setQuestionError("");
      setBankExhausted(false);
      setTranscript("");
      setAnswerError("");
      setConsoleOutput("");
      setIsProcessingAnswer(false);
      setVoiceWarning("");
      audioStopRef.current?.();
      stopBrowserSpeech();
      currentQuestionIdRef.current = null;
      latestTranscriptRef.current = "";
      answerProcessingRef.current = false;
      hasSpokenRef.current = false;
      shouldListenRef.current = false;
      spokenQuestionRef.current = "";

      // Reset Timers
      setIsAnsweringActive(false);
      isAnsweringActiveRef.current = false;
      setAnswerTimeRemaining(30);
      setHasCompletedMinTime(false);
      hasCompletedMinTimeRef.current = false;

      clearAllTimers();
      stopRecognition();

      const questionSaveResponse = await api.post(
        `interviews/${id}/questions/`,
        {},
        { signal }
      );
      if (endedRef.current || signal?.aborted) return;
      currentQuestionIdRef.current = questionSaveResponse.data.id;
      questionTextRef.current = questionSaveResponse.data.question;

      const qType = questionSaveResponse.data.question_type || "conceptual";
      setQuestionType(qType);
      setCode(
        questionSaveResponse.data.starter_code ||
          "# Write your solution in Python\n\ndef solution():\n    pass\n"
      );

      answerTranscriptRef.current = "";
      setQuestion(questionSaveResponse.data.question);
    } catch (error) {
      if (signal?.aborted) return;
      if (error.response?.data?.code === "bank_exhausted") {
        setBankExhausted(true);
        setQuestionError(error.response.data.error);
        return;
      }
      setQuestionError(
        error.response?.data?.error || "Unable to generate interview question."
      );
    } finally {
      if (!signal?.aborted) setQuestionLoading(false);
    }
  }

  const fetchQuestionEvent = useEffectEvent(fetchQuestion);

  useEffect(() => {
    const controller = new AbortController();
    // Defer the initial state transition until after the effect commits.
    queueMicrotask(() => {
      if (!controller.signal.aborted) fetchQuestionEvent(controller.signal);
    });
    return () => {
      controller.abort();
      stopRecognition();
      audioStopRef.current?.();
      stopBrowserSpeech();
      clearAllTimers();
    };
  }, [id]);

  const speakQuestionEvent = useEffectEvent(speakQuestion);

  useEffect(() => {
    if (question && !questionLoading && !questionError) {
      if (spokenQuestionRef.current === question) return;
      spokenQuestionRef.current = question;
      const timer = setTimeout(() => {
        speakQuestionEvent(question);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [question, questionLoading, questionError]);

  const speakBrowserQuestion = (text) => {
    setVoiceSource("Browser voice");
    if (!text) return;
    stopRecognition();
    audioStopRef.current?.();
    stopBrowserSpeech();

    const speech = new SpeechSynthesisUtterance(text);
    browserSpeechRef.current = speech;
    const questionId = currentQuestionIdRef.current;
    configureInterviewVoice(speech, window.speechSynthesis.getVoices());

    speech.onstart = () => {
      setIsSpeaking(true);
      setIsListening(false);
      clearAllTimers();
    };
    speech.onend = () => {
      if (endedRef.current || questionId !== currentQuestionIdRef.current) return;
      setIsSpeaking(false);
      startListening();
    };
    speech.onerror = () => {
      if (endedRef.current || questionId !== currentQuestionIdRef.current) return;
      setIsSpeaking(false);
      startListening();
    };
    window.speechSynthesis.speak(speech);
  };

  async function speakQuestion(text) {
    if (!text || endedRef.current) return;
    stopRecognition();
    clearAllTimers();
    audioStopRef.current?.();
    stopBrowserSpeech();
    setIsSpeaking(true);
    setVoiceSource("Loading voice");
    setVoiceWarning("");
    setIsListening(false);
    const controller = new AbortController();
    const questionId = currentQuestionIdRef.current;
    let audio = null;
    let url = null;
    let stopped = false;
    const release = () => {
      if (url) {
        URL.revokeObjectURL(url);
        url = null;
      }
    };
    audioStopRef.current = () => {
      stopped = true;
      blockedAudioRef.current = null;
      controller.abort();
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      release();
    };
    const fallback = async (error) => {
      if (stopped || endedRef.current) return;
      const message = await voiceFailureMessage(error);
      if (stopped || endedRef.current) return;
      setVoiceWarning(message);
      if (error?.name === "NotAllowedError" && audio) {
        blockedAudioRef.current = { audio, questionId };
        setVoiceSource("Tap Play question");
        setIsSpeaking(false);
        startInitialSilenceTimer();
        return;
      }
      audioStopRef.current?.();
      speakBrowserQuestion(text);
    };
    try {
      const response = await api.get(
        `interviews/${id}/questions/${currentQuestionIdRef.current}/speech/`,
        { responseType: "blob", signal: controller.signal, timeout: 25000 }
      );
      if (stopped || endedRef.current) return;
      url = URL.createObjectURL(response.data);
      audio = new Audio(url);
      audio.onended = () => {
        release();
        if (stopped || endedRef.current) return;
        setIsSpeaking(false);
        startListening();
      };
      audio.onerror = () => fallback({ name: "NotSupportedError" });
      await audio.play();
      if (!stopped && !endedRef.current) setVoiceSource("Voice");
    } catch (error) {
      await fallback(error);
    }
  }

  const playQuestion = async () => {
    const blocked = blockedAudioRef.current;
    if (
      blocked &&
      blocked.questionId === currentQuestionIdRef.current &&
      !endedRef.current
    ) {
      try {
        await blocked.audio.play();
        if (blocked.questionId !== currentQuestionIdRef.current || endedRef.current)
          return;
        blockedAudioRef.current = null;
        setVoiceWarning("");
        setVoiceSource("Voice");
        setIsSpeaking(true);
      } catch (error) {
        setVoiceWarning(await voiceFailureMessage(error));
      }
    } else await speakQuestion(questionTextRef.current);
  };

  useEffect(() => () => {
    audioStopRef.current?.();
  }, []);

  // 1. INITIAL 30 SECONDS NO-ANSWER COUNTDOWN (Kuch na bola to change)
  const startInitialSilenceTimer = () => {
    if (questionType === "coding" || endedRef.current) return;
    clearTimeout(initialSilenceTimerRef.current);

    initialSilenceTimerRef.current = setTimeout(() => {
      const currentSpokenText = (
        answerTranscriptRef.current || latestTranscriptRef.current || ""
      ).trim();

      // Agar bilkul shant raha 30 seconds tak -> Skip / Change Question
      if (!currentSpokenText && !changingQuestionRef.current && !answerProcessingRef.current) {
        changeQuestion();
      }
    }, 30000); // 30 seconds
  };

  // 2. GUARANTEED 30-SECOND ANSWER TIMER
  const startThirtySecondAnswerTimer = () => {
    if (isAnsweringActiveRef.current || answerCountdownIntervalRef.current) return;
    isAnsweringActiveRef.current = true;
    setIsAnsweringActive(true);
    setAnswerTimeRemaining(30);
    setHasCompletedMinTime(false);
    hasCompletedMinTimeRef.current = false;

    let secondsPassed = 0;
    clearInterval(answerCountdownIntervalRef.current);
    answerCountdownIntervalRef.current = setInterval(() => {
      secondsPassed += 1;
      const left = Math.max(0, 30 - secondsPassed);
      setAnswerTimeRemaining(left);

      if (left <= 0) {
        clearInterval(answerCountdownIntervalRef.current);
        answerCountdownIntervalRef.current = null;
        setHasCompletedMinTime(true);
        hasCompletedMinTimeRef.current = true;
        // 30 seconds pura hote hi continuous silence tracking restart ho sakegi
        resetPostThirtyPauseTimer();
      }
    }, 1000);
  };

  // 3. 15-SECOND PAUSE SUBMIT (Only active AFTER 30 seconds minimum answering time)
  const resetPostThirtyPauseTimer = () => {
    if (questionType === "coding" || endedRef.current) return;
    clearTimeout(pauseTimerRef.current);

    // Agar 30 sec ka minimum answering time pura nahi hua hai, to pause lene par change NAHI karenge
    if (!hasCompletedMinTimeRef.current) return;

    pauseTimerRef.current = setTimeout(() => {
      const currentSpokenText = (
        answerTranscriptRef.current || latestTranscriptRef.current || ""
      ).trim();

      if (currentSpokenText.length > 3 && !answerProcessingRef.current) {
        finishAnswer();
      }
    }, 15000); // 15 seconds continuous pause
  };

  const startThirtySecondAnswerTimerEvent = useEffectEvent(
    startThirtySecondAnswerTimer
  );
  const resetPostThirtyPauseTimerEvent = useEffectEvent(
    resetPostThirtyPauseTimer
  );

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setIsProcessingAnswer(false);
    };

    recognition.onresult = (event) => {
      if (!shouldListenRef.current || answerProcessingRef.current) return;
      let interimTranscript = "";
      const finalParts = [];
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const spokenText = event.results[i][0].transcript.trim();
        if (!spokenText) continue;
        if (event.results[i].isFinal) finalParts.push(spokenText);
        else interimTranscript += `${spokenText} `;
      }
      if (finalParts.length > 0) {
        answerTranscriptRef.current = [
          answerTranscriptRef.current,
          finalParts.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
      }
      const rawDisplayTranscript = [
        answerTranscriptRef.current,
        interimTranscript.trim(),
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (!rawDisplayTranscript) return;

      // Candidate ne bolna start kiya -> 30 sec Initial Silence Timer cancel karein
      clearTimeout(initialSilenceTimerRef.current);
      initialSilenceTimerRef.current = null;

      // Guaranteed 30-sec Answering Timer start karein
      if (questionType !== "coding") {
        startThirtySecondAnswerTimerEvent();
      }

      // Real-time tech term phonetic auto-correction
      const displayTranscript = correctTechTerms(rawDisplayTranscript);
      setTranscript(displayTranscript);
      hasSpokenRef.current = true;
      latestTranscriptRef.current = displayTranscript;

      // Agar 30 sec pura ho chuka hai, tab 15s pause timer chalega
      if (questionType !== "coding" && hasCompletedMinTimeRef.current) {
        resetPostThirtyPauseTimerEvent();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      shouldListenRef.current = false;
      setIsListening(false);
      setMicrophoneError(speechErrorMessage(event.error));
    };

    recognition.onend = () => {
      setIsListening(false);
      if (shouldListenRef.current && !answerProcessingRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (shouldListenRef.current && !answerProcessingRef.current) {
            try {
              recognition.start();
            } catch {
              // The browser may reject a duplicate recognition start.
            }
          }
        }, 200);
      }
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        // The browser may report that recognition is already stopped.
      }
    };
  }, [questionType]);

  const startListening = () => {
    if (endedRef.current || !recognitionRef.current) return;
    clearTimeout(initialSilenceTimerRef.current);
    clearTimeout(pauseTimerRef.current);
    clearTimeout(restartTimerRef.current);

    shouldListenRef.current = true;
    answerProcessingRef.current = false;
    hasSpokenRef.current = false;
    setMicrophoneError("");

    // Listening shuru hote hi 30 sec initial silence timer start karein
    startInitialSilenceTimer();

    setIsProcessingAnswer(false);
    try {
      recognitionRef.current.start();
    } catch {
      setIsListening(true);
    }
  };

  function stopRecognition() {
    shouldListenRef.current = false;
    clearTimeout(restartTimerRef.current);
    clearTimeout(initialSilenceTimerRef.current);
    clearTimeout(pauseTimerRef.current);
    initialSilenceTimerRef.current = null;
    pauseTimerRef.current = null;
    clearInterval(answerCountdownIntervalRef.current);
    answerCountdownIntervalRef.current = null;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // The browser may report that recognition is already stopped.
      }
    }
    setIsListening(false);
  }

  const evaluateAnswer = (questionId) => {
    const task = api
      .post(`evaluations/${questionId}/evaluate/`)
      .then(() =>
        setEvaluationError((current) =>
          current?.questionId === questionId ? null : current
        )
      )
      .catch(() => {
        setEvaluationError({
          questionId,
          message: "Your answer was saved, but its evaluation failed.",
        });
      })
      .finally(() => pendingEvaluationsRef.current.delete(task));
    pendingEvaluationsRef.current.add(task);
    return task;
  };

  const finishAnswer = async () => {
    if (answerProcessingRef.current) return;
    answerProcessingRef.current = true;
    shouldListenRef.current = false;
    clearAllTimers();
    setIsListening(false);
    setIsProcessingAnswer(true);

    try {
      recognitionRef.current?.stop();
    } catch {
      // Recognition may already be stopped while an answer is submitted.
    }

    const currentQuestionId = currentQuestionIdRef.current;
    const rawAnswer = (
      answerTranscriptRef.current || latestTranscriptRef.current
    ).trim();
    const finalAnswer = correctTechTerms(rawAnswer);

    if (!finalAnswer) {
      answerProcessingRef.current = false;
      await changeQuestion();
      return;
    }

    if (currentQuestionId && finalAnswer) {
      try {
        await api.post(
          `interviews/${id}/questions/${currentQuestionId}/answer/`,
          { answer: finalAnswer }
        );
        evaluateAnswer(currentQuestionId);
      } catch {
        setAnswerError(
          "Your answer could not be saved. Please retry before continuing."
        );
        setIsProcessingAnswer(false);
        answerProcessingRef.current = false;
        return;
      }
    }
    if (!endedRef.current) await goToNextQuestion();
  };

  // Run Python Code without Submitting
  const handleRunCode = async () => {
    setConsoleOutput(
      "Code execution is unavailable until the isolated runner is deployed. " +
        "You can still submit the solution for evaluation.",
    );
  };

  // Submit Final Code + Transcript
  const handleManualCodeSubmit = async () => {
    if (isSubmittingCode || answerProcessingRef.current) return;
    setIsSubmittingCode(true);
    stopRecognition();

    const currentQuestionId = currentQuestionIdRef.current;
    const cleanedExplanation = correctTechTerms(transcript);
    const combinedAnswer = `[Code Submission]:\n\`\`\`python\n${code}\n\`\`\`\n\n[Console Run Output]:\n${
      consoleOutput || "Not run prior to submission."
    }\n\n[Candidate Explanation]:\n${
      cleanedExplanation || "No spoken remarks provided."
    }`;

    try {
      await api.post(`interviews/${id}/questions/${currentQuestionId}/answer/`, {
        answer: combinedAnswer,
      });
      evaluateAnswer(currentQuestionId);
      await goToNextQuestion();
    } catch {
      alert("Error submitting solution. Please retry.");
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const changeQuestion = async () => {
    if (
      endedRef.current ||
      changingQuestionRef.current ||
      answerProcessingRef.current
    )
      return;
    const questionId = currentQuestionIdRef.current;
    if (!questionId) return;
    changingQuestionRef.current = true;
    setChangingQuestion(true);
    stopRecognition();
    clearAllTimers();
    currentQuestionIdRef.current = null;
    audioStopRef.current?.();
    stopBrowserSpeech();
    setIsSpeaking(false);
    try {
      await api.post(`interviews/${id}/questions/${questionId}/skip/`);
      if (!endedRef.current) await goToNextQuestion();
    } catch (error) {
      currentQuestionIdRef.current = questionId;
      setAnswerError(
        error.response?.data?.error || "Unable to change question. Please retry."
      );
    } finally {
      changingQuestionRef.current = false;
      setChangingQuestion(false);
    }
  };

  const goToNextQuestion = async () => {
    setIsProcessingAnswer(false);
    setTranscript("");
    answerTranscriptRef.current = "";
    setQuestion("");
    setConsoleOutput("");
    currentQuestionIdRef.current = null;
    answerProcessingRef.current = false;
    hasSpokenRef.current = false;
    shouldListenRef.current = false;
    spokenQuestionRef.current = "";

    // Reset Timers
    setIsAnsweringActive(false);
    isAnsweringActiveRef.current = false;
    setAnswerTimeRemaining(30);
    setHasCompletedMinTime(false);
    hasCompletedMinTimeRef.current = false;

    clearAllTimers();
    await fetchQuestion();
  };

  function clearAllTimers() {
    clearTimeout(initialSilenceTimerRef.current);
    initialSilenceTimerRef.current = null;
    clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = null;
    clearTimeout(restartTimerRef.current);
    clearInterval(answerCountdownIntervalRef.current);
    answerCountdownIntervalRef.current = null;
  }

  const getStatusText = () => {
    if (bankExhausted) return "Practice questions completed";
    if (questionLoading) return "Generating question...";
    if (isSpeaking) return "Interviewer is speaking...";
    if (isProcessingAnswer) return "Processing your answer...";
    if (questionType === "coding") return "Live Coding Challenge active";
    if (isListening) {
      if (isAnsweringActive && !hasCompletedMinTime) {
        return "Answering active (30s guaranteed answer window)...";
      }
      return "Listening... Speak your answer";
    }
    return "Preparing...";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            ◈
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white">AI Interview Room</h1>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Session #{id}
              </span>
              {questionType === "coding" && (
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
                  ⚡ CODING ROUND
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm shadow-sm ${
              timeLeft <= 60
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
            }`}
          >
            ⏱ {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Exit Session
          </button>
        </div>
      </header>

      {/* Status Bar */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? "bg-indigo-400 animate-pulse"
                : isListening
                ? "bg-emerald-400 animate-pulse"
                : isProcessingAnswer
                ? "bg-amber-400 animate-pulse"
                : "bg-slate-500"
            }`}
          />
          <span className="text-slate-300 font-medium">{getStatusText()}</span>
        </div>
        {isListening && (
          <span className="text-[11px] text-emerald-400 font-mono">● MIC ACTIVE</span>
        )}
      </div>

      {/* Main Workspace */}
      <main className="flex-1 p-6 flex flex-col justify-center">
        {questionType === "coding" ? (
          /* ================= CODING WORKSPACE ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-[620px]">
            {/* Left: Problem Statement & Verbal Notes */}
            <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto">
              <div className="bg-[#0c101b] border border-slate-800 p-5 rounded-2xl flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      Problem Statement
                    </span>
                    <button
                      onClick={playQuestion}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      🔊 Play Audio
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {question}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={changeQuestion}
                    disabled={changingQuestion}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Skip Challenge
                  </button>
                </div>
              </div>

              {/* Spoken Explanation Live Box */}
              <div className="bg-[#0c101b] border border-slate-800 p-4 rounded-2xl h-44 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400">
                      Audio Explanation (Optional)
                    </span>
                    {isListening ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        Recording...
                      </span>
                    ) : (
                      <button
                        onClick={startListening}
                        className="text-[10px] text-indigo-400 underline"
                      >
                        Enable Mic
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-3">
                    {transcript ||
                      "Speak your approach or complexity notes while writing code..."}
                  </p>
                </div>
                <div className="text-[10px] text-slate-500">
                  Your audio is evaluated alongside your code solution.
                </div>
              </div>
            </div>

            {/* Right: Monaco Editor + Live Console Terminal */}
            <div className="lg:col-span-7 bg-[#0c101b] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="bg-[#101524] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  Python 3 Workspace
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCode}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    Check runner
                  </button>
                  <button
                    onClick={handleManualCodeSubmit}
                    disabled={isSubmittingCode}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                  >
                    {isSubmittingCode ? "Submitting..." : "Submit Solution →"}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-[340px]">
                <textarea
                  aria-label="Python solution"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  spellCheck="false"
                  className="h-full min-h-[340px] w-full resize-none bg-[#0c101b] p-4 font-mono text-[13px] leading-6 text-slate-100 outline-none"
                />
              </div>

              <div className="h-36 bg-[#06080e] border-t border-slate-800/80 p-3 font-mono text-xs overflow-y-auto">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">
                  Terminal Output:
                </div>
                {consoleOutput ? (
                  <pre className="text-emerald-400 whitespace-pre-wrap">{consoleOutput}</pre>
                ) : (
                  <span className="text-slate-600">
                    Click "Run Code" to view stdout / return output here before submitting.
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ================= CONCEPTUAL INTERVIEW WORKSPACE ================= */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto items-stretch w-full">
            <section className="bg-[#0c101b] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl min-h-[380px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      AI Interviewer
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Listen carefully to the question prompt.
                    </p>
                  </div>
                  <span className="text-2xl">🤖</span>
                </div>

                {questionLoading ? (
                  <div className="min-h-[190px] flex items-center justify-center text-slate-400 text-sm">
                    Generating your question...
                  </div>
                ) : questionError ? (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 text-xs">
                    {questionError}
                  </div>
                ) : (
                  <div className="min-h-[190px] bg-[#080c16] rounded-xl p-5 border border-slate-800 flex items-center">
                    <p className="text-base text-white leading-relaxed">{question}</p>
                  </div>
                )}
              </div>

              {!questionLoading && !questionError && (
                <div className="flex gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={changeQuestion}
                    disabled={changingQuestion || isProcessingAnswer}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                  >
                    Change Question
                  </button>
                  <button
                    onClick={playQuestion}
                    disabled={changingQuestion || isSpeaking}
                    className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
                  >
                    Play Audio
                  </button>
                </div>
              )}
            </section>

            <section className="bg-[#0c101b] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl min-h-[380px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white">Your Spoken Answer</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Speak naturally; voice is transcribed in real-time.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Corner Timer Badge (30s Countdown) */}
                    {isAnsweringActive && (
                      <div
                        className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border transition ${
                          !hasCompletedMinTime
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse"
                            : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        }`}
                      >
                        ⏱ {!hasCompletedMinTime ? `00:${String(answerTimeRemaining).padStart(2, "0")}` : "30s Done"}
                      </div>
                    )}

                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm ${
                        isListening
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      🎤
                    </div>
                  </div>
                </div>

                <div className="min-h-[190px] bg-[#080c16] rounded-xl p-5 border border-slate-800 text-xs flex items-center justify-center relative">
                  {transcript ? (
                    <p className="text-slate-200 leading-relaxed text-left w-full overflow-y-auto max-h-[160px]">
                      {transcript}
                    </p>
                  ) : isListening ? (
                    <p className="text-emerald-400 animate-pulse">
                      Listening... speak your response.
                    </p>
                  ) : isProcessingAnswer ? (
                    <p className="text-amber-400">Analyzing answer with AI engine...</p>
                  ) : (
                    <p className="text-slate-500">
                      Your transcribed answer will appear here...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">
                  {isAnsweringActive && !hasCompletedMinTime
                    ? "⏳ 30s speaking window active."
                    : hasCompletedMinTime
                    ? "✓ 30s completed. 15s pause will auto-submit."
                    : "30s silence will change the question."}
                </span>

                <button
                  onClick={finishAnswer}
                  disabled={!transcript || isProcessingAnswer}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition disabled:opacity-40"
                >
                  Submit Spoken Answer →
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default InterviewRoom;
