import hashlib
from datetime import date

from django.db import transaction
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from employees.models import Employee
from organization.models import Department, Designation

from .models import User


class SuiteJWTAuthentication(JWTAuthentication):
    """Trust central suite identity and provision a bounded People profile."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get("burnett_suite_access")
        if raw_token:
            validated_token = self.get_validated_token(raw_token.encode())
            return self.get_user(validated_token), validated_token
        return super().authenticate(request)

    @transaction.atomic
    def get_user(self, validated_token):
        if not validated_token.get("suite_identity"):
            # Keep existing API clients and employee activation flows working
            # during the UI migration. Browsers use only the central cookie.
            return super().get_user(validated_token)
        email = str(validated_token.get("email") or "").strip().lower()
        if not email:
            raise AuthenticationFailed("The suite identity has no email address.")

        is_staff = bool(validated_token.get("is_staff"))
        role = User.Role.ADMIN if is_staff else User.Role.EMPLOYEE
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.create_user(
                email=email,
                password=None,
                first_name=str(validated_token.get("first_name") or "")[:150],
                last_name=str(validated_token.get("last_name") or "")[:150],
                role=role,
                is_staff=is_staff,
                is_active=True,
            )
        if not user.is_active:
            raise AuthenticationFailed("This account is inactive.")

        changed = []
        for field in ("first_name", "last_name"):
            value = str(validated_token.get(field) or "")[:150]
            if value and getattr(user, field) != value:
                setattr(user, field, value)
                changed.append(field)
        if user.is_staff != is_staff:
            user.is_staff = is_staff
            changed.append("is_staff")
        if is_staff and user.role != User.Role.ADMIN:
            user.role = User.Role.ADMIN
            changed.append("role")
        if changed:
            user.save(update_fields=changed)

        if not is_staff and not hasattr(user, "employee_profile"):
            department, _ = Department.objects.get_or_create(
                code="SUITE",
                defaults={"name": "BurnettSuite Members"},
            )
            designation = Designation.objects.filter(
                title="Suite Member", grade="Member"
            ).first()
            if designation is None:
                designation = Designation.objects.create(
                    title="Suite Member", grade="Member"
                )
            suffix = hashlib.sha256(email.encode()).hexdigest()[:12].upper()
            Employee.objects.create(
                user=user,
                employee_code=f"SUITE-{suffix}",
                official_email=email,
                first_name=user.first_name or "Suite",
                last_name=user.last_name or "Member",
                department=department,
                designation=designation,
                date_of_joining=date.today(),
                phone_number=str(validated_token.get("mobile") or ""),
                employment_status=Employee.EmploymentStatus.ACTIVE,
            )
        return user
