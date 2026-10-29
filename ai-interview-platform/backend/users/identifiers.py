import re

from rest_framework import serializers


MOBILE_PATTERN = re.compile(r"^\+?[1-9]\d{7,14}$")


def normalize_mobile(value: str) -> str:
    """Return a comparison-safe mobile number without formatting characters."""

    normalized = re.sub(r"[\s().-]", "", str(value or "").strip())
    if not MOBILE_PATTERN.fullmatch(normalized):
        raise serializers.ValidationError(
            "Enter a valid mobile number, optionally including the country code."
        )
    return normalized
