from django.urls import path

from .views import GenerateInterviewQuestionView, ModelCatalogView


urlpatterns = [
    path("models/", ModelCatalogView.as_view(), name="ai-models"),
    path(
        "question/<int:interview_id>/",
        GenerateInterviewQuestionView.as_view(),
        name="generate-interview-question"
    ),
]