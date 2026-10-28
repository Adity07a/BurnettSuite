from rest_framework import serializers, status
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import AccountInvitation, User
from accounts.permissions import IsAdmin
from accounts.serializers import (
    AccountActivationSerializer,
    CurrentUserSerializer,
    HRAccountCreateSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
)
from accounts.services.hr_accounts import (
    HRAccountEmailAlreadyExists,
    create_hr_account_with_invitation,
)
from accounts.services.invitations import create_or_resend_invitation
from accounts.services.password_reset import (
    confirm_password_reset,
    request_password_reset,
)


class CurrentUserView(RetrieveAPIView):
    """Return the currently authenticated user's profile."""

    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ActivateAccountView(APIView):
    # Activation is public because the user does not have a JWT yet.
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

            # Prevent one authenticated user from revoking another
            # user's refresh token.
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

    def get(self, request):
        """List all HR accounts and their latest invitation delivery status."""
        hr_users = User.objects.filter(role=User.Role.HR).order_by("-date_joined")
        data = []
        for u in hr_users:
            latest_inv = u.account_invitations.order_by("-created_at").first()
            data.append({
                "id": u.pk,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "full_name": u.get_full_name(),
                "role": u.role,
                "is_active": u.is_active,
                "invitation": {
                    "id": latest_inv.pk,
                    "delivery_status": latest_inv.delivery_status,
                    "delivery_error": latest_inv.delivery_error,
                    "sent_at": latest_inv.sent_at,
                    "expires_at": latest_inv.expires_at,
                } if latest_inv else None,
            })
        return Response(data, status=status.HTTP_200_OK)

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

        invitation.refresh_from_db()

        if invitation.delivery_status == AccountInvitation.DeliveryStatus.SENT:
            detail_msg = "HR account created and invitation email sent successfully."
        elif invitation.delivery_status == AccountInvitation.DeliveryStatus.FAILED:
            detail_msg = f"HR account created, but email delivery failed: {invitation.delivery_error}"
        else:
            detail_msg = (
                "HR account created. The activation invitation "
                "has been queued for email delivery."
            )

        return Response(
            {
                "detail": detail_msg,
                "id": user.pk,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "is_active": user.is_active,
                "invitation": {
                    "id": invitation.pk,
                    "delivery_status": invitation.delivery_status,
                    "delivery_error": invitation.delivery_error,
                    "expires_at": invitation.expires_at,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class AdminResendHRInvitationView(APIView):
    """Allow an Admin to resend an activation invitation to an inactive HR user."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            hr_user = User.objects.get(pk=user_id, role=User.Role.HR)
        except User.DoesNotExist:
            return Response(
                {"detail": "HR user not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if hr_user.is_active:
            return Response(
                {"detail": "This HR account is already activated."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            invitation = create_or_resend_invitation(
                user=hr_user,
                created_by=request.user,
            )
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc

        invitation.refresh_from_db()

        if invitation.delivery_status == AccountInvitation.DeliveryStatus.SENT:
            detail_msg = "Activation invitation email sent successfully."
        elif invitation.delivery_status == AccountInvitation.DeliveryStatus.FAILED:
            detail_msg = f"Invitation re-issued, but email delivery failed: {invitation.delivery_error}"
        else:
            detail_msg = "A new activation invitation has been queued."

        return Response(
            {
                "detail": detail_msg,
                "invitation_id": invitation.pk,
                "delivery_status": invitation.delivery_status,
                "delivery_error": invitation.delivery_error,
                "expires_at": invitation.expires_at,
            },
            status=status.HTTP_200_OK if invitation.delivery_status == AccountInvitation.DeliveryStatus.SENT else status.HTTP_202_ACCEPTED,
        )
