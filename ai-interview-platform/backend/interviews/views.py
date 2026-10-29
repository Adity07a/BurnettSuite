import logging
import random
import time
import uuid

from django.db import OperationalError, connection, transaction
from django.db.models import Avg, F, Max
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai_engine.services import generate_interview_question, interview_conversation
from interview_assistant.services import build_candidate_context
from resumes.models import Resume

from .models import Interview, InterviewQuestion, QuestionBank
from .question_bank import progress_summary, select_question
from .serializers import InterviewSerializer, QuestionBankSerializer

logger = logging.getLogger(__name__)


class QuestionBankProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        kind, difficulty = request.query_params.get("interview_type"), request.query_params.get("difficulty")
        if (
            kind
            and kind not in dict(Interview.INTERVIEW_TYPES)
            or difficulty
            and difficulty not in dict(Interview.DIFFICULTY_LEVELS)
        ):
            return Response({"error": "Invalid interview type or difficulty."}, status=400)
        return Response(progress_summary(request.user, kind, difficulty))


class InterviewQuestionSpeechView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, interview_id, question_id):
        from django.http import HttpResponse

        from .speech import question_audio

        try:
            question = InterviewQuestion.objects.get(
                pk=question_id, interview_id=interview_id, interview__user=request.user
            )
        except InterviewQuestion.DoesNotExist:
            return Response({"error": "Question not found."}, status=404)
        try:
            response = HttpResponse(question_audio(question.question), content_type="audio/mpeg")
            response["Cache-Control"] = "private, no-store"
            return response
        except Exception as error:
            if isinstance(error, ImportError):
                code, message, http_status = (
                    "voice_dependency_missing",
                    "Server speech dependencies are missing. Install backend requirements and restart the backend.",
                    503,
                )
            elif isinstance(error, TimeoutError):
                code, message, http_status = (
                    "voice_timeout",
                    "Swara provider timed out. Please retry audio playback.",
                    504,
                )
            else:
                code, message, http_status = (
                    "voice_provider_error",
                    "Server could not generate Swara audio. Check server connectivity to the speech provider.",
                    502,
                )
            logger.warning(
                "interview_speech_failed question_id=%s code=%s error_type=%s provider_status=%s",
                question_id,
                code,
                type(error).__name__,
                getattr(error, "status", None),
            )
            return Response({"error": message, "code": code}, status=http_status)


