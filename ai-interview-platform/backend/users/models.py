from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    """Authentication contact details not provided by Django's legacy user.

    Interview still uses Django's built-in User table. Its username column is
    retained only as an internal migration-safe key; clients authenticate with
    email or this mobile number and never choose a username.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interview_profile",
    )
    mobile = models.CharField(
        max_length=16,
        unique=True,
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"Interview profile for {self.user_id}"
