"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health_check(_request):
    return JsonResponse({"status": "healthy", "service": "interview-api"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/health/", health_check, name="health"),
    path("api/interviews/",include("interviews.urls")),
    path("api/users/", include("users.urls")),
    path("users/", include("users.urls")),  # Compatibility for existing clients.
    path("api/resumes/", include("resumes.urls")),
    path("api/ai/", include("ai_engine.urls")),
    path("api/evaluations/", include("evaluations.urls")),
    path("api/assistant/", include("interview_assistant.urls")),
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)
