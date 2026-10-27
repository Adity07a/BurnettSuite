import json
import tempfile
from pathlib import Path
from unittest.mock import patch

from django.contrib.auth.models import User
from django.db import OperationalError
from django.test import override_settings
from rest_framework.test import APITestCase

from .models import Interview, InterviewQuestion, QuestionProgress
from .question_bank import bank_index, select_question


def grade(score):
    return dict(overall_score=95, technical_score=score, correctness_score=score,
                relevance_score=score, communication_score=95, strengths=["Clear"],
                weaknesses=["Add detail"], feedback="Reviewed", improved_answer="Reference explanation")


class LocalQuestionBankTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="local-practice")
        self.client.force_authenticate(self.user)
        self.interview = Interview.objects.create(user=self.user, interview_type="technical", difficulty="medium",
            duration=30, question_source="local", candidate_context="Redis TTL partner postback idempotency")
        self.route = f"/api/interviews/{self.interview.pk}/questions/"

    def answer(self, turn, text="My answer"):
        return self.client.post(f"/api/interviews/{turn.interview_id}/questions/{turn.pk}/answer/", {"answer": text})

    def evaluate(self, turn, score):
        with patch("evaluations.views.evaluate_interview_answer", return_value=grade(score)) as mock:
            result = self.client.post(f"/api/evaluations/{turn.pk}/evaluate/")
            self.assertEqual(result.status_code, 200, result.data)
            self.assertTrue(mock.call_args.kwargs["reference_answer"])
            return result

    @patch("interviews.views.generate_interview_question", side_effect=AssertionError("No AI question calls allowed"))
    def test_local_selection_uses_resume_and_restores_unanswered_turn(self, generate):
        response = self.client.post(self.route)
        self.assertEqual(response.status_code, 201)
        turn = InterviewQuestion.objects.get(pk=response.data["id"])
        self.assertTrue(turn.bank_id.startswith("pdf45-"))
        self.assertNotIn("reference_answer", response.data)
        self.assertEqual(self.client.post(self.route).data["id"], turn.pk)
        generate.assert_not_called()

    def test_threshold_and_user_isolation_across_twenty_answers(self):
        mastered = set()
        for number in range(20):
            response = self.client.post(self.route)
            self.assertEqual(response.status_code, 201, response.data)
            turn = InterviewQuestion.objects.get(pk=response.data["id"])
            self.answer(turn)
            self.evaluate(turn, 81 if number < 10 else 80)
            if number < 10:
                mastered.add(turn.bank_id)
        self.assertEqual(QuestionProgress.objects.filter(user=self.user, mastered=True).count(), 10)
        self.assertEqual(QuestionProgress.objects.filter(user=self.user, mastered=False).count(), 10)
        summary = self.client.get("/api/interviews/question-bank/progress/?interview_type=technical&difficulty=medium").data
        self.assertEqual((summary["mastered"], summary["revision"], summary["remaining"]), (10, 10, summary["total"] - 10))
        result = self.client.get(f"/api/evaluations/interview/{self.interview.pk}/")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data["summary"]["question_generation_calls_avoided"], 20)
        self.assertEqual(result.data["summary"]["mastered_questions"], 10)
        self.assertEqual(result.data["summary"]["revision_questions"], 10)
        new_session = Interview.objects.create(user=self.user, interview_type="technical", difficulty="medium", duration=20, question_source="local")
        self.assertNotIn(select_question(new_session)["id"], mastered)
        other = User.objects.create_user(username="independent-progress")
        self.client.force_authenticate(other)
        self.assertEqual(self.client.get("/api/interviews/question-bank/progress/").data["mastered"], 0)
        self.assertEqual(self.client.post(self.route).status_code, 404)

    @patch("interviews.views.generate_interview_question")
    def test_answered_local_questions_do_not_repeat_without_waiting_for_evaluation(self, generate):
        self.interview.job_description = "Python backend developer"
        self.interview.save(update_fields=["job_description"])
        ids, texts = set(), set()
        for _ in range(12):
            response = self.client.post(self.route)
            self.assertEqual(response.status_code, 201, response.data)
            self.assertEqual(response.data["source"], "local")
            self.assertNotIn(response.data["id"], ids)
            self.assertNotIn(response.data["question"], texts)
            ids.add(response.data["id"])
            texts.add(response.data["question"])
            turn = InterviewQuestion.objects.get(pk=response.data["id"])
            self.assertEqual(self.answer(turn).status_code, 200)
        generate.assert_not_called()

    def test_evaluation_cache_and_edit_invalidation(self):
        turn = InterviewQuestion.objects.get(pk=self.client.post(self.route).data["id"])
        self.answer(turn)
        self.evaluate(turn, 90)
        with patch("evaluations.views.evaluate_interview_answer") as mock:
            cached = self.client.post(f"/api/evaluations/{turn.pk}/evaluate/")
            self.assertTrue(cached.data["cached"])
            mock.assert_not_called()
        self.answer(turn, "Changed answer")
        self.assertFalse(QuestionProgress.objects.filter(last_question=turn).exists())
        self.evaluate(turn, 70)
        self.assertFalse(QuestionProgress.objects.get(last_question=turn).mastered)

    def test_exhaustion_never_falls_back_to_ai(self):
        entries, _ = bank_index()
        QuestionProgress.objects.bulk_create([QuestionProgress(user=self.user, bank_id=entry["id"], correctness_score=99, mastered=True) for entry, _ in entries])
        with patch("interviews.views.generate_interview_question") as generate:
            result = self.client.post(self.route)
            self.assertEqual(result.status_code, 409)
            self.assertEqual(result.data["code"], "bank_exhausted")
            generate.assert_not_called()

    def test_local_preview_needs_no_resume_or_cloud_call(self):
        with patch("ai_engine.views.generate_interview_question") as generate:
            result = self.client.get(f"/api/ai/question/{self.interview.pk}/")
            self.assertEqual(result.status_code, 200)
            self.assertEqual(result.data["source"], "local")
            generate.assert_not_called()

    def test_create_interview_accepts_local_source_and_rejects_invalid_source(self):
        payload = dict(interview_type="technical", difficulty="medium", duration=20, question_source="local")
        response = self.client.post("/api/interviews/create/", payload)
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["question_source"], "local")
        payload["question_source"] = "unknown"
        self.assertEqual(self.client.post("/api/interviews/create/", payload).status_code, 400)

    def test_skip_changes_question_without_evaluation_and_can_be_revisited(self):
        first = InterviewQuestion.objects.get(pk=self.client.post(self.route).data["id"])
        route = f"/api/interviews/{self.interview.pk}/questions/{first.pk}/skip/"
        self.assertEqual(self.client.post(route).status_code, 200)
        self.assertEqual(self.client.post(route).status_code, 200)
        second = self.client.post(self.route)
        self.assertNotEqual(second.data["id"], first.pk)
        self.assertNotEqual(second.data["question"], first.question)
        self.assertFalse(QuestionProgress.objects.filter(last_question=first).exists())
        self.assertEqual(self.answer(first).status_code, 409)
        other = User.objects.create_user(username="cannot-skip-other-user")
        self.client.force_authenticate(other)
        self.assertEqual(self.client.post(route).status_code, 404)

    def test_completed_or_answered_question_cannot_be_skipped(self):
        turn = InterviewQuestion.objects.get(pk=self.client.post(self.route).data["id"])
        route = f"/api/interviews/{self.interview.pk}/questions/{turn.pk}/skip/"
        self.answer(turn)
        self.assertEqual(self.client.post(route).status_code, 409)
        self.interview.status = "completed"
        self.interview.save(update_fields=["status"])
        self.assertEqual(self.client.post(route).status_code, 400)

    def test_late_evaluation_cannot_replace_newer_progress(self):
        older = InterviewQuestion.objects.get(pk=self.client.post(self.route).data["id"])
        self.answer(older)
        newer = InterviewQuestion.objects.create(interview=self.interview, question_number=2, question=older.question,
            bank_id=older.bank_id, reference_answer=older.reference_answer, rubric=older.rubric, answer="Newer answer")
        self.evaluate(newer, 90)
        self.evaluate(older, 40)
        progress = QuestionProgress.objects.get(user=self.user, bank_id=older.bank_id)
        self.assertTrue(progress.mastered)
        self.assertEqual(progress.last_question_id, newer.pk)

    @override_settings(DEBUG=True)
    def test_failed_evaluation_does_not_grant_mastery(self):
        turn = InterviewQuestion.objects.get(pk=self.client.post(self.route).data["id"])
        self.answer(turn)
        with patch("evaluations.views.evaluate_interview_answer", side_effect=ValueError("Invalid score")):
            self.assertEqual(self.client.post(f"/api/evaluations/{turn.pk}/evaluate/").status_code, 500)
        self.assertFalse(QuestionProgress.objects.filter(user=self.user).exists())

    def test_bank_vectors_are_normalized_and_duplicate_ids_rejected(self):
        entries, _ = bank_index()
        self.assertEqual(len(entries), 123)
        imported = [entry for entry, _ in entries if entry["id"].startswith("pdf45-")]
        self.assertEqual(len(imported), 45)
        self.assertTrue(all(entry["priority"] == 1 and entry["follow_up_questions"] for entry in imported))
        for _, vector in entries:
            self.assertAlmostEqual(sum(value * value for value in vector.values()), 1)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "duplicate.json"
            path.write_text(json.dumps({"schema_version": 1, "questions": [entries[0][0], entries[0][0]]}))
            with override_settings(INTERVIEW_QUESTION_BANK_PATH=path):
                with self.assertRaises(ValueError):
                    bank_index()

    def test_pdf_priority_preserves_mastery_exclusion_and_resume_ranking(self):
        self.interview.candidate_context = "FastAPI Pydantic request validation type annotations"
        self.interview.save(update_fields=["candidate_context"])
        selected = select_question(self.interview)
        self.assertTrue(selected["id"].startswith("pdf45-fastapi-"))
        QuestionProgress.objects.create(user=self.user, bank_id=selected["id"], correctness_score=90, mastered=True)
        self.assertNotEqual(select_question(self.interview)["id"], selected["id"])

    def test_new_sessions_choose_unused_openings_without_waiting_for_grading(self):
        openings = set()
        for _ in range(6):
            session = Interview.objects.create(user=self.user, interview_type="technical",
                difficulty="easy", duration=10, question_source="local")
            response = self.client.post(f"/api/interviews/{session.pk}/questions/")
            self.assertEqual(response.status_code, 201)
            self.assertNotIn(response.data["question"], openings)
            openings.add(response.data["question"])
            # Refreshing still resumes this session's pending turn.
            self.assertEqual(self.client.post(f"/api/interviews/{session.pk}/questions/").data["id"], response.data["id"])

    def test_last_opening_is_avoided_even_when_every_question_was_seen(self):
        entries, _ = bank_index()
        eligible = [entry for entry, _ in entries if entry["interview_type"] == "technical" and entry["difficulty"] == "medium"]
        for number, entry in enumerate(eligible, 1):
            InterviewQuestion.objects.create(interview=self.interview, question_number=number,
                question=entry["question"], bank_id=entry["id"], answer="Attempted")
        session = Interview.objects.create(user=self.user, interview_type="technical",
            difficulty="medium", duration=10, question_source="local", candidate_context=self.interview.candidate_context)
        self.assertNotEqual(select_question(session)["id"], eligible[0]["id"])

    def test_temporary_sqlite_lock_retries_the_entire_transaction(self):
        entry = select_question(self.interview)
        with patch("interviews.views.select_question", side_effect=[OperationalError("database is locked"), entry]), patch("interviews.views.time.sleep"):
            response = self.client.post(self.route)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.interview.questions.count(), 1)

    @override_settings(DEBUG=True)
    def test_persistent_sqlite_lock_returns_retryable_error(self):
        with patch("interviews.views.select_question", side_effect=OperationalError("database is locked")), patch("interviews.views.time.sleep"):
            response = self.client.post(self.route)
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response["Retry-After"], "1")
        self.assertFalse(self.interview.questions.exists())
