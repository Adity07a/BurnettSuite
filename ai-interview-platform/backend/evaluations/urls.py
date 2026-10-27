from django.urls import path

from .views import (
    EvaluateInterviewQuestionView,
    InterviewEvaluationSummaryView,
    AdminCandidatesOverviewView,
)

urlpatterns = [
    path(
        "<int:question_id>/evaluate/",
        EvaluateInterviewQuestionView.as_view(),
        name="evaluate-interview-question",
    ),

    path(
        "interview/<int:interview_id>/",
        InterviewEvaluationSummaryView.as_view(),
        name="interview-evaluation-summary",
    ),

    path(
        "admin/candidates-overview/", 
        AdminCandidatesOverviewView.as_view(),
        name="admin-candidates-overview"),
]