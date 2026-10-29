import os
import uuid

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from users.models import User, UserProfile


class Command(BaseCommand):
    help = "Create or refresh the local Resume demo candidate."

    @transaction.atomic
    def handle(self, *args, **options):
        if os.getenv("DEMO_SEED_ENABLED", "").lower() != "true":
            raise CommandError("Demo seeding is disabled outside local Compose.")

        email = os.getenv("DEMO_USER_EMAIL", "resume.demo@burnett.local")
        mobile = os.getenv("DEMO_USER_MOBILE", "+919900000102")
        password = os.getenv("DEMO_USER_PASSWORD", "")
        if not password:
            raise CommandError("DEMO_USER_PASSWORD is required.")

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User(
                username=f"resume_{uuid.uuid4().hex[:16]}",
                email=email.lower(),
            )
        user.first_name = "Resume"
        user.last_name = "Demo"
        user.is_active = True
        user.is_email_verified = True
        user.set_password(password)
        user.save()
        UserProfile.objects.update_or_create(
            user=user,
            defaults={"phone": mobile},
        )
        self.stdout.write(
            self.style.SUCCESS(f"resume user_id={user.pk} email={user.email}")
        )
