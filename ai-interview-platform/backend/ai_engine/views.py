import logging
import uuid

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.db import transaction
from interviews.models import Interview
from resumes.models import Resume
from interview_assistant.services import build_candidate_context

from .services import generate_interview_question, interview_conversation

logger = logging.getLogger(__name__)


class ModelCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .model_catalog import MODEL_CHOICES, assistant_default_model, interview_default_model
        return Response({"models": [{"id": key, "name": name} for key, name in MODEL_CHOICES],
                         "assistant_default": assistant_default_model(), "interview_default": interview_default_model()})


class GenerateInterviewQuestionView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, interview_id):
        generation_id = uuid.uuid4().hex
        logger.info("question_request_started generation_id=%s interview_id=%s", generation_id, interview_id)

        try:
            # Get interview belonging to logged-in user
            interview = Interview.objects.get(
                id=interview_id,
                user=request.user
            )

            if interview.status == "completed":
                return Response({"error": "This interview is already completed."}, status=status.HTTP_400_BAD_REQUEST)

            if interview.question_source == "local":
                from interviews.question_bank import select_question
                entry = select_question(interview)
                if not entry:
                    return Response({"error": "No remaining local questions.", "code": "bank_exhausted"}, status=409)
                return Response({"interview_id": interview.id, "question": entry["question"], "source": "local"})

            # Get latest uploaded resume
            resume = Resume.objects.filter(
                user=request.user
            ).order_by("-uploaded_at").first()

            # Check resume exists
            if not resume:
                return Response(
                    {
                        "error": "No resume found. Please upload a resume first."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check extracted text
            if not resume.extracted_text:
                return Response(
                    {
                        "error": "Resume text has not been extracted yet."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get questions already asked
            previous_questions = list(dict.fromkeys((interview.asked_questions or []) + list(interview.questions.values_list("question", flat=True))))

            # Generate a new AI question
            question = generate_interview_question(
                interview.candidate_context or build_candidate_context(resume),
                interview.interview_type,
                interview.difficulty,
                previous_questions,
                interview_id=interview_id,
                generation_id=generation_id,
                conversation_history=interview_conversation(interview),
                model_id=interview.model_id,
            )

            from .services import questions_are_similar
            with transaction.atomic():
                locked = Interview.objects.select_for_update().get(id=interview_id, user=request.user)
                if locked.status == "completed":
                    return Response({"error": "This interview is already completed."}, status=status.HTTP_400_BAD_REQUEST)
                history = list(dict.fromkeys((locked.asked_questions or []) + list(locked.questions.values_list("question", flat=True))))
                if questions_are_similar(question, history):
                    return Response({"error": "A similar question was already generated. Please retry."}, status=status.HTTP_409_CONFLICT)
                history.append(question)
                locked.asked_questions = history
                locked.save(update_fields=["asked_questions"])
            previous_questions = history

            logger.info("question_request_completed generation_id=%s interview_id=%s question_number=%s", generation_id, interview_id, len(previous_questions))
            return Response(
                {
                    "interview_id": interview.id,
                    "question": question,
                    "interview_type": interview.interview_type,
                    "difficulty": interview.difficulty,
                "model_id": interview.model_id,
                    "generation_id": generation_id,
                },
                status=status.HTTP_200_OK
            )

        except Interview.DoesNotExist:

            return Response(
                {
                    "error": "Interview not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:

            logger.error("question_request_failed generation_id=%s interview_id=%s error_type=%s", generation_id, interview_id, type(e).__name__)

            return Response(
                {
                    "error": "Unable to generate interview question.",
                    "generation_id": generation_id
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
