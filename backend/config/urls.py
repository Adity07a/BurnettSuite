"""
BurnettSuite Unified URL Configuration.
Unifies BurnettPeople (HRMS), AI Resume Creator, and AI Interview Platform.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from core.views import health_check, liveness_check, readiness_check
from accounts.views import AdminCreateHRView
from accounts.audit_views import AuditEventListView
from attendance.reporting_views import AdminDashboardMetricsView
from recognition.views import (
    AchievementCatalogView, ChallengeJoinView, ChallengeSubmitView, ChallengeVerifyView,
    LeaderboardDepartmentsView, LeaderboardView, LearningActivitiesView, LearningEnrollView,
    LearningSubmitView, LearningVerifyView, MyRecognitionView, RecognitionReviewQueueView,
    RecognitionRulesView, TeamChallengesView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Health Checks
    path("api/health/", health_check, name="health"),
    path("api/health/live/", liveness_check, name="health-live"),
    path("api/health/ready/", readiness_check, name="health-ready"),

    # =========================================================================
    # 1. Central Authentication & Identity (BurnettPeople accounts.User)
    # =========================================================================
    path("api/auth/", include("accounts.urls")),
    # Compatibility routes for Resume Creator and Interview Platform clients:
    path("api/v1/auth/", include("accounts.urls")),
    path("api/users/", include("accounts.urls")),

    # =========================================================================
    # 2. Domain 1: BurnettPeople — HRMS & People Operations
    # =========================================================================
    path("api/employees/", include("employees.urls")),
    path("api/attendance/", include("attendance.urls")),
    path("api/organization/", include("organization.urls")),
    path("api/admin/hr/", AdminCreateHRView.as_view(), name="admin-create-hr"),
    path("api/admin/metrics/", AdminDashboardMetricsView.as_view(), name="admin-metrics"),
    path("api/audit/logs/", AuditEventListView.as_view(), name="audit-log-list"),
    path("api/status-updates/", include("status_updates.urls")),

    # Recognition and Leaderboards
    path("api/recognition/leaderboard/", LeaderboardView.as_view(), name="recognition-leaderboard"),
    path("api/recognition/departments/", LeaderboardDepartmentsView.as_view(), name="recognition-departments"),
    path("api/recognition/me/", MyRecognitionView.as_view(), name="recognition-me"),
    path("api/recognition/rules/", RecognitionRulesView.as_view(), name="recognition-rules"),
    path("api/recognition/achievements/", AchievementCatalogView.as_view(), name="recognition-achievements"),
    path("api/recognition/learning/", LearningActivitiesView.as_view(), name="recognition-learning"),
    path("api/recognition/learning/<int:pk>/enroll/", LearningEnrollView.as_view(), name="recognition-learning-enroll"),
    path("api/recognition/learning/completions/<int:pk>/submit/", LearningSubmitView.as_view(), name="recognition-learning-submit"),
    path("api/recognition/learning/completions/<int:pk>/verify/", LearningVerifyView.as_view(), name="recognition-learning-verify"),
    path("api/recognition/challenges/", TeamChallengesView.as_view(), name="recognition-challenges"),
    path("api/recognition/challenges/<int:pk>/join/", ChallengeJoinView.as_view(), name="recognition-challenge-join"),
    path("api/recognition/challenges/participations/<int:pk>/submit/", ChallengeSubmitView.as_view(), name="recognition-challenge-submit"),
    path("api/recognition/challenges/participations/<int:pk>/verify/", ChallengeVerifyView.as_view(), name="recognition-challenge-verify"),
    path("api/recognition/review-queue/", RecognitionReviewQueueView.as_view(), name="recognition-review-queue"),

    # HR Operations (Leave, Assets, etc.)
    path("api/", include("hr_operations.urls")),

    # =========================================================================
    # 3. Domain 2: AI Resume Creator
    # =========================================================================
    path("api/v1/resumes/", include("resume_creator.urls")),
    path("api/v1/resume-sections/", include("resume_creator.section_urls")),
    path("api/v1/profile/", include("career_profiles.urls")),
    path("api/v1/job-descriptions/", include("job_descriptions_app.urls")),
    path("api/v1/ai-jobs/", include("ai_jobs_app.urls")),
    path("api/v1/analysis/", include("resume_creator.analysis_urls")),

    # =========================================================================
    # 4. Domain 3: AI Interview Platform
    # =========================================================================
    path("api/interviews/", include("interview_platform.urls")),
    path("api/resumes/", include("interview_platform.resume_urls")),
    path("api/ai/", include("ai_engine_app.urls")),
    path("api/evaluations/", include("evaluations.urls")),
    path("api/assistant/", include("interview_assistant_app.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
