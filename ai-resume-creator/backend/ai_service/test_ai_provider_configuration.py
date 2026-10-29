import os
from unittest import TestCase
from unittest.mock import patch

from app.core.ai_settings import AISettings
from app.services.llm_service import _strip_markdown_fence


class AISettingsTests(TestCase):
    def test_ollama_defaults_are_local_development_safe(self):
        with patch.dict(os.environ, {}, clear=True):
            settings = AISettings.from_environment()

        self.assertEqual(settings.provider, "ollama")
        self.assertEqual(settings.model, "qwen2.5:3b")
        self.assertEqual(settings.base_url, "http://localhost:11434")

    def test_bedrock_uses_existing_interview_compatibility_variables(self):
        environment = {
            "AI_PROVIDER": "bedrock",
            "AWS_REGION": "ap-south-1",
            "AWS_BEARER_TOKEN_BEDROCK": "test-token",
            "BEDROCK_MODEL_ID": "test-model",
        }
        with patch.dict(os.environ, environment, clear=True):
            settings = AISettings.from_environment()
            settings.validate_for_request()

        self.assertEqual(settings.model, "test-model")
        self.assertEqual(
            settings.base_url,
            "https://bedrock-mantle.ap-south-1.api.aws/v1",
        )
        self.assertEqual(settings.api_key, "test-token")

    def test_bedrock_rejects_missing_credentials_at_request_time(self):
        with patch.dict(os.environ, {"AI_PROVIDER": "bedrock"}, clear=True):
            settings = AISettings.from_environment()
            with self.assertRaisesRegex(RuntimeError, "AI_API_KEY"):
                settings.validate_for_request()


class JSONCleanupTests(TestCase):
    def test_markdown_json_fence_is_removed(self):
        self.assertEqual(
            _strip_markdown_fence('```json\n{"ok": true}\n```'),
            '{"ok": true}',
        )
