import uuid

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from .identifiers import normalize_mobile
from .models import UserProfile


def issue_suite_tokens(user):
    """Issue the shared identity token consumed by all BurnettSuite products."""
    profile = getattr(user, "interview_profile", None)
    refresh = RefreshToken.for_user(user)
    refresh["suite_identity"] = True
    refresh["email"] = user.email
    refresh["mobile"] = getattr(profile, "mobile", None)
    refresh["first_name"] = user.first_name
    refresh["last_name"] = user.last_name
    refresh["display_name"] = user.get_full_name() or user.email
    refresh["is_staff"] = user.is_staff
    refresh["role"] = "admin" if user.is_staff else "member"
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class CustomTokenObtainPairSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=False, write_only=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        identifier = str(attrs.get("identifier") or "").strip()
        if not identifier:
            raise serializers.ValidationError(
                {"identifier": "Enter your email address or mobile number."}
            )

        user = None
        if "@" in identifier:
            matches = list(User.objects.filter(email__iexact=identifier)[:2])
            if len(matches) == 1:
                user = matches[0]
        else:
            try:
                mobile = normalize_mobile(identifier)
            except serializers.ValidationError:
                mobile = None
            else:
                profile = UserProfile.objects.select_related("user").filter(
                    mobile=mobile
                ).first()
                user = profile.user if profile else None

        if user is None or not user.is_active or not user.check_password(
            attrs["password"]
        ):
            raise AuthenticationFailed("Invalid email/mobile or password.")

        # Username is a generated internal key. Shared claims use stable public
        # identity fields and are accepted by all three product APIs.
        data = issue_suite_tokens(user)
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "mobile": getattr(
                getattr(user, "interview_profile", None), "mobile", None
            ),
            "is_staff": user.is_staff,
            "role": "admin" if user.is_staff else "candidate",
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    mobile = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "full_name",
            "email",
            "mobile",
            "password",
            "confirm_password",
        ]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        candidate = User(
            username="candidate_pending_validation",
            email=data["email"],
            first_name=data["full_name"],
        )
        try:
            validate_password(data["password"], candidate)
        except ValidationError as error:
            raise serializers.ValidationError({"password": error.messages})

        return data

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_mobile(self, value):
        if not value:
            return ""
        mobile = normalize_mobile(value)
        if UserProfile.objects.filter(mobile=mobile).exists():
            raise serializers.ValidationError("This mobile number is already registered.")
        return mobile

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("confirm_password")
        full_name = validated_data.pop("full_name")
        mobile = validated_data.pop("mobile", "") or None

        user = User.objects.create_user(
            username=f"candidate_{uuid.uuid4().hex[:16]}",
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=full_name,
        )
        UserProfile.objects.create(user=user, mobile=mobile)

        return user
