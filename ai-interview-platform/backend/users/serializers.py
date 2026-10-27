from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Login ke response mein role aur user details attach kar rahe hain
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "is_staff": self.user.is_staff,
            "role": "admin" if self.user.is_staff else "candidate",
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "full_name",
            "username",
            "email",
            "password",
            "confirm_password",
        ]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        candidate = User(
            username=data["username"],
            email=data["email"],
            first_name=data["full_name"],
        )
        try:
            validate_password(data["password"], candidate)
        except ValidationError as error:
            raise serializers.ValidationError({"password": error.messages})

        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        full_name = validated_data.pop("full_name")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=full_name,
        )

        return user