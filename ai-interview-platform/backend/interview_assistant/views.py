import logging
import uuid

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from resumes.models import Resume
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from .models import AssistantConversation

from .serializers import AssistantQuestionSerializer
from .services import answer_question, build_candidate_context

logger = logging.getLogger(__name__)


class AssistantAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AssistantQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_id = uuid.uuid4().hex
        try:
            with transaction.atomic():
                # Serialize turns and ending the chat for this account.
                get_user_model().objects.select_for_update().get(pk=request.user.pk)
                conversation = AssistantConversation.objects.filter(user=request.user, ended_at__isnull=True).first()
                if conversation is None:
                    resume = Resume.objects.filter(user=request.user).select_related("analysis").order_by("-uploaded_at", "-id").first()
                    conversation = AssistantConversation.objects.create(user=request.user, candidate_context=build_candidate_context(resume))
                question = serializer.validated_data["question"]
                answer = answer_question(question, conversation.messages, request_id, candidate_context=conversation.candidate_context, mode=serializer.validated_data["mode"], model_id=serializer.validated_data.get("model_id", conversation.model_id), refine=serializer.validated_data["refine"])
                conversation.messages = [*conversation.messages, {"role": "user", "content": question}, {"role": "assistant", "content": answer}]
                conversation.model_id = serializer.validated_data.get("model_id", conversation.model_id)
                conversation.save(update_fields=["messages", "model_id"])
                return Response({"answer": answer, "request_id": request_id, "conversation_id": conversation.pk, "model_id": conversation.model_id, "messages": conversation.messages})
        except Exception as error:
            logger.error("assistant_answer_failed request_id=%s error_type=%s", request_id, type(error).__name__)
            return Response(
                {"error": "Unable to answer right now. Please retry.", "request_id": request_id},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class AssistantConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversation = AssistantConversation.objects.filter(user=request.user, ended_at__isnull=True).first()
        return Response({"conversation_id": conversation.pk if conversation else None, "messages": conversation.messages if conversation else [], "model_id": conversation.model_id if conversation else None})

    def post(self, request):
        with transaction.atomic():
            get_user_model().objects.select_for_update().get(pk=request.user.pk)
            AssistantConversation.objects.filter(user=request.user, ended_at__isnull=True).update(ended_at=timezone.now())
        return Response({"messages": [], "conversation_id": None})
