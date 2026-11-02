import uuid

from django.conf import settings
from django.contrib.auth.models import update_last_login
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

from .identifiers import normalize_mobile
from .models import UserProfile


User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    mobile = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "mobile",
            "first_name",
            "last_name",
            "password",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        value = value.lower().strip()
        # Django's database uniqueness is case-sensitive on some backends,
        # while login is intentionally case-insensitive. Enforce one account
        # per normalized email before reaching the database constraint.
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email address is already registered."
            )
        return value

    def validate_mobile(self, value):
        if not value:
            return ""
        mobile = normalize_mobile(value)
        if UserProfile.objects.filter(phone=mobile).exists():
            raise serializers.ValidationError(
                "This mobile number is already registered."
            )
        return mobile

    def validate(self, attrs):
        candidate = User(
            username="resume_pending_validation",
            email=attrs.get("email", ""),
            first_name=attrs.get("first_name", ""),
            last_name=attrs.get("last_name", ""),
        )
        try:
            validate_password(attrs["password"], candidate)
        except ValidationError as error:
            raise serializers.ValidationError({"password": error.messages})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        mobile = validated_data.pop("mobile", "") or None
        user = User.objects.create_user(
            username=f"resume_{uuid.uuid4().hex[:16]}",
            **validated_data,
        )
        UserProfile.objects.get_or_create(
            user=user,
            defaults={"phone": mobile},
        )
        return user


class EmailVerificationTokenObtainPairSerializer(serializers.Serializer):
    """Log in with email and password, requiring email verification."""

    identifier = serializers.CharField(required=False, write_only=True)
    email = serializers.CharField(required=False, write_only=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        identifier = str(
            attrs.get("identifier") or attrs.get("email") or ""
        ).strip()
        password = attrs.get("password", "")

        user = None
        if "@" in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
        elif identifier:
            try:
                mobile = normalize_mobile(identifier)
            except serializers.ValidationError:
                mobile = None
            if mobile:
                profile = UserProfile.objects.select_related("user").filter(
                    phone=mobile
                ).first()
                user = profile.user if profile else None

        # Use the same error for invalid credentials.
        if (
            user is None
            or not user.is_active
            or not user.check_password(password)
        ):
            raise AuthenticationFailed(
                "Invalid email/mobile or password.",
                code="no_active_account",
            )

        # Do not issue tokens before verification.
        if (
            getattr(settings, "REQUIRE_EMAIL_VERIFICATION", True)
            and not user.is_email_verified
        ):
            raise AuthenticationFailed(
                "Please verify your email address before logging in.",
                code="email_not_verified",
            )

        self.user = user
        refresh = RefreshToken.for_user(user)

        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, user)

        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "phone",
            "location",
            "headline",
            "bio",
            "linked_url",
            "github_url",
            "portfolio_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


