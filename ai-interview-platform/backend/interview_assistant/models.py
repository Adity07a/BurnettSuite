from django.conf import settings
from django.db import models
from ai_engine.model_catalog import MODEL_CHOICES, assistant_default_model


class AssistantConversation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    model_id = models.CharField(max_length=100, choices=MODEL_CHOICES, default=assistant_default_model)
    messages = models.JSONField(default=list)
    candidate_context = models.TextField(default="")
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user"], condition=models.Q(ended_at__isnull=True), name="one_active_assistant_chat")]
