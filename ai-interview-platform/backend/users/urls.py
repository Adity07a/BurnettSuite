from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, CustomLoginView, ToggleUserActiveStatusView
from .suite_views import (
    SuiteLoginView,
    SuiteLogoutView,
    SuiteRefreshView,
    SuiteRegisterView,
    SuiteSessionView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomLoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("suite-auth/login/", SuiteLoginView.as_view(), name="suite-login"),
    path("suite-auth/register/", SuiteRegisterView.as_view(), name="suite-register"),
    path("suite-auth/session/", SuiteSessionView.as_view(), name="suite-session"),
    path("suite-auth/refresh/", SuiteRefreshView.as_view(), name="suite-refresh"),
    path("suite-auth/logout/", SuiteLogoutView.as_view(), name="suite-logout"),
    path('admin/toggle-active/<int:user_id>/', ToggleUserActiveStatusView.as_view(), name='toggle-user-active'),
]
