"""Offline sparse TF-IDF float vectors and cosine retrieval; no model downloads."""
import hashlib
import json
import math
import re
from collections import Counter
from functools import lru_cache
from pathlib import Path

from django.conf import settings

from .models import InterviewQuestion, QuestionProgress

STOP_WORDS = set("a an the is are of to for in on and or with how what would you your it this that from do does explain use using can about have i we my project projects experience candidate context reference only technical medium easy hard".split())
ALIASES = {"postgres": "postgresql", "nodejs": "node", "js": "javascript", "apis": "api", "databases": "database", "indexes": "index", "tests": "testing", "test": "testing", "caching": "cache"}


def tokens(text):
    text = text.lower().replace("node.js", "node").replace("react.js", "react")
    return [ALIASES.get(word, word) for word in re.findall(r"[a-z0-9]+", text) if word not in STOP_WORDS]


def vector(text, idf):
    counts = Counter(tokens(text))
    weighted = {word: (1 + math.log(count)) * idf[word] for word, count in counts.items() if word in idf}
    norm = math.sqrt(sum(value * value for value in weighted.values()))
    return {word: value / norm for word, value in weighted.items()} if norm else {}


@lru_cache(maxsize=4)
def _index(path, content_hash, raw):
    data = json.loads(raw)
    if not isinstance(data, dict) or data.get("schema_version") != 1 or not isinstance(data.get("questions"), list):
        raise ValueError("Invalid question bank schema.")
    entries, seen, frequency = [], set(), Counter()
    for entry in data["questions"]:
        if not isinstance(entry, dict):
            raise ValueError("Question bank entries must be objects.")
        for key in ("id", "question", "reference_answer"):
            if not isinstance(entry.get(key), str) or not entry[key].strip():
                raise ValueError(f"Missing question bank {key}.")
        if len(entry["id"]) > 100 or entry["id"] in seen:
            raise ValueError("Duplicate or oversized question bank ID.")
        seen.add(entry["id"])
        priority = entry.get("priority", 0)
        if isinstance(priority, bool) or not isinstance(priority, int) or priority < 0:
            raise ValueError("Question bank priority must be a non-negative integer.")
        if entry.get("interview_type") not in {"technical", "hr", "project"} or entry.get("difficulty") not in {"easy", "medium", "hard"}:
            raise ValueError("Invalid question bank type or difficulty.")
        for key in ("tags", "rubric"):
            if not isinstance(entry.get(key), list) or not entry[key] or any(not isinstance(value, str) or not value.strip() for value in entry[key]):
                raise ValueError(f"Invalid question bank {key}.")
        document = " ".join(entry["tags"]) + " " + entry["question"] + " " + entry["reference_answer"]
        entries.append((entry, document))
        frequency.update(set(tokens(document)))
    idf = {word: math.log((1 + len(entries)) / (1 + count)) + 1 for word, count in frequency.items()}
    return [(entry, vector(document, idf)) for entry, document in entries], idf


def bank_index():
    path = Path(getattr(settings, "INTERVIEW_QUESTION_BANK_PATH", Path(__file__).parent / "data" / "question_bank.json"))
    raw = path.read_text(encoding="utf-8")
    return _index(str(path), hashlib.sha256(raw.encode()).hexdigest(), raw)


def select_question(interview):
    entries, idf = bank_index()
    used = set(interview.questions.exclude(bank_id="").values_list("bank_id", flat=True))
    asked = set(interview.questions.values_list("question", flat=True)) | set(interview.asked_questions or [])
    progress = {row.bank_id: row for row in QuestionProgress.objects.filter(user=interview.user)}
    query = vector(interview.candidate_context, idf)
    previous_attempts = InterviewQuestion.objects.filter(
        interview__user=interview.user, interview__question_source="local",
        interview__interview_type=interview.interview_type, interview__difficulty=interview.difficulty,
    ).exclude(interview=interview).exclude(bank_id="")
    seen_before = set(previous_attempts.values_list("bank_id", flat=True))
    last_session = previous_attempts.order_by("-interview__created_at", "question_number").first()
    last_opening = last_session.bank_id if last_session else None
    first_turn = not used and not asked
    candidates = []
    revision_turn = interview.questions.count() % 2 == 0
    for entry, embedding in entries:
        state = progress.get(entry["id"])
        if (entry["interview_type"] != interview.interview_type or entry["difficulty"] != interview.difficulty
                or entry["id"] in used or entry["question"] in asked or (state and state.mastered)):
            continue
        similarity = sum(value * embedding.get(word, 0) for word, value in query.items())
        # Alternate revision and unseen questions, so neither group starves.
        preferred = bool(state) == revision_turn
        # Stable per-session shuffle: retries are consistent, new sessions differ.
        shuffle = int(hashlib.sha256(f"{interview.pk}:{entry['id']}".encode()).hexdigest(), 16)
        candidates.append(((not (first_turn and entry["id"] == last_opening),
                            entry["id"] not in seen_before, preferred,
                            entry.get("priority", 0), round(similarity, 1), shuffle), entry))
    return max(candidates, key=lambda item: item[0])[1] if candidates else None


def progress_summary(user, interview_type=None, difficulty=None):
    entries, _ = bank_index()
    ids = {entry["id"] for entry, _ in entries if (not interview_type or entry["interview_type"] == interview_type) and (not difficulty or entry["difficulty"] == difficulty)}
    progress = QuestionProgress.objects.filter(user=user, bank_id__in=ids)
    mastered = progress.filter(mastered=True).count()
    revision = progress.filter(mastered=False).count()
    return {"total": len(ids), "mastered": mastered, "revision": revision,
            "unseen": len(ids) - mastered - revision, "remaining": len(ids) - mastered,
            "mastery_threshold": 80, "score_metric": "correctness_score"}
