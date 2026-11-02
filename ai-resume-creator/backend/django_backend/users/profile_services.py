def _has_text(value):
    """Return whether an optional model value contains non-whitespace text."""
    return bool(str(value or "").strip())


def calculate_profile_completion(profile):
    """
    Calculate profile completion without treating optional career
    sections as mandatory.

    The overall percentage includes optional items in its denominator.
    A separate required percentage makes mandatory-field completion clear.
    """

    user = profile.user

    fields = [
        {
            "key": "full_name",
            "label": "Full name",
            "required": True,
            "complete": _has_text(user.first_name) and _has_text(user.last_name),
        },
        {
            "key": "email",
            "label": "Email address",
            "required": True,
            "complete": _has_text(user.email),
        },
        {
            "key": "phone",
            "label": "Phone number",
            "required": False,
            "complete": _has_text(profile.phone),
        },
        {
            "key": "location",
            "label": "Location",
            "required": False,
            "complete": _has_text(profile.location),
        },
        {
            "key": "headline",
            "label": "Professional headline",
            "required": False,
            "complete": _has_text(profile.headline),
        },
        {
            "key": "summary",
            "label": "Professional summary",
            "required": False,
            "complete": _has_text(profile.bio),
        },
        {
            "key": "linkedin",
            "label": "LinkedIn URL",
            "required": False,
            "complete": _has_text(profile.linked_url),
        },
        {
            "key": "github",
            "label": "GitHub URL",
            "required": False,
            "complete": _has_text(profile.github_url),
        },
        {
            "key": "portfolio",
            "label": "Portfolio URL",
            "required": False,
            "complete": _has_text(profile.portfolio_url),
        },
    ]

    section_definitions = [
        ("experiences", "Experience", "experiences"),
        ("projects", "Projects", "projects"),
        ("skills", "Skills", "skills"),
        ("education", "Education", "education_entries"),
        ("certifications", "Certifications", "certifications"),
        ("links", "Professional links", "links"),
        ("languages", "Languages", "languages"),
        ("achievements", "Achievements", "achievements"),
        (
            "target_role_preferences",
            "Target-role preferences",
            "target_role_preferences",
        ),
    ]

    sections = []

    for key, label, related_name in section_definitions:
        item_count = getattr(profile, related_name).count()

        sections.append(
            {
                "key": key,
                "label": label,
                "required": False,
                "complete": item_count > 0,
                "item_count": item_count,
            }
        )

    all_items = fields + sections

    completed_count = sum(
        1 for item in all_items if item["complete"]
    )

    total_count = len(all_items)

    required_fields = [
        item for item in fields if item["required"]
    ]

    completed_required = sum(
        1 for item in required_fields if item["complete"]
    )

    required_count = len(required_fields)

    completion_percentage = round(
        completed_count / total_count * 100
    ) if total_count else 100

    required_completion_percentage = round(
        completed_required / required_count * 100
    ) if required_count else 100

    return {
        "completion_percentage": completion_percentage,
        "required_completion_percentage": (
            required_completion_percentage
        ),
        "required_fields_complete": all(
            item["complete"] for item in required_fields
        ),
        "completed_count": completed_count,
        "total_count": total_count,
        "fields": fields,
        "sections": sections,
    }
