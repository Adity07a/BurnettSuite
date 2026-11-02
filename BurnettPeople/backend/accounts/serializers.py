
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from django.core.exceptions import ValidationError as DjangoValidationError

from accounts.services.activation import (
    InvalidInvitationError,
    activate_account,
)
from employees.models import Employee
from .identifiers import normalize_mobile


class IdentifierTokenObtainPairSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=False, write_only=True)
    email = serializers.CharField(required=False, write_only=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        identifier = str(
            attrs.get("identifier") or attrs.get("email") or ""
        ).strip()
        user = None

        if "@" in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
        elif identifier:
            try:
                mobile = normalize_mobile(identifier)
            except serializers.ValidationError:
                mobile = None
            if mobile:
                matches = list(
                    Employee.objects.select_related("user")
                    .filter(phone_number=mobile, user__isnull=False)[:2]
                )
                if len(matches) == 1:
                    user = matches[0].user

        if user is None or not user.is_active or not user.check_password(
            attrs["password"]
        ):
            raise AuthenticationFailed("Invalid email/mobile or password.")

        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

class CurrentUserSerializer(serializers.ModelSerializer):
    """Expose safe profile information for the authenticated user."""

    mobile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "mobile",
            "first_name",
            "last_name",
            "role",
            "is_active",
        )
        read_only_fields = fields

    def get_mobile(self, user):
        employee = getattr(user, "employee_profile", None)
        return employee.phone_number if employee else None


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

