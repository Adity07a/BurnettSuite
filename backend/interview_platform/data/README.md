# Local practice bank

`question_bank.json` contains 123 questions: 45 detailed Python/Django/FastAPI
Q&A imported from the user-provided `Python_Django_FastAPI_45_Interview_Questions_Detailed_Answers.pdf`,
followed by 78 original starter questions (60 technical, 9 HR and 9 project).
The imported entries retain their detailed answers, follow-up questions and
source section/number. They have `priority: 1`; originals default to priority 0.
Imported questions are classified as easy or medium; the existing hard questions
remain available. The PDF's five extra coding prompts have no detailed answers
and are not included in this 45-Q&A import. This is a starter
bank, not the proposed final 500–1000-question collection. Reference answers
describe concepts and do not claim the candidate has specific experience.

Choose **Local practice bank** in Interview Setup. Questions are selected locally;
the selected AI model evaluates answers using a stored reference and rubric.
There is no automatic paid fallback when the local pool is exhausted.

The index uses normalized sparse TF-IDF float vectors and cosine similarity
against the interview's resume context. It is cached in process memory, rebuilt
when JSON content changes, and needs no new package, neural model or embedding
API. It provides lexical retrieval with a few aliases, not neural semantic
understanding. Without matching resume terms it uses deterministic ordering.
Revision and unseen turns alternate where both groups are available; priority
then relevance rank each group. Each bank ID is asked at most once within a session.

Progress is stored in the database separately for each user and stable bank ID.
**Correctness >80** marks mastered; **correctness <=80** remains eligible for
revision. Exactly 80 is not mastered. An evaluation failure never grants mastery.
Scores are AI estimates, not verified percentages of factual accuracy. Resume,
shared bank records and historical attempts are not deleted. A newer attempt
takes precedence over an older evaluation that finishes later.

Repeated evaluation of the same saved answer/model/rubric reuses the saved
result. Editing an answer invalidates its evaluation and current progress.
Historical evaluations remain attached to their own attempts. The results page
counts local questions; this approximates baseline generation calls avoided,
not exact token or money savings. No API token estimate is invented.

To expand, append records with this structure:

```json
{
  "id": "tech-python-custom-medium",
  "interview_type": "technical",
  "difficulty": "medium",
  "tags": ["python", "testing"],
  "question": "How would you test a Python function that reads a file?",
  "reference_answer": "Use controlled fixtures and cover successful reads, missing files and invalid contents; ensure cleanup.",
  "rubric": ["Control file inputs", "Cover error handling and cleanup"]
}
```

Keep IDs stable; changing an ID resets its user progress. Use a new ID if the
question changes meaning. Existing attempts snapshot the reference and rubric.
All records are validated on load. Avoid duplicate questions, shallow paraphrases
and unreviewed answers. You may set Django `INTERVIEW_QUESTION_BANK_PATH` to an
alternate UTF-8 JSON file with `schema_version: 1` and a `questions` array.

Apply migrations before starting the backend:

```powershell
.venv/Scripts/python.exe backend/manage.py migrate
```

Verification:

```powershell
.venv/Scripts/python.exe backend/manage.py test interviews evaluations ai_engine interview_assistant --settings=config.test_settings
```
