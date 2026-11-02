import re
import json
import logging
import time
import uuid
from difflib import SequenceMatcher
from openai import OpenAI
from django.conf import settings


logger = logging.getLogger(__name__)

def _model_messages(messages, model):
    """Gemma requires alternating turns and instructions in the initial user turn."""
    if not model.startswith("google.gemma-"):
        return messages
    instructions = "\n\n".join(message["content"] for message in messages if message["role"] == "system")
    turns = []
    for message in messages:
        if message["role"] == "system":
            continue
        role, content = message["role"], message["content"]
        if not turns:
            if role == "user":
                content = instructions + "\n\n" + content if instructions else content
            else:
                turns.append({"role": "user", "content": instructions or "Continue this interview conversation."})
        if turns and turns[-1]["role"] == role:
            turns[-1]["content"] += "\n\n" + content
        else:
            turns.append({"role": role, "content": content})
    return turns

def _bedrock_completion(messages, *, operation, context, max_tokens, temperature, model_id=None):
    model = settings.BEDROCK_MODEL_ID if model_id is None else model_id
    started = time.monotonic()
    logger.info("%s_api_started %s provider=aws_bedrock model=%s region=%s", operation, context, model, settings.AWS_REGION)
    try:
        if not settings.AWS_BEARER_TOKEN_BEDROCK:
            raise RuntimeError("AWS_BEARER_TOKEN_BEDROCK is not configured.")
        if not model:
            raise RuntimeError("BEDROCK_MODEL_ID is not configured.")
        with OpenAI(
            base_url=settings.BEDROCK_BASE_URL,
            api_key=settings.AWS_BEARER_TOKEN_BEDROCK,
            project=settings.BEDROCK_PROJECT,
            timeout=settings.BEDROCK_TIMEOUT_SECONDS,
            max_retries=0,
        ) as client:
            completion = client.chat.completions.create(
                model=model,
                messages=_model_messages(messages, model),
                max_tokens=max_tokens,
                temperature=temperature,
            )
        if not completion.choices:
            raise ValueError("Bedrock returned no completion choices.")
        raw = completion.choices[0].message.content or ""
        if completion.choices[0].finish_reason == "length":
            raise ValueError("Bedrock response exceeded the output token limit.")
        if not raw.strip():
            raise ValueError("Bedrock returned empty content.")
        logger.info(
            "%s_api_succeeded %s provider=aws_bedrock model=%s elapsed_ms=%.0f provider_request_id=%s",
            operation, context, model, (time.monotonic() - started) * 1000,
            getattr(completion, "_request_id", None),
        )
        return raw
    except Exception as error:
        logger.error(
            "%s_api_failed %s provider=aws_bedrock model=%s elapsed_ms=%.0f error_type=%s status=%s provider_request_id=%s error_code=%s",
            operation, context, model, (time.monotonic() - started) * 1000,
            type(error).__name__, getattr(error, "status_code", None),
            getattr(error, "request_id", None), getattr(error, "code", None),
        )
        raise


def analyze_resume(resume_text, *, resume_id=None):
    context = f"generation_id={uuid.uuid4().hex} resume_id={resume_id}"
    prompt = f"""
Analyze this resume text and extract structured information. Output JSON ONLY.

RESUME:
{resume_text}

JSON STRUCTURE:
{{
    "summary": "Professional summary string",
    "skills": ["skill1", "skill2"],
    "technologies": ["tech1", "tech2"],
    "projects": [
        {{
            "name": "Project name",
            "technologies": ["tech1"],
            "description": "Project summary"
        }}
    ],
    "experience": [
        {{
            "company": "Company name",
            "role": "Job role",
            "duration": "Duration",
            "responsibilities": ["duty1", "duty2"]
        }}
    ],
    "education": [
        {{
            "degree": "Degree",
            "institution": "Institution",
            "year": "Year"
        }}
    ]
}}
"""

    raw_text = _bedrock_completion(
        [
            {"role": "system", "content": "You are a JSON-only extractor. Do not output reasoning. Return only a valid JSON object."},
            {"role": "user", "content": prompt},
        ],
        operation="resume", context=context, max_tokens=3000, temperature=0.1,
    )
    if "</think>" in raw_text:
        raw_text = raw_text.split("</think>")[-1]
    json_match = re.search(r'(\{[\s\S]*\})', raw_text)
    if json_match:
        raw_text = json_match.group(1)
    # Fail explicitly instead of storing a synthetic success for an invalid response.
    json.loads(raw_text)
    return raw_text.strip()


def save_resume_analysis(resume, analysis_text):
    from .models import ResumeAnalysis

    raw = (analysis_text or "").strip()

    if "</think>" in raw:
        raw = raw.split("</think>")[-1]

    json_match = re.search(r'(\{[\s\S]*\})', raw)
    if json_match:
        raw = json_match.group(1)

    try:
        analysis_data = json.loads(raw)
    except (TypeError, json.JSONDecodeError) as parse_err:
        logger.warning("resume_analysis_invalid_json error_type=%s", type(parse_err).__name__)
        raise ValueError("AI returned invalid resume analysis.") from parse_err
    if not isinstance(analysis_data, dict) or not isinstance(analysis_data.get("summary"), str):
        raise ValueError("AI returned an invalid resume analysis structure.")
    for key, item_type in (("skills", str), ("technologies", str), ("projects", dict), ("experience", dict), ("education", dict)):
        values = analysis_data.get(key, [])
        if not isinstance(values, list) or any(not isinstance(value, item_type) for value in values):
            raise ValueError(f"AI returned invalid {key} in resume analysis.")

    analysis, created = ResumeAnalysis.objects.update_or_create(
        resume=resume,
        defaults={
            "summary": analysis_data.get("summary", ""),
            "skills": analysis_data.get("skills", []),
            "technologies": analysis_data.get("technologies", []),
            "projects": analysis_data.get("projects", []),
            "experience": analysis_data.get("experience", []),
            "education": analysis_data.get("education", []),
        }
    )

    return analysis


