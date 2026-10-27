from django.urls import path
from .views import AssistantAnswerView, AssistantConversationView

urlpatterns = [
    path("answer/", AssistantAnswerView.as_view(), name="assistant-answer"),
    path("conversation/", AssistantConversationView.as_view(), name="assistant-conversation"),
]
