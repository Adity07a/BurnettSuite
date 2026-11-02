import os
from datetime import date

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from accounts.models import User
from employees.models import Employee
from organization.models import Department, Designation, WorkLocation


class Command(BaseCommand):
    help = "Create or refresh the local BurnettPeople demo employee."

    @transaction.atomic
    def handle(self, *args, **options):
        if os.getenv("DEMO_SEED_ENABLED", "").lower() != "true":
            raise CommandError("Demo seeding is disabled outside local Compose.")

        email = os.getenv("DEMO_USER_EMAIL", "people.demo@burnett.local")
        mobile = os.getenv("DEMO_USER_MOBILE", "+919900000103")
        password = os.getenv("DEMO_USER_PASSWORD", "")
        if not password:
            raise CommandError("DEMO_USER_PASSWORD is required.")

        department, _ = Department.objects.get_or_create(
            code="DEMO",
            defaults={"name": "Demo Department"},
        )
        designation, _ = Designation.objects.get_or_create(
            title="Demo Employee",
            grade="DEMO",
        )
        location, _ = WorkLocation.objects.get_or_create(
            name="Local Docker",
            defaults={"address": "Local development environment"},
        )

        user, _ = User.objects.get_or_create(
            email=email.lower(),
            defaults={
                "first_name": "People",
                "last_name": "Demo",
                "role": User.Role.EMPLOYEE,
            },
        )
        user.first_name = "People"
        user.last_name = "Demo"
        user.role = User.Role.EMPLOYEE
        user.is_active = True
        user.set_password(password)
        user.save()

        Employee.objects.update_or_create(
            employee_code="DEMO-001",
            defaults={
                "user": user,
                "official_email": email.lower(),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "department": department,
                "designation": designation,
                "work_location": location,
                "employment_type": Employee.EmploymentType.FULL_TIME,
                "employment_status": Employee.EmploymentStatus.ACTIVE,
                "date_of_joining": date.today(),
                "phone_number": mobile,
            },
        )
        self.stdout.write(
            self.style.SUCCESS(f"people user_id={user.pk} email={user.email}")
        )
