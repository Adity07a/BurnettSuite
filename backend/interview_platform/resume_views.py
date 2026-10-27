import logging
from django.db import close_old_connections
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Resume
from .resume_serializers import ResumeSerializer
from .resume_utils import extract_text_from_resume

logger = logging.getLogger(__name__)


def run_async_analysis(resume_id):
    """
    Resume text parse karta hai, Bedrock LLM se analyze karwata hai,
    aur database connection safe banata hai.
    """
    close_old_connections()
    try:
        from ai_engine_app.services import analyze_resume, save_resume_analysis

        resume = Resume.objects.get(id=resume_id)
        if not resume.extracted_text or not resume.extracted_text.strip():
            with resume.file.open("rb") as file:
                resume.extracted_text = extract_text_from_resume(file)
            resume.save(update_fields=["extracted_text"])

        prompt_text = resume.extracted_text.strip()[:3500]
        logger.info("resume_analysis_started resume_id=%s", resume_id)
        analysis_text = analyze_resume(prompt_text, resume_id=resume_id)
        save_resume_analysis(resume, analysis_text)
        logger.info("resume_analysis_completed resume_id=%s", resume_id)
        return True

    except Exception as error:
        logger.error("resume_analysis_failed resume_id=%s error_type=%s", resume_id, type(error).__name__)
        return False
    finally:
        close_old_connections()


class ResumeUploadView(generics.CreateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resume = serializer.save(user=request.user)

        try:
            with resume.file.open("rb") as file:
                resume.extracted_text = extract_text_from_resume(file)
            if not resume.extracted_text.strip():
                raise ValueError("No readable text found. Please upload a text-based PDF or DOCX.")
            resume.save(update_fields=["extracted_text"])
        except Exception as error:
            resume.delete()
            return Response(
                {"error": f"Unable to read the resume: {error}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Upload ke theek baad analysis run hoga taaki dashboard par direct analysis ready mile
        analysis_ok = run_async_analysis(resume.id)

        # Updated analysis data response mein bhej rahe hain
        resume.refresh_from_db()
        data = self.get_serializer(resume).data
        data["analysis_status"] = "completed" if analysis_ok else "failed"
        return Response(data, status=status.HTTP_201_CREATED)


class AnalyzeResumeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        try:
            resume = Resume.objects.get(id=pk, user=request.user)
        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Review button click par trigger hone wala action
        if not run_async_analysis(resume.id):
            return Response(
                {"error": "Unable to analyze the resume. Please retry.", "status": "failed"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "message": "Analysis completed successfully.",
                "status": "completed",
            },
            status=status.HTTP_200_OK,
        )


class LatestResumeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        resume = (
            Resume.objects.filter(user=request.user)
            .select_related("analysis")
            .order_by("-uploaded_at")
            .first()
        )

        if not resume:
            return Response(
                {"error": "No resume uploaded yet."},
                status=status.HTTP_404_NOT_FOUND,
            )

        analysis = getattr(resume, "analysis", None)
        return Response({
            "id": resume.id,
            "file": resume.file.url if resume.file else None,
            "file_name": resume.file.name.split("/")[-1] if resume.file else "Resume",
            "uploaded_at": resume.uploaded_at,
            "has_extracted_text": bool(resume.extracted_text.strip()),
            "analysis": {
                "summary": analysis.summary,
                "skills": analysis.skills,
                "technologies": analysis.technologies,
                "projects": analysis.projects,
                "experience": analysis.experience,
                "education": analysis.education,
                "analyzed_at": analysis.analyzed_at,
            } if analysis else None,
        })
