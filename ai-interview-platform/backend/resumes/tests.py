from unittest.mock import patch
from types import SimpleNamespace
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from .serializers import ResumeSerializer
from .views import AnalyzeResumeView, run_async_analysis


class ResumeTests(SimpleTestCase):
    def test_unsupported_upload_rejected(self):
        serializer = ResumeSerializer(data={"file": SimpleUploadedFile("resume.exe", b"invalid")})
        self.assertFalse(serializer.is_valid())
        self.assertIn("file", serializer.errors)

    @patch("resumes.views.Resume.objects.get")
    @patch("ai_engine.services.analyze_resume", side_effect=RuntimeError("provider failed"))
    @patch("resumes.views.close_old_connections")
    def test_provider_failure_is_not_success(self, connections, analyze, get_resume):
        get_resume.return_value.extracted_text = "Resume text"
        with self.assertLogs("resumes", level="ERROR"):
            self.assertFalse(run_async_analysis(1))

    @patch("resumes.views.run_async_analysis", return_value=False)
    @patch("resumes.views.Resume.objects.get")
    def test_retry_returns_failure_status(self, get_resume, analyze):
        request = APIRequestFactory().post("/api/resumes/1/analyze/")
        force_authenticate(request, user=SimpleNamespace(is_authenticated=True))
        response = AnalyzeResumeView.as_view()(request, pk=1)
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.data["status"], "failed")
