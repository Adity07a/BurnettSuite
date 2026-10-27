from django.urls import path
from .resume_views import ResumeUploadView, LatestResumeView, AnalyzeResumeView

urlpatterns = [
    path("upload/", ResumeUploadView.as_view(), name="candidate-resume-upload"),
    path("latest/", LatestResumeView.as_view(), name="candidate-resume-latest"),
    path("<int:pk>/analyze/", AnalyzeResumeView.as_view(), name="candidate-resume-analyze"),
]
