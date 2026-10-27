from rest_framework import serializers
from .models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password

from accounts.services.activation import (
    InvalidInvitationError,
    activate_account,
)
from employees.models import Employee


class CurrentUserSerializer(serializers.ModelSerializer):
    """Expose safe profile information for the authenticated user."""

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
        )
        read_only_fields = fields


class AccountActivationSerializer(serializers.Serializer):
    token = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        max_length=256,
    )

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        max_length=128,
        style={"input_type": "password"},
    )

    password_confirm = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        max_length=128,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm": "The passwords do not match."
            })

        return attrs

    def create(self, validated_data):
        raw_token = validated_data["token"]
        password = validated_data["password"]

        try:
            return activate_account(
                raw_token=raw_token,
                password=password,
            )
        except InvalidInvitationError:
            raise serializers.ValidationError({
                "token": (
                    "This activation link is invalid, expired, "
                    "or has already been used."
                )
            })
        except DjangoValidationError as exc:
            raise serializers.ValidationError({
                "password": exc.messages
            })


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.RegexField(
        regex=r"^\d{6}$",
        error_messages={
            "invalid": "Enter the six-digit reset code."
        },
    )
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        max_length=128,
    )
    password_confirm = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        max_length=128,
    )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm": "The passwords do not match."
            })

        attrs.pop("password_confirm")
        return attrs


class HRAccountCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, trim_whitespace=True)
    last_name = serializers.CharField(max_length=150, trim_whitespace=True)

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email is already linked to an account."
            )

        if Employee.objects.filter(official_email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email is already used by an employee record."
            )

        return value


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"}
    )
    role = serializers.ChoiceField(
        choices=User.Role.choices,
        default=User.Role.CANDIDATE,
        required=False
    )

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "password", "role"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        val = value.strip().lower()
        if User.objects.filter(email__iexact=val).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return val

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        # Self-registered users default to CANDIDATE if not specified
        if "role" not in validated_data or validated_data["role"] in [User.Role.ADMIN, User.Role.HR]:
            validated_data["role"] = User.Role.CANDIDATE
        user = User.objects.create_user(password=password, **validated_data)
        # Auto-create UserProfile in career_profiles
        try:
            from career_profiles.models import UserProfile
            UserProfile.objects.get_or_create(user=user)
        except Exception:
            pass
        return user