class InterviewCreateView(generics.CreateAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        resume = (
            Resume.objects.filter(user=self.request.user)
            .select_related("analysis")
            .order_by("-uploaded_at", "-id")
            .first()
        )
        base_resume_context = build_candidate_context(resume) if resume else ""
        
        jd_text = self.request.data.get("job_description", "")
        if isinstance(jd_text, str):
            jd_text = jd_text.strip()
        else:
            jd_text = ""

        if jd_text and base_resume_context:
            combined_context = f"{base_resume_context}\n\nTarget Role Job Description (JD):\n{jd_text}"
        elif jd_text:
            combined_context = f"Target Role Job Description (JD):\n{jd_text}"
        else:
            combined_context = base_resume_context

        serializer.save(
            user=self.request.user,
            candidate_context=combined_context,
            job_description=jd_text
        )


class InterviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviews = Interview.objects.filter(user=request.user).order_by("-created_at")
        data = []
        for interview in interviews:
            evaluations = [
                q.evaluation
                for q in interview.questions.select_related("evaluation").all()
                if hasattr(q, "evaluation")
            ]
            score = round(sum(e.overall_score for e in evaluations) / len(evaluations), 1) if evaluations else None
            data.append({
                "id": interview.id,
                "interview_type": interview.interview_type,
                "difficulty": interview.difficulty,
                "model_id": interview.model_id,
                "question_source": interview.question_source,
                "duration": interview.duration,
                "status": interview.status,
                "created_at": interview.created_at,
                "completed_at": interview.completed_at,
                "question_count": interview.questions.count(),
                "score": score,
            })
        return Response(data)


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviews = Interview.objects.filter(user=request.user)
        completed = interviews.filter(status="completed")

        from evaluations.models import Evaluation

        evaluations = Evaluation.objects.filter(question__interview__user=request.user)
        average = evaluations.aggregate(value=Avg("overall_score"))["value"]
        best = evaluations.aggregate(value=Max("overall_score"))["value"]

        return Response({
            "total_interviews": interviews.count(),
            "completed_interviews": completed.count(),
            "average_score": round(average, 1) if average is not None else 0,
            "best_score": round(best, 1) if best is not None else 0,
            "resume_uploaded": request.user.resumes.exists(),
            "recent_interviews": list(
                interviews.order_by("-created_at")[:5].values(
                    "id", "interview_type", "difficulty", "duration", "status", "created_at", "completed_at"
                )
            ),
        })


class InterviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
            return Response({
                "id": interview.id,
                "interview_type": interview.interview_type,
                "difficulty": interview.difficulty,
                "model_id": interview.model_id,
                "duration": interview.duration,
                "status": interview.status,
                "created_at": interview.created_at,
                "started_at": interview.started_at,
                "completed_at": interview.completed_at,
                "question_source": interview.question_source,
            })
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found."}, status=status.HTTP_404_NOT_FOUND)


class InterviewStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
            if interview.status == "pending":
                interview.status = "in_progress"
                interview.started_at = timezone.now()
                interview.save(update_fields=["status", "started_at"])
            return Response({"id": interview.id, "status": interview.status, "started_at": interview.started_at})
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found."}, status=status.HTTP_404_NOT_FOUND)


class InterviewCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
            if interview.status != "completed":
                interview.status = "completed"
                interview.completed_at = timezone.now()
                interview.save(update_fields=["status", "completed_at"])
            return Response({"id": interview.id, "status": interview.status, "completed_at": interview.completed_at})
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found."}, status=status.HTTP_404_NOT_FOUND)


class InterviewQuestionCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def _local_question(self, request, interview_id):
        for attempt in range(4):
            try:
                with transaction.atomic():
                    if connection.vendor == "sqlite":
                        Interview.objects.filter(id=interview_id, user=request.user).update(question_source=F("question_source"))
                    interview = Interview.objects.select_for_update().get(id=interview_id, user=request.user)
                    if interview.status == "completed":
                        return Response({"error": "This interview is already completed."}, status=400)
                    
                    unanswered_turn = interview.questions.filter(answer="", skipped_at__isnull=True).order_by("-question_number").first()
                    is_easy_or_short = (str(interview.difficulty).lower() == "easy") or (interview.duration and interview.duration <= 10)

                    if unanswered_turn:
                        q_num = unanswered_turn.question_number
                    else:
                        q_num = (interview.questions.aggregate(value=Max("question_number"))["value"] or 0) + 1

                    is_coding_turn = ((q_num % 4) == 3) and not is_easy_or_short
                    default_starter = "# Write your solution in Python 3\n\ndef solution():\n    pass\n"

                    if unanswered_turn:
                        return Response({
                            "id": unanswered_turn.pk,
                            "interview_id": interview.pk,
                            "question_number": unanswered_turn.question_number,
                            "question": unanswered_turn.question,
                            "answer": unanswered_turn.answer,
                            "source": "local",
                            "question_type": "coding" if is_coding_turn else "conceptual",
                            "starter_code": default_starter if is_coding_turn else "",
                        }, status=200)

                    q_text = ""
                    ref_answer = ""
                    rubric = ""

                    if is_coding_turn:
                        coding_problems = [
                            ("Write a Python function to check if a string is a palindrome.\n\nInput: 'racecar'\nOutput: True\nInput: 'hello'\nOutput: False", "def is_palindrome(s: str) -> bool:\n    pass\n"),
                            ("Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.\n\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]", "def two_sum(nums, target):\n    pass\n"),
                            ("Write a Python function to find the first non-repeating character in a string.\n\nInput: 'swiss'\nOutput: 'w'", "def first_unique_char(s: str) -> str:\n    pass\n"),
                            ("Given a list of integers, write a function to return only the even numbers in sorted order.\n\nInput: [5, 2, 8, 1, 4]\nOutput: [2, 4, 8]", "def filter_even_sorted(nums):\n    pass\n"),
                        ]
                        sel = random.choice(coding_problems)
                        q_text = sel[0]
                        st_code = sel[1]
                        q_type = "coding"
                    else:
                        entry = select_question(interview)
                        if not entry:
                            return Response({"error": "No remaining local questions. Start a new practice session.", "code": "bank_exhausted"}, status=409)
                        q_text = entry["question"]
                        ref_answer = entry.get("reference_answer", "")
                        rubric = entry.get("rubric", "")
                        st_code = ""
                        q_type = "conceptual"

                    turn = InterviewQuestion.objects.create(
                        interview=interview,
                        question_number=q_num,
                        question=q_text,
                        reference_answer=ref_answer,
                        rubric=rubric,
                    )

                    return Response({
                        "id": turn.pk,
                        "interview_id": interview.pk,
                        "question_number": turn.question_number,
                        "question": turn.question,
                        "answer": turn.answer,
                        "source": "local",
                        "question_type": q_type,
                        "starter_code": st_code,
                    }, status=201)

            except OperationalError as error:
                if connection.vendor != "sqlite" or "locked" not in str(error).lower():
                    raise
                if attempt == 3:
                    return Response({"error": "The database is busy. Please retry shortly."}, status=503, headers={"Retry-After": "1"})
                time.sleep(0.05 * 2 ** attempt)

    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
            if interview.status == "completed":
                return Response({"error": "This interview is already completed."}, status=status.HTTP_400_BAD_REQUEST)

            if interview.question_source == "local":
                return self._local_question(request, interview_id)

            is_easy_or_short = (str(interview.difficulty).lower() == "easy") or (interview.duration and interview.duration <= 10)

            unanswered_turn = interview.questions.filter(answer="", skipped_at__isnull=True).order_by("-question_number").first()

            if unanswered_turn:
                target_q_num = unanswered_turn.question_number
            else:
                current_count = interview.questions.count()
                target_q_num = current_count + 1

            slot = target_q_num % 4
            if is_easy_or_short and slot == 3:
                slot = 0

            is_coding_turn = (slot == 3 and not is_easy_or_short)
            default_starter = "# Write your solution in Python 3\n\ndef solution():\n    pass\n"

            if unanswered_turn:
                return Response({
                    "id": unanswered_turn.id,
                    "interview_id": interview.id,
                    "question_number": unanswered_turn.question_number,
                    "question": unanswered_turn.question,
                    "question_type": "coding" if is_coding_turn else "conceptual",
                    "starter_code": default_starter if is_coding_turn else "",
                    "answer": unanswered_turn.answer,
                }, status=status.HTTP_200_OK)

            question_text = ""
            starter_code = default_starter if is_coding_turn else ""

            has_jd = bool(interview.job_description and interview.job_description.strip())
            has_resume = bool(interview.candidate_context and interview.candidate_context.strip())

            if is_coding_turn:
                strategy_instruction = (
                    "CRITICAL DIRECTIVE: THIS IS A STRICT LIVE CODING PROBLEM ROUND.\n"
                    "YOU MUST GENERATE A REAL PYTHON CODING CHALLENGE (DATA STRUCTURES, ALGORITHMS, STRINGS, ARRAYS, OR LOGIC).\n"
                    "DO NOT ASK THEORETICAL, ARCHITECTURAL, SYSTEM DESIGN, OR 'HOW WOULD YOU HANDLE' QUESTIONS.\n"
                    "The output MUST be a programming problem requiring the candidate to implement a Python function.\n"
                    "REQUIRED FORMAT:\n"
                    "1. Problem statement (e.g. Write a function to...)\n"
                    "2. Example Input: ...\n"
                    "3. Example Output: ...\n"
                    "DO NOT provide the solution implementation."
                )
            elif slot == 1:
                strategy_instruction = (
                    "QUESTION TYPE: RESUME & PROJECT EXPERIENCE.\n"
                    "Ask an interview question based on the projects, architecture, and tools mentioned in the candidate's profile."
                )
            elif slot == 2:
                if has_jd:
                    strategy_instruction = (
                        "QUESTION TYPE: TARGET JOB DESCRIPTION (JD) SKILLS.\n"
                        "Ask a practical scenario question based on the tools and skills requested in the Job Description."
                    )
                else:
                    strategy_instruction = (
                        "QUESTION TYPE: SYSTEM ARCHITECTURE.\n"
                        "Ask a real-world backend scenario or API design question."
                    )
            else:
                strategy_instruction = (
                    "QUESTION TYPE: CORE TECHNICAL CONCEPTUAL.\n"
                    "Ask a conceptual question on Python internals, Django/FastAPI, ORM, databases, or caching."
                )

            should_use_ai = (interview.question_source == "ai") or has_jd or has_resume

            if should_use_ai:
                try:
                    generation_id = uuid.uuid4().hex
                    previous_text_qs = list(interview.questions.values_list("question", flat=True))

                    context_payload = (
                        f"MANDATORY TURN DIRECTIVE:\n{strategy_instruction}\n\n"
                        f"{'STRICT CONSTRAINT: Do NOT provide any coding problems. Ask ONLY verbal conceptual questions.' if is_easy_or_short else ''}\n\n"
                    )

                    if has_jd:
                        context_payload += (
                            f"--- TARGET ROLE JOB DESCRIPTION ---\n{interview.job_description.strip()}\n"
                            f"-----------------------------------\n\n"
                        )
                    if has_resume:
                        context_payload += f"--- CANDIDATE RESUME & PROFILE ---\n{interview.candidate_context.strip()}\n\n"

                    generated = generate_interview_question(
                        resume_text=context_payload,
                        interview_type=interview.interview_type,
                        difficulty=interview.difficulty,
                        previous_questions=previous_text_qs,
                        interview_id=interview_id,
                        generation_id=generation_id,
                        conversation_history=interview_conversation(interview),
                        model_id=interview.model_id,
                    )

                    if isinstance(generated, dict):
                        question_text = generated.get("question") or generated.get("text") or ""
                    elif isinstance(generated, str):
                        question_text = generated.strip()

                    # Safeguard: Agar AI ne coding round mein theoretical/design sawal de diya, use detect karke override karein
                    if is_coding_turn and question_text:
                        lower_q = question_text.lower()
                        is_theory = any(
                            phrase in lower_q
                            for phrase in [
                                "how would you",
                                "how do you",
                                "prevent hallucinations",
                                "explain how",
                                "what are the steps",
                                "what approach would you take",
                                "describe how",
                            ]
                        )
                        has_coding_indicators = any(
                            kw in lower_q
                            for kw in ["input:", "output:", "write a function", "def ", "return ", "given an array", "given a list"]
                        )
                        if is_theory and not has_coding_indicators:
                            logger.info("Overriding theoretical question from Bedrock during Coding Round.")
                            question_text = ""

                except Exception as e:
                    logger.warning("Bedrock generation failed: %s", e)

            # Algorithmic Coding Fallback agar Bedrock fail ho ya usne theory question diya ho
            if is_coding_turn and not question_text:
                coding_samples = [
                    (
                        "Write a Python function to check if a string is a palindrome.\n\nInput: 'racecar'\nOutput: True\nInput: 'hello'\nOutput: False",
                        "def is_palindrome(s: str) -> bool:\n    # Write your solution here\n    pass\n"
                    ),
                    (
                        "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.\n\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]",
                        "def two_sum(nums: list, target: int) -> list:\n    # Write your solution here\n    pass\n"
                    ),
                    (
                        "Write a Python function to find the first non-repeating character in a string.\n\nInput: 'swiss'\nOutput: 'w'",
                        "def first_unique_char(s: str) -> str:\n    # Write your solution here\n    pass\n"
                    ),
                    (
                        "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nInput: '()[]{}'\nOutput: True\nInput: '(]'\nOutput: False",
                        "def is_valid_parentheses(s: str) -> bool:\n    # Write your solution here\n    pass\n"
                    )
                ]
                sel_code = random.choice(coding_samples)
                question_text = sel_code[0]
                starter_code = sel_code[1]

            if not question_text:
                fallback_defaults = [
                    "Explain the difference between mutable and immutable data types in Python.",
                    "How does Django ORM handle select_related vs prefetch_related?",
                    "What is the difference between synchronous and asynchronous execution in FastAPI / Python?",
                    "How does Python manage memory and what is the role of Garbage Collection?"
                ]
                question_text = random.choice(fallback_defaults)

            final_type = "coding" if is_coding_turn else "conceptual"
            final_code = starter_code if is_coding_turn else ""

            with transaction.atomic():
                interview = Interview.objects.select_for_update().get(id=interview_id, user=request.user)
                if interview.status == "completed":
                    return Response({"error": "This interview is already completed."}, status=status.HTTP_400_BAD_REQUEST)

                question_number = (interview.questions.aggregate(value=Max("question_number"))["value"] or 0) + 1
                interview_question = InterviewQuestion.objects.create(
                    interview=interview,
                    question_number=question_number,
                    question=question_text,
                )

            return Response({
                "id": interview_question.id,
                "interview_id": interview.id,
                "question_number": interview_question.question_number,
                "question": interview_question.question,
                "question_type": final_type,
                "starter_code": final_code,
                "answer": interview_question.answer,
            }, status=status.HTTP_201_CREATED)

        except Interview.DoesNotExist:
            return Response({"error": "Interview not found."}, status=404)
        except Exception as err:
            logger.error("InterviewQuestionCreateView unhandled error: %s", str(err), exc_info=True)
            return Response({"error": f"Error: {str(err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InterviewQuestionAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, interview_id, question_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
            interview_question = InterviewQuestion.objects.get(id=question_id, interview=interview)
            answer = request.data.get("answer", "")
            if not isinstance(answer, str):
                return Response({"error": "Answer must be text."}, status=status.HTTP_400_BAD_REQUEST)
            answer = answer.strip()
            if not answer:
                return Response({"error": "Answer is required."}, status=status.HTTP_400_BAD_REQUEST)
            with transaction.atomic():
                interview_question = InterviewQuestion.objects.select_for_update().get(id=question_id, interview=interview)
                if interview_question.skipped_at:
                    return Response({"error": "This question was skipped."}, status=409)
                if interview_question.answer != answer:
                    from evaluations.models import Evaluation

                    from .models import QuestionProgress

                    Evaluation.objects.filter(question=interview_question).delete()
                    QuestionProgress.objects.filter(user=request.user, last_question=interview_question).delete()
                    interview_question.answer = answer
                    interview_question.answered_at = timezone.now()
                    interview_question.save(update_fields=["answer", "answered_at"])
            return Response({
                "id": interview_question.id,
                "interview_id": interview.id,
                "question_number": interview_question.question_number,
                "question": interview_question.question,
                "answer": interview_question.answer,
                "answered_at": interview_question.answered_at,
            })
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found."}, status=404)
        except InterviewQuestion.DoesNotExist:
            return Response({"error": "Interview question not found."}, status=404)


class InterviewQuestionSkipView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, interview_id, question_id):
        with transaction.atomic():
            try:
                interview = Interview.objects.select_for_update().get(pk=interview_id, user=request.user)
                question = InterviewQuestion.objects.select_for_update().get(pk=question_id, interview=interview)
            except (Interview.DoesNotExist, InterviewQuestion.DoesNotExist):
                return Response({"error": "Interview question not found."}, status=404)
            if interview.status == "completed":
                return Response({"error": "This interview is already completed."}, status=400)
            if question.answer:
                return Response({"error": "An answered question cannot be skipped."}, status=409)
            if not question.skipped_at:
                question.skipped_at = timezone.now()
                question.save(update_fields=["skipped_at"])
            return Response({"id": question.pk, "skipped_at": question.skipped_at})


class RunCodeView(APIView):
    """Placeholder until the isolated code-runner service is deployed.

    User code must never execute inside the Django API process. The previous
    implementation used ``exec`` and could access application secrets, the
    database, filesystem, and internal network.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response(
            {
                "output": (
                    "Code execution is temporarily unavailable while the "
                    "isolated runner is being deployed. You can still submit "
                    "code for interview evaluation."
                ),
                "code": "code_runner_unavailable",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class QuestionBankViewSet(viewsets.ModelViewSet):
    queryset = QuestionBank.objects.all().order_by("-created_at")
    serializer_class = QuestionBankSerializer
    permission_classes = [permissions.IsAdminUser]
