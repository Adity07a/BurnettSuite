from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    issue_suite_tokens,
)


def _cookie_options(max_age):
    return {
        "max_age": max_age,
        "httponly": True,
        "secure": settings.SUITE_COOKIE_SECURE,
        "samesite": settings.SUITE_COOKIE_SAMESITE,
        "domain": settings.SUITE_COOKIE_DOMAIN,
        "path": "/",
    }


def _set_session_cookies(response, tokens):
    response.set_cookie(
        "burnett_suite_access",
        tokens["access"],
        **_cookie_options(2 * 60 * 60),
    )
    response.set_cookie(
        "burnett_suite_refresh",
        tokens["refresh"],
        **_cookie_options(7 * 24 * 60 * 60),
    )


def _delete_session_cookies(response):
    for name in ("burnett_suite_access", "burnett_suite_refresh"):
        response.delete_cookie(
            name,
            domain=settings.SUITE_COOKIE_DOMAIN,
            path="/",
            samesite=settings.SUITE_COOKIE_SAMESITE,
        )


class SuiteLoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response = Response(
            {"user": serializer.validated_data["user"]},
            status=status.HTTP_200_OK,
        )
        _set_session_cookies(response, serializer.validated_data)
        return response


class SuiteRegisterView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = issue_suite_tokens(user)
        response = Response(
            {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "mobile": getattr(user.interview_profile, "mobile", None),
                    "is_staff": user.is_staff,
                    "role": "candidate",
                }
            },
            status=status.HTTP_201_CREATED,
        )
        _set_session_cookies(response, tokens)
        return response


class SuiteSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, "interview_profile", None)
        return Response({
            "id": request.user.id,
            "email": request.user.email,
            "mobile": getattr(profile, "mobile", None),
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "is_staff": request.user.is_staff,
            "role": "admin" if request.user.is_staff else "member",
        })


class SuiteRefreshView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_refresh = request.COOKIES.get("burnett_suite_refresh")
        if not raw_refresh:
            return Response(
                {"detail": "Suite refresh session is missing."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            refresh = RefreshToken(raw_refresh)
            access = str(refresh.access_token)
        except TokenError:
            return Response(
                {"detail": "Suite session has expired."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        response = Response({"detail": "Session refreshed."})
        response.set_cookie(
            "burnett_suite_access",
            access,
            **_cookie_options(2 * 60 * 60),
        )
        return response


class SuiteLogoutView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_refresh = request.COOKIES.get("burnett_suite_refresh")
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except (TokenError, AttributeError):
                pass
        response = Response({"detail": "Logged out."})
        _delete_session_cookies(response)
        return response
