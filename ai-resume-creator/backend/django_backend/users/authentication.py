import uuid

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import UserProfile


User = get_user_model()


class SuiteJWTAuthentication(JWTAuthentication):
    """Trust the central suite JWT and map it to a local Resume user."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get("burnett_suite_access")
        if raw_token:
            validated_token = self.get_validated_token(raw_token.encode())
            return self.get_user(validated_token), validated_token
        return super().authenticate(request)

    @transaction.atomic
    def get_user(self, validated_token):
        if not validated_token.get("suite_identity"):
            # Preserve existing API-token consumers while product UI routes
            # move to the central HttpOnly-cookie session.
            return super().get_user(validated_token)
        email = str(validated_token.get("email") or "").strip().lower()
        if not email:
            raise AuthenticationFailed("The suite identity has no email address.")

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.create_user(
                username=f"suite_{uuid.uuid4().hex[:20]}",
                email=email,
                password=None,
                first_name=str(validated_token.get("first_name") or "")[:150],
                last_name=str(validated_token.get("last_name") or "")[:150],
                is_email_verified=True,
            )

        changed = []
        for field in ("first_name", "last_name"):
            value = str(validated_token.get(field) or "")[:150]
            if value and getattr(user, field) != value:
                setattr(user, field, value)
                changed.append(field)
        is_staff = bool(validated_token.get("is_staff"))
        if user.is_staff != is_staff:
            user.is_staff = is_staff
            changed.append("is_staff")
        if not user.is_active:
            raise AuthenticationFailed("This account is inactive.")
        if not user.is_email_verified:
            user.is_email_verified = True
            changed.append("is_email_verified")
        if changed:
            user.save(update_fields=changed)

        profile, _ = UserProfile.objects.get_or_create(user=user)
        mobile = str(validated_token.get("mobile") or "").strip() or None
        if mobile and not profile.phone:
            if not UserProfile.objects.exclude(pk=profile.pk).filter(phone=mobile).exists():
                profile.phone = mobile
                profile.save(update_fields=["phone", "updated_at"])
        return user
