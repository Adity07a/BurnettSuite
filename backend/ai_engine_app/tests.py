from types import SimpleNamespace
from unittest.mock import patch

from django.test import SimpleTestCase, override_settings
from django.urls import resolve

from .services import analyze_resume, generate_interview_question


@override_settings(AWS_BEARER_TOKEN_BEDROCK="test-key", AWS_REGION="us-east-1", BEDROCK_MODEL_ID="zai.glm-4.7-flash", BEDROCK_BASE_URL="https://bedrock-mantle.us-east-1.api.aws/v1")
class QuestionGenerationTests(SimpleTestCase):
    def completion(self, content):
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content), finish_reason="stop")], _request_id="provider-123")

    def setup_client(self, client):
        client.return_value.__enter__.return_value = client.return_value
        return client.return_value.chat.completions.create

    @patch("ai_engine.services.OpenAI")
    def test_question_uses_configured_bedrock_model_and_logs_success(self, client):
        call = self.setup_client(client)
        call.return_value = self.completion('"How do you test an API?"')
        with self.assertLogs("ai_engine.services", level="INFO") as logs:
            question = generate_interview_question("private resume", "technical", "easy", interview_id=7, generation_id="test-generation")
        self.assertEqual(question, "How do you test an API?")
        self.assertEqual(call.call_count, 1)
        self.assertEqual(call.call_args.kwargs["model"], "zai.glm-4.7-flash")
        self.assertEqual(client.call_args.kwargs["base_url"], "https://bedrock-mantle.us-east-1.api.aws/v1")
        self.assertEqual(client.call_args.kwargs["api_key"], "test-key")
        self.assertEqual(client.call_args.kwargs["max_retries"], 0)
        output = "\n".join(logs.output)
        for expected in ("provider=aws_bedrock", "question_generation_succeeded", "generation_id=test-generation", "interview_id=7", "provider-123", "elapsed_ms="):
            self.assertIn(expected, output)
        self.assertNotIn("private resume", output)
        self.assertNotIn("test-key", output)

    @patch("ai_engine.services.OpenAI")
    def test_resume_uses_same_model(self, client):
        call = self.setup_client(client)
        call.return_value = self.completion('```json\n{"summary": "Python developer", "skills": ["Python"]}\n```')
        with self.assertLogs("ai_engine.services", level="INFO") as logs:
            result = analyze_resume("private resume", resume_id=4)
        self.assertIn('"Python"', result)
        self.assertEqual(call.call_args.kwargs["model"], "zai.glm-4.7-flash")
        self.assertIn("resume_id=4", "\n".join(logs.output))

    @patch("ai_engine.services.OpenAI")
    def test_failure_is_logged_without_free_model_fallback(self, client):
        call = self.setup_client(client)
        call.side_effect = TimeoutError("timeout")
        with self.assertLogs("ai_engine.services", level="ERROR") as logs:
            with self.assertRaises(TimeoutError):
                generate_interview_question("", "technical", "easy")
        self.assertEqual(call.call_count, 1)
        self.assertIn("error_type=TimeoutError", "\n".join(logs.output))

    @patch("ai_engine.services.OpenAI")
    def test_empty_response_is_failure(self, client):
        call = self.setup_client(client)
        call.return_value = self.completion("")
        with self.assertLogs("ai_engine.services", level="ERROR"):
            with self.assertRaises(ValueError):
                generate_interview_question("", "technical", "easy")
        self.assertEqual(call.call_count, 1)

    @override_settings(AWS_BEARER_TOKEN_BEDROCK="")
    @patch("ai_engine.services.OpenAI")
    def test_missing_bedrock_key_does_not_call_provider(self, client):
        with self.assertLogs("ai_engine.services", level="ERROR"):
            with self.assertRaisesRegex(RuntimeError, "AWS_BEARER_TOKEN_BEDROCK"):
                analyze_resume("resume")
        client.assert_not_called()

    def test_canonical_auth_routes_and_legacy_registration(self):
        for path, name in (("/api/users/register/", "register"), ("/api/users/login/", "login"), ("/api/users/token/refresh/", "token-refresh"), ("/users/register/", "register")):
            self.assertEqual(resolve(path).url_name, name)

    @patch("ai_engine.services._bedrock_completion")
    def test_duplicate_question_is_retried_with_new_topic(self, call):
        previous = "How do you test an API?"
        call.side_effect = [previous, "How would you investigate a slow database query?"]
        result = generate_interview_question("Python developer", "technical", "easy", [previous])
        self.assertNotEqual(result, previous)
        self.assertEqual(call.call_count, 2)
        prompt = call.call_args.args[0][1]["content"]
        self.assertIn("Required focus: debugging", prompt)
        self.assertEqual(call.call_args.kwargs["max_tokens"], 256)

    @patch("ai_engine.services._bedrock_completion")
    def test_repeated_duplicate_is_never_returned(self, call):
        call.return_value = "How do you test an API?"
        with self.assertRaises(ValueError):
            generate_interview_question("", "technical", "easy", [call.return_value])
        self.assertEqual(call.call_count, 2)

    @patch("ai_engine.services._bedrock_completion")
    def test_question_keeps_scenario_and_removes_extra_question(self, call):
        call.return_value = '**Your API returns a 500 error. How would you debug it? Which tool would you use?**'
        result = generate_interview_question("", "technical", "easy")
        self.assertEqual(result, "Your API returns a 500 error. How would you debug it?")
        self.assertEqual(call.call_count, 1)


class GemmaMessageTests(SimpleTestCase):
    def test_system_context_and_adjacent_turns_are_preserved(self):
        from .services import _model_messages
        messages = [{"role": "system", "content": "Instructions"}, {"role": "system", "content": "Resume projects"}, {"role": "assistant", "content": "Which database?"}, {"role": "user", "content": "PostgreSQL"}, {"role": "user", "content": "Ask next question"}]
        result = _model_messages(messages, "google.gemma-3-4b-it")
        self.assertEqual([m["role"] for m in result], ["user", "assistant", "user"])
        self.assertIn("Resume projects", result[0]["content"])
        self.assertIn("PostgreSQL", result[-1]["content"])
        self.assertIn("Ask next question", result[-1]["content"])
        self.assertEqual(len(messages), 5)
        self.assertEqual(_model_messages(messages, "zai.glm-4.7-flash"), messages)
