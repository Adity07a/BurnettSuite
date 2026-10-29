import os
import uuid

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from users.models import UserProfile


class Command(BaseCommand):
    help = "Create or refresh the local Interview demo candidate."

    @transaction.atomic
    def handle(self, *args, **options):
        if os.getenv("DEMO_SEED_ENABLED", "").lower() != "true":
            raise CommandError("Demo seeding is disabled outside local Compose.")

        email = os.getenv("DEMO_USER_EMAIL", "interview.demo@burnett.local")
        mobile = os.getenv("DEMO_USER_MOBILE", "+919900000101")
        password = os.getenv("DEMO_USER_PASSWORD", "")
        if not password:
            raise CommandError("DEMO_USER_PASSWORD is required.")

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User(
                username=f"candidate_{uuid.uuid4().hex[:16]}",
                email=email.lower(),
            )
        user.first_name = "Interview"
        user.last_name = "Demo"
        user.is_active = True
        user.is_staff = False
        user.set_password(password)
        user.save()
        UserProfile.objects.update_or_create(
            user=user,
            defaults={"mobile": mobile},
        )
        self.stdout.write(
            self.style.SUCCESS(f"interview user_id={user.pk} email={user.email}")
        )
