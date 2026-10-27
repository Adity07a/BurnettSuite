from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework.test import APITestCase
from django.test import SimpleTestCase
from interview_platform.models import CandidateInterviewResume as Resume
from .services import answer_question


class AssistantTests(APITestCase):
    def setUp(self):
        self.client.force_authenticate(User.objects.create_user(username="assistant-user"))

    @patch("interview_assistant_app.views.answer_question", return_value="Use a hash map.")
    def test_typed_or_transcribed_question_returns_text(self, answer):
        response = self.client.post("/api/assistant/answer/", {"question": "How do I find duplicate values?", "history": []}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["answer"], "Use a hash map.")
        self.assertNotIn("audio", response.data)

    @patch("interview_assistant_app.views.answer_question")
    def test_empty_question_is_rejected_without_api_call(self, answer):
        self.assertEqual(self.client.post("/api/assistant/answer/", {"question": "  "}).status_code, 400)
        answer.assert_not_called()

    def test_authentication_is_required(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.post("/api/assistant/answer/", {"question": "Question?"}).status_code, 401)

    @patch("interview_assistant_app.views.answer_question", side_effect=RuntimeError("provider unavailable"))
    @override_settings(DEBUG=True)
    def test_failed_provider_returns_retryable_error(self, answer):
        response = self.client.post("/api/assistant/answer/", {"question": "What is a transaction?"})
        self.assertEqual(response.status_code, 502)
        self.assertIn("request_id", response.data)

    @patch("interview_assistant_app.views.answer_question", return_value="I build Python APIs.")
    def test_latest_resume_is_used_and_other_users_resume_excluded(self, answer):
        user = User.objects.get(username="assistant-user")
        Resume.objects.create(user=user, file="old.pdf", extracted_text="Outdated candidate information")
        Resume.objects.create(user=user, file="latest.pdf", extracted_text="Candidate builds Python APIs")
        other = User.objects.create_user(username="other-candidate")
        Resume.objects.create(user=other, file="other.pdf", extracted_text="Private other candidate information")
        response = self.client.post("/api/assistant/answer/", {"question": "Tell me about yourself"})
        self.assertEqual(response.status_code, 200)
        context = answer.call_args.kwargs["candidate_context"]
        self.assertIn("Candidate builds Python APIs", context)
        self.assertNotIn("Outdated", context)
        self.assertNotIn("Private other", context)

    @patch("interview_assistant_app.views.answer_question", return_value="Remembered answer")
    def test_history_survives_reload_and_more_than_three_exchanges(self, answer):
        for index in range(5):
            self.client.post("/api/assistant/answer/", {"question": f"Question {index}"})
        history = answer.call_args.args[1]
        self.assertEqual(len(history), 8)
        self.assertEqual(history[0]["content"], "Question 0")
        restored = self.client.get("/api/assistant/conversation/")
        self.assertEqual(len(restored.data["messages"]), 10)
        self.client.post("/api/assistant/conversation/")
        self.assertEqual(self.client.get("/api/assistant/conversation/").data["messages"], [])
        self.client.post("/api/assistant/answer/", {"question": "New chat"})
        self.assertEqual(answer.call_args.args[1], [])

    @patch("interview_assistant_app.views.answer_question", return_value="Private answer")
    def test_history_is_owned_by_authenticated_user(self, answer):
        self.client.post("/api/assistant/answer/", {"question": "Private question"})
        self.client.force_authenticate(User.objects.create_user(username="separate-chat"))
        self.assertEqual(self.client.get("/api/assistant/conversation/").data["messages"], [])
        self.client.post("/api/assistant/answer/", {"question": "Other question", "history": []}, format="json")
        self.assertEqual(answer.call_args.args[1], [])

    @patch("interview_assistant_app.views.answer_question", side_effect=["First answer", RuntimeError("failed"), "Retry answer"])
    @override_settings(DEBUG=True)
    def test_failure_does_not_add_partial_turn(self, answer):
        self.client.post("/api/assistant/answer/", {"question": "First"})
        self.client.post("/api/assistant/answer/", {"question": "Follow up"})
        self.assertEqual(len(self.client.get("/api/assistant/conversation/").data["messages"]), 2)
        self.client.post("/api/assistant/answer/", {"question": "Follow up"})
        self.assertEqual(len(answer.call_args.args[1]), 2)


