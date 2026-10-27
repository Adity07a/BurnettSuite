from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InterviewCreateView, InterviewListView, DashboardSummaryView,
    InterviewDetailView, InterviewStartView, InterviewCompleteView,
    InterviewQuestionCreateView, InterviewQuestionAnswerView,
    InterviewQuestionSpeechView,
    QuestionBankProgressView,
    InterviewQuestionSkipView,
    QuestionBankViewSet,
    RunCodeView
)

router = DefaultRouter()
router.register(r'question-bank', QuestionBankViewSet, basename='question-bank')

urlpatterns = [
    path("<int:interview_id>/questions/<int:question_id>/skip/", InterviewQuestionSkipView.as_view(), name="interview-question-skip"),
    path("question-bank/progress/", QuestionBankProgressView.as_view(), name="question-bank-progress"),
    path("<int:interview_id>/questions/<int:question_id>/speech/", InterviewQuestionSpeechView.as_view(), name="interview-question-speech"),
    path("create/", InterviewCreateView.as_view(), name="interview-create"),
    path("history/", InterviewListView.as_view(), name="interview-history"),
    path("dashboard/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("<int:interview_id>/", InterviewDetailView.as_view(), name="interview-detail"),
    path("<int:interview_id>/start/", InterviewStartView.as_view(), name="interview-start"),
    path("<int:interview_id>/complete/", InterviewCompleteView.as_view(), name="interview-complete"),
    path("<int:interview_id>/questions/", InterviewQuestionCreateView.as_view(), name="interview-question-create"),
    path("<int:interview_id>/questions/<int:question_id>/answer/", InterviewQuestionAnswerView.as_view(), name="interview-question-answer"),
    path('run-code/', RunCodeView.as_view(), name='run-code'),
]

urlpatterns += router.urls
