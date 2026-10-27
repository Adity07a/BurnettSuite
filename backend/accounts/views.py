from rest_framework.generics import RetrieveAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    CurrentUserSerializer,
    AccountActivationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    HRAccountCreateSerializer,
    UserRegisterSerializer,
)
from accounts.services.password_reset import (
    request_password_reset,
    confirm_password_reset,
)
from accounts.permissions import IsAdmin
from accounts.services.hr_accounts import (
    HRAccountEmailAlreadyExists,
    create_hr_account_with_invitation,
)


class CurrentUserView(RetrieveAPIView):
    """Return the currently authenticated user's profile."""

    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class RegisterView(CreateAPIView):
    """Public registration for candidates and self-service users."""
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens directly so user is immediately logged in
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Registration successful.",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "is_active": user.is_active,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)


class ActivateAccountView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AccountActivationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "detail": (
                    "Your account has been activated successfully. "
                    "You can now log in."
                )
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_refresh = request.data.get("refresh")

        if not raw_refresh:
            return Response(
                {"detail": "A refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(raw_refresh)

            if str(refresh.get("user_id")) != str(request.user.pk):
                return Response(
                    {"detail": "This refresh token belongs to another account."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            refresh.blacklist()

        except TokenError:
            return Response(
                {"detail": "The refresh token is invalid, expired, or revoked."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "Logout successful."},
            status=status.HTTP_205_RESET_CONTENT,
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        request_password_reset(serializer.validated_data["email"])

        return Response({
            "detail": (
                "If an active account exists with that email, "
                "a password reset code will be sent."
            )
        })


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        confirm_password_reset(
            email=data["email"],
            code=data["code"],
            new_password=data["password"],
        )

        return Response({
            "detail": "Your password has been reset successfully."
        })


class AdminCreateHRView(APIView):
    """Allow an Admin to create an HR account and invite the HR user."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = HRAccountCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user, invitation = create_hr_account_with_invitation(
                **serializer.validated_data,
                created_by=request.user,
            )
        except HRAccountEmailAlreadyExists as exc:
            raise serializers.ValidationError(
                {"email": [str(exc)]}
            ) from exc

        return Response(
            {
                "detail": (
                    "HR account created. The activation invitation "
                    "has been queued for email delivery."
                ),
                "id": user.pk,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "is_active": user.is_active,
                "invitation": {
                    "id": invitation.pk,
                    "delivery_status": invitation.delivery_status,
                    "expires_at": invitation.expires_at,
                },
            },
            status=status.HTTP_201_CREATED,
        )
