import logging
import hashlib
import json
import re
from django.db import transaction
from django.contrib.auth import get_user_model
from django.db.models import Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.permissions import IsAdminUser

from interviews.models import InterviewQuestion, Interview, QuestionProgress
from .models import Evaluation
from .services import evaluate_interview_answer

logger = logging.getLogger(__name__)


def clean_stt_technical_terms(text):
    """
    Sanitize STT speech mishearings before evaluation
    so candidates are never penalized for speech recognition errors.
    """
    if not text:
        return ""

    replacements = [
        (r"\b(jungle|jan go|jangoo|jango|jingo|d jungle|jan google)\b", "Django"),
        (r"\b(pie thon|pie than|py thon|pi thon|paithan)\b", "Python"),
        (r"\b(seq uel|es que el|c quel|sequel)\b", "SQL"),
        (r"\b(no sequel|no c quel|no secquel)\b", "NoSQL"),
        (r"\b(post grass|post gres|postgres sql|post gray sql|post grey)\b", "PostgreSQL"),
        (r"\b(my sequel|my c quel|mai sequel)\b", "MySQL"),
        (r"\b(mongo db|mongo d b)\b", "MongoDB"),
        (r"\b(red is|redist)\b", "Redis"),
        (r"\b(sqlite 3|cqlite)\b", "SQLite"),
        (r"\b(fast a p i|fast api)\b", "FastAPI"),
        (r"\b(cell ery|salari|celeri)\b", "Celery"),
        (r"\b(rabbit m q|rabbit em queue|rabbit mq)\b", "RabbitMQ"),
        (r"\b(doc er|dock er|dakar)\b", "Docker"),
        (r"\b(kubernets|cooper netes|cuber netes|koobernetes)\b", "Kubernetes"),
        (r"\b(micro services|micro service)\b", "microservices"),
        (r"\b(git hub|get hub)\b", "GitHub"),
        (r"\b(a p i|apis)\b", "API"),
        (r"\b(re act|react js)\b", "React"),
    ]

    cleaned = text
    for pattern, repl in replacements:
        cleaned = re.sub(pattern, repl, cleaned, flags=re.IGNORECASE)
    return cleaned


class EvaluateInterviewQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, question_id):
        try:
            # Get the question and make sure it belongs to the
            # currently logged-in user's interview.
            interview_question = InterviewQuestion.objects.get(
                id=question_id,
                interview__user=request.user
            )

        except InterviewQuestion.DoesNotExist:
            return Response(
                {"error": "Interview question not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Don't evaluate an unanswered question.
        raw_answer = interview_question.answer.strip()
        if not raw_answer:
            return Response(
                {"error": "This question has no answer yet."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Sanitize STT answer
        sanitized_answer = clean_stt_technical_terms(raw_answer)

        interview = interview_question.interview

        try:
            fingerprint = hashlib.sha256(json.dumps({
                "question": interview_question.question, "answer": sanitized_answer,
                "model": interview.model_id, "reference": interview_question.reference_answer,
                "rubric": interview_question.rubric, "type": interview.interview_type,
                "difficulty": interview.difficulty,
            }, sort_keys=True).encode()).hexdigest()
            cached = Evaluation.objects.filter(question=interview_question, answer_fingerprint=fingerprint).first()
            if cached:
                return Response(self.evaluation_data(cached, interview_question, cached=True))

            # STT Guardrail Instruction for evaluation rubric
            stt_guardrail = (
                "NOTE: Candidate answer was captured using real-time browser Speech-to-Text (STT). "
                "Intelligently infer intended technical vocabulary (e.g., 'Django', 'SQL', 'Celery', 'Redis', 'Python') "
                "from context and strictly DO NOT deduct scores or penalize for phonetic transcription errors."
            )
            custom_rubric = (
                f"{interview_question.rubric}\n\n{stt_guardrail}"
                if interview_question.rubric
                else stt_guardrail
            )

            # Send question + answer to the configured Bedrock model
            result = evaluate_interview_answer(
                question=interview_question.question,
                answer=sanitized_answer,
                interview_type=interview.interview_type,
                difficulty=interview.difficulty,
                question_id=question_id,
                model_id=interview.model_id,
                reference_answer=interview_question.reference_answer,
                rubric=custom_rubric,
            )

            # Save evaluation in database
            with transaction.atomic():
                current = InterviewQuestion.objects.select_for_update().get(pk=question_id)
                if current.answer != interview_question.answer:
                    return Response({"error": "Answer changed during evaluation. Please retry."}, status=409)

                evaluation, created = Evaluation.objects.update_or_create(
                    question=interview_question,
                    defaults={
                        "answer_fingerprint": fingerprint,
                        "overall_score": result.get("overall_score", 0),
                        "technical_score": result.get("technical_score", 0),
                        "communication_score": result.get("communication_score", 0),
                        "relevance_score": result.get("relevance_score", 0),
                        "correctness_score": result.get("correctness_score", 0),
                        "strengths": result.get("strengths", []),
                        "weaknesses": result.get("weaknesses", []),
                        "feedback": result.get("feedback", ""),
                        "improved_answer": result.get("improved_answer", ""),
                    }
                )
                if interview_question.bank_id:
                    get_user_model().objects.select_for_update().get(pk=request.user.pk)
                    previous = QuestionProgress.objects.filter(user=request.user, bank_id=interview_question.bank_id).select_related("last_question").first()
                    if not previous or not previous.last_question or previous.last_question.asked_at <= interview_question.asked_at:
                        QuestionProgress.objects.update_or_create(
                            user=request.user, bank_id=interview_question.bank_id,
                            defaults={"correctness_score": evaluation.correctness_score,
                                      "mastered": evaluation.correctness_score > 80,
                                      "last_question": interview_question}
                        )

            return Response(self.evaluation_data(evaluation, interview_question, cached=False))

        except Exception as error:
            logger.error("evaluation_failed question_id=%s error_type=%s", question_id, type(error).__name__)

            return Response(
                {"error": "Unable to evaluate the interview answer."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @staticmethod
    def evaluation_data(evaluation, question, *, cached):
        data = {key: getattr(evaluation, key) for key in (
            "id", "overall_score", "technical_score", "communication_score", "relevance_score",
            "correctness_score", "strengths", "weaknesses", "feedback", "improved_answer", "evaluated_at")}
        data.update(question_id=question.id, question_number=question.question_number, cached=cached,
                    practice_status=("mastered" if evaluation.correctness_score > 80 else "revision") if question.bank_id else None)
        return data


class InterviewEvaluationSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, interview_id):
        try:
            interview = Interview.objects.get(
                id=interview_id,
                user=request.user
            )

        except Interview.DoesNotExist:
            return Response(
                {"error": "Interview not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        questions = (
            InterviewQuestion.objects
            .filter(interview=interview)
            .select_related("evaluation")
            .order_by("question_number")
        )

        question_results = []
        evaluated_scores = []

        for question in questions:
            evaluation_data = None
            try:
                evaluation = question.evaluation
                evaluation_data = {
                    "id": evaluation.id,
                    "overall_score": evaluation.overall_score,
                    "technical_score": evaluation.technical_score,
                    "communication_score": evaluation.communication_score,
                    "relevance_score": evaluation.relevance_score,
                    "correctness_score": evaluation.correctness_score,
                    "strengths": evaluation.strengths,
                    "weaknesses": evaluation.weaknesses,
                    "feedback": evaluation.feedback,
                    "improved_answer": evaluation.improved_answer,
                    "evaluated_at": evaluation.evaluated_at,
                }
                evaluated_scores.append(evaluation)
            except Evaluation.DoesNotExist:
                evaluation_data = None

            question_results.append({
                "id": question.id,
                "question_number": question.question_number,
                "question": question.question,
                "answer": question.answer,
                "asked_at": question.asked_at,
                "answered_at": question.answered_at,
                "skipped_at": question.skipped_at,
                "evaluation": evaluation_data,
                "source": "local" if question.bank_id else "ai",
                "practice_status": ("mastered" if evaluation.correctness_score > 80 else "revision") if question.bank_id and evaluation_data else None,
            })

        evaluation_count = len(evaluated_scores)

        if evaluation_count > 0:
            overall_score = round(sum(e.overall_score for e in evaluated_scores) / evaluation_count, 2)
            technical_score = round(sum(e.technical_score for e in evaluated_scores) / evaluation_count, 2)
            communication_score = round(sum(e.communication_score for e in evaluated_scores) / evaluation_count, 2)
            relevance_score = round(sum(e.relevance_score for e in evaluated_scores) / evaluation_count, 2)
            correctness_score = round(sum(e.correctness_score for e in evaluated_scores) / evaluation_count, 2)
        else:
            overall_score = 0
            technical_score = 0
            communication_score = 0
            relevance_score = 0
            correctness_score = 0

        return Response({
            "interview": {
                "id": interview.id,
                "interview_type": interview.interview_type,
                "difficulty": interview.difficulty,
                "model_id": interview.model_id,
                "question_source": interview.question_source,
                "duration": interview.duration,
                "status": interview.status,
                "created_at": interview.created_at,
                "started_at": interview.started_at,
                "completed_at": interview.completed_at,
            },
            "summary": {
                "total_questions": questions.count(),
                "answered_questions": questions.exclude(answer="").count(),
                "evaluated_questions": evaluation_count,
                "local_questions": questions.exclude(bank_id="").count(),
                "question_generation_calls_avoided": questions.exclude(bank_id="").count(),
                "mastered_questions": sum(e.correctness_score > 80 and bool(e.question.bank_id) for e in evaluated_scores),
                "revision_questions": sum(e.correctness_score <= 80 and bool(e.question.bank_id) for e in evaluated_scores),
                "overall_score": overall_score,
                "technical_score": technical_score,
                "communication_score": communication_score,
                "relevance_score": relevance_score,
                "correctness_score": correctness_score,
            },
            "questions": question_results,
        })


class AdminCandidatesOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        User = get_user_model()
        users = User.objects.filter(interviews__isnull=False).distinct()
        data = []
        for u in users:
            interviews = Interview.objects.filter(user=u).order_by("-created_at")
            interview_list = []
            for item in interviews:
                questions = InterviewQuestion.objects.filter(interview=item).order_by("question_number")
                q_list = []
                for q in questions:
                    eval_data = None
                    if hasattr(q, "evaluation"):
                        ev = q.evaluation
                        eval_data = {
                            "overall_score": ev.overall_score,
                            "technical_score": ev.technical_score,
                            "communication_score": ev.communication_score,
                            "relevance_score": ev.relevance_score,
                            "correctness_score": ev.correctness_score,
                            "feedback": ev.feedback,
                            "improved_answer": ev.improved_answer,
                            "strengths": ev.strengths,
                            "weaknesses": ev.weaknesses,
                        }
                    q_list.append({
                        "id": q.id,
                        "question_number": q.question_number,
                        "question": q.question,
                        "answer": q.answer,
                        "answered_at": q.answered_at,
                        "evaluation": eval_data,
                    })
                interview_list.append({
                    "id": item.id,
                    "interview_type": item.interview_type,
                    "difficulty": item.difficulty,
                    "duration": item.duration,
                    "status": item.status,
                    "created_at": item.created_at,
                    "questions": q_list,
                })
            data.append({
                "id": u.id,
                "email": u.email,
                "full_name": u.get_full_name() or u.email,
                "is_active": u.is_active,
                "interviews": interview_list,
            })
        return Response(data)