QUESTION_TOPICS = {
    "technical": ["project decisions", "debugging", "testing", "API design", "database tradeoffs", "performance", "security", "reliability"],
    "hr": ["teamwork", "conflict resolution", "ownership", "communication", "learning from failure", "prioritization", "career motivation", "receiving feedback"],
    "project": ["project goals", "architecture decisions", "implementation challenges", "testing strategy", "deployment", "performance bottlenecks", "user feedback", "lessons learned"],
}


def questions_are_similar(question, previous_questions):
    def normalize(text):
        return " ".join(re.findall(r"[a-z0-9]+", text.lower()))
    candidate = normalize(question)
    for previous in previous_questions:
        previous = normalize(previous)
        if candidate == previous or SequenceMatcher(None, candidate, previous).ratio() >= 0.82:
            return True
        left, right = set(candidate.split()), set(previous.split())
        if left and right and len(left & right) / len(left | right) >= 0.75:
            return True
    return False


def generate_interview_question(
    resume_text, interview_type, difficulty, previous_questions=None,
    *, interview_id=None, generation_id=None, conversation_history=None, model_id=None,
):
    previous_questions = list(dict.fromkeys(previous_questions or []))
    generation_id = generation_id or uuid.uuid4().hex
    context = f"generation_id={generation_id} interview_id={interview_id} question_number={len(previous_questions) + 1}"
    
    # Check karein agar Target JD provide kiya gaya hai
    has_target_jd = "TARGET JOB DESCRIPTION" in (resume_text or "")
    
    topics = QUESTION_TOPICS.get(interview_type, QUESTION_TOPICS["technical"])
    topic = topics[len(previous_questions) % len(topics)]
    
    # Question count ke hisaab se focus cycle karein:
    # Odd questions (1, 3, 5...) -> Resume Projects & Practical Experience
    # Even questions (2, 4, 6...) -> Target Job Description (JD) Requirements
    q_num = len(previous_questions) + 1
    if has_target_jd:
        if q_num % 2 == 1:
            focus_rule = "Candidate's Resume experience, past projects, tools, and technical decisions"
        else:
            focus_rule = "Target Job Description (JD) key requirements, role responsibilities, and tech stack alignment"
    else:
        focus_rule = topic

    logger.info("question_generation_started %s type=%s difficulty=%s q_num=%s focus=%s", context, interview_type, difficulty, q_num, focus_rule)
    history = "\n".join(f"- {q}" for q in previous_questions)
    
    prompt = (
        f"Interview type: {interview_type}. Difficulty: {difficulty}.\n"
        f"Question number: {q_num}.\n"
        f"Current Question Focus: {focus_rule}.\n"
        f"Candidate Resume & Job Profile Context:\n{resume_text[:16000]}\n"
        f"Already asked; do not repeat their wording or underlying topic:\n{history or 'None'}\n\n"
        "INTERVIEWER INSTRUCTIONS:\n"
        "- Conduct a holistic evaluation covering BOTH the candidate's actual resume (projects, skills, past stack) AND the target job description (JD requirements).\n"
        "- If targeting the resume: Ask about practical implementation decisions, challenges faced, or system architecture from their projects.\n"
        "- If targeting the JD: Present a realistic situational problem directly related to the tools and responsibilities mentioned in the JD.\n"
        "- Ask ONE specific, concise question (max 35 words). Avoid generic self-introductions or asking for a plain list of technologies.\n"
        "- Return ONLY the question, ending with a question mark. No markdown, no preface, no commentary."
    )
    
    for attempt in range(1, 3):
        raw = _bedrock_completion(
            [{"role": "system", "content": "You are an expert technical interviewer balancing candidate resume projects and target job description requirements. Return exactly one question."},
             *(conversation_history or []),
             {"role": "user", "content": prompt}],
            operation="question", context=f"{context} attempt={attempt}", max_tokens=256, temperature=0.7, model_id=model_id,
        )
        if "</think>" in raw:
            raw = raw.split("</think>")[-1]
        
        cleaned = re.sub(r"^\s*(?:```(?:text)?\s*|Question\s*\d*\s*:\s*)", "", raw, flags=re.IGNORECASE)
        cleaned = cleaned.strip().strip('"\'`* ').strip()
        
        question = cleaned.split("?", 1)[0].strip() + "?" if "?" in cleaned else cleaned
        if not question or not question.endswith("?") or question.count("?") != 1:
            logger.warning("question_output_rejected %s attempt=%s reason=invalid_question", context, attempt)
        elif questions_are_similar(question, previous_questions):
            logger.warning("question_output_rejected %s attempt=%s reason=duplicate", context, attempt)
        else:
            logger.info("question_generation_succeeded %s model=%s focus=%s", context, model_id or settings.BEDROCK_MODEL_ID, focus_rule)
            return question
        prompt += f"\nRejected output (do not paraphrase or repeat): {question}. Ask a completely different specific scenario."
    raise ValueError("Bedrock did not return a new, valid question. Please retry.")


def interview_conversation(interview):
    """Reconstruct the conversation from this interview's persisted turns."""
    messages = []
    for turn in interview.questions.all():
        messages.append({"role": "assistant", "content": turn.question})
        if turn.answer:
            messages.append({"role": "user", "content": turn.answer})
    return messages