class AssistantPromptTests(SimpleTestCase):
    @override_settings(BEDROCK_ASSISTANT_MODEL_ID="nvidia.nemotron-super-3-120b", BEDROCK_MODEL_ID="zai.glm-4.7-flash")
    @patch("interview_assistant_app.services._bedrock_completion", return_value="An index accelerates lookups.")
    def test_assistant_uses_separate_model(self, completion):
        answer_question("What is an index?", [], "test")
        self.assertEqual(completion.call_args.kwargs["model_id"], "nvidia.nemotron-super-3-120b")

    @patch("interview_assistant_app.services._bedrock_completion", return_value="What tradeoffs did you consider?")
    def test_practice_mode_asks_for_attempt_before_giving_answer(self, completion):
        history = [{"role": "user", "content": "Practice databases"}, {"role": "assistant", "content": "Why PostgreSQL?"}]
        answer_question("For transactions", history, "test", mode="practice")
        messages = completion.call_args.args[0]
        self.assertIn("Do not give the answer before the candidate tries", messages[0]["content"])
        self.assertEqual(messages[2:-1], history)

    @patch("interview_assistant_app.services._bedrock_completion", return_value="Please share your answer.")
    def test_feedback_does_not_score_missing_answer(self, completion):
        answer_question("Review my answer", [], "test", mode="feedback")
        self.assertIn("ask for the missing item", completion.call_args.args[0][0]["content"])

    @patch("interview_assistant_app.services._bedrock_completion", return_value="I am a Python developer.")
    def test_personal_questions_use_first_person_and_resume_reference(self, completion):
        answer_question("Tell me about yourself", [], "test", candidate_context="Python developer with a Django project")
        messages = completion.call_args.args[0]
        self.assertIn("FIRST PERSON AS THE CANDIDATE", messages[0]["content"])
        self.assertIn("Django project", messages[1]["content"])
        self.assertIn("Do not invent", messages[0]["content"])


class ModelSelectionTests(APITestCase):
    def setUp(self):
        self.client.force_authenticate(User.objects.create_user(username="model-selection"))

    @patch("interview_assistant_app.views.answer_question", return_value="Answer")
    def test_switch_model_keeps_history_and_restores_selection(self, answer):
        self.client.post("/api/assistant/answer/", {"question": "First", "model_id": "google.gemma-3-4b-it"})
        response = self.client.post("/api/assistant/answer/", {"question": "Follow up", "model_id": "nvidia.nemotron-super-3-120b", "refine": True})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(answer.call_args.args[1]), 2)
        self.assertTrue(answer.call_args.kwargs["refine"])
        self.assertEqual(self.client.get("/api/assistant/conversation/").data["model_id"], "nvidia.nemotron-super-3-120b")

    @patch("interview_assistant_app.views.answer_question")
    def test_unknown_model_rejected_before_generation(self, answer):
        response = self.client.post("/api/assistant/answer/", {"question": "Hi", "model_id": "unknown"})
        self.assertEqual(response.status_code, 400)
        answer.assert_not_called()

    def test_catalog_requires_authentication(self):
        self.assertEqual(len(self.client.get("/api/ai/models/").data["models"]), 3)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/ai/models/").status_code, 401)


class RefinementTests(SimpleTestCase):
    @patch("interview_assistant_app.services._bedrock_completion", side_effect=["Draft", "Refined answer"])
    def test_refinement_uses_selected_model_and_original_context(self, completion):
        result = answer_question("Explain my project", [], "test", candidate_context="Django project", model_id="google.gemma-3-4b-it", refine=True)
        self.assertEqual(result, "Refined answer")
        self.assertEqual(completion.call_count, 2)
        for call in completion.call_args_list:
            self.assertEqual(call.kwargs["model_id"], "google.gemma-3-4b-it")
            self.assertIn("Django project", call.args[0][1]["content"])
        self.assertEqual(completion.call_args.args[0][-2]["content"], "Draft")
