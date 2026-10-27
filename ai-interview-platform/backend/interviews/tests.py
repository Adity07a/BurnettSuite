from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework.test import APITestCase
from resumes.models import Resume
from .models import Interview


class InterviewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="candidate", password="Test!Pass947")
        self.client.force_authenticate(self.user)
        self.interview = Interview.objects.create(user=self.user, interview_type="technical", difficulty="medium", duration=10)

    def test_question_answer_and_completion_flow(self):
        prefix = f"/api/interviews/{self.interview.id}/"
        self.assertEqual(self.client.post(prefix + "start/").status_code, 200)
        response = self.client.post(prefix + "questions/", {"question": "How do you test an API?"})
        self.assertEqual(response.status_code, 201, response.data)
        question_id = response.data["id"]
        self.assertEqual(self.client.post(prefix + f"questions/{question_id}/answer/", {"answer": "Integration tests"}).status_code, 200)
        self.assertEqual(self.client.post(prefix + "complete/").status_code, 200)
        self.assertEqual(self.client.post(prefix + "questions/", {"question": "Another?"}).status_code, 400)
        self.assertEqual(self.client.get(f"/api/ai/question/{self.interview.id}/").status_code, 400)

    def test_completed_interview_with_resume_is_rejected(self):
        Resume.objects.create(user=self.user, file="resume.pdf", extracted_text="Resume text")
        self.interview.status = "completed"
        self.interview.save(update_fields=["status"])
        self.assertEqual(self.client.get(f"/api/ai/question/{self.interview.id}/").status_code, 400)

    def test_other_users_cannot_read_interview(self):
        other = User.objects.create_user(username="other")
        self.client.force_authenticate(other)
        self.assertEqual(self.client.get(f"/api/interviews/{self.interview.id}/").status_code, 404)

    def test_nontext_question_is_rejected(self):
        response = self.client.post(f"/api/interviews/{self.interview.id}/questions/", {"question": ["invalid"]}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_both_generation_routes_receive_candidate_answers(self):
        from unittest.mock import patch
        from .models import InterviewQuestion
        InterviewQuestion.objects.create(interview=self.interview, question_number=1, question="Which database?", answer="I chose PostgreSQL for transactions.")
        Resume.objects.create(user=self.user, file="resume.pdf", extracted_text="Python developer")
        expected = [{"role": "assistant", "content": "Which database?"}, {"role": "user", "content": "I chose PostgreSQL for transactions."}]
        for target, route in [("ai_engine.views.generate_interview_question", f"/api/ai/question/{self.interview.id}/"), ("interviews.views.generate_interview_question", f"/api/interviews/{self.interview.id}/questions/")]:
            with patch(target, return_value="How would you debug a slow query?") as generate:
                response = self.client.get(route) if "ai/question" in route else self.client.post(route)
                self.assertIn(response.status_code, [200, 201])
                self.assertEqual(generate.call_args.kwargs["conversation_history"], expected)


    def test_selected_model_and_project_context_are_saved(self):
        from unittest.mock import patch
        Resume.objects.create(user=self.user, file="resume.pdf", extracted_text="Built a Django inventory project")
        response = self.client.post("/api/interviews/create/", {"interview_type": "project", "difficulty": "medium", "duration": 10, "model_id": "google.gemma-3-4b-it"})
        self.assertEqual(response.status_code, 201, response.data)
        interview = Interview.objects.get(pk=response.data["id"])
        Resume.objects.create(user=self.user, file="new.pdf", extracted_text="A different project")
        with patch("ai_engine.views.generate_interview_question", return_value="How did you test your inventory project?") as generate:
            self.assertEqual(self.client.get(f"/api/ai/question/{interview.id}/").status_code, 200)
            self.assertIn("inventory", generate.call_args.args[0])
            self.assertNotIn("different project", generate.call_args.args[0])
            self.assertEqual(generate.call_args.kwargs["model_id"], "google.gemma-3-4b-it")

    def test_unknown_interview_model_is_rejected(self):
        response = self.client.post("/api/interviews/create/", {"interview_type": "technical", "difficulty": "easy", "duration": 10, "model_id": "unknown"})
        self.assertEqual(response.status_code, 400)


    def test_speech_is_authenticated_and_owned(self):
        from unittest.mock import patch
        from .models import InterviewQuestion
        question = InterviewQuestion.objects.create(interview=self.interview, question_number=1, question="Describe your project?")
        route = f"/api/interviews/{self.interview.id}/questions/{question.id}/speech/"
        with patch("interviews.speech.question_audio", return_value=b"mp3-audio") as synthesize:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response["Content-Type"], "audio/mpeg")
            self.assertEqual(response.content, b"mp3-audio")
            synthesize.assert_called_once_with(question.question)
            self.client.force_authenticate(User.objects.create_user(username="other-voice"))
            self.assertEqual(self.client.get(route).status_code, 404)
            self.assertEqual(synthesize.call_count, 1)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(route).status_code, 401)

    @override_settings(DEBUG=True)
    def test_speech_failure_returns_retryable_error(self):
        from unittest.mock import patch
        from .models import InterviewQuestion
        question = InterviewQuestion.objects.create(interview=self.interview, question_number=1, question="Describe your project?")
        with patch("interviews.speech.question_audio", side_effect=TimeoutError):
            response = self.client.get(f"/api/interviews/{self.interview.id}/questions/{question.id}/speech/")
            self.assertEqual(response.status_code, 504)
            self.assertEqual(response.data["code"], "voice_timeout")

    @override_settings(DEBUG=True)
    def test_speech_dependency_and_provider_failures_are_distinguished(self):
        from unittest.mock import patch
        from .models import InterviewQuestion
        question = InterviewQuestion.objects.create(interview=self.interview, question_number=1, question="Describe your project?")
        for error, http_status, code in [(ImportError("missing"), 503, "voice_dependency_missing"), (ValueError("no audio"), 502, "voice_provider_error")]:
            with patch("interviews.speech.question_audio", side_effect=error):
                response = self.client.get(f"/api/interviews/{self.interview.id}/questions/{question.id}/speech/")
                self.assertEqual(response.status_code, http_status)
                self.assertEqual(response.data["code"], code)
