from django.conf import settings
from django.db import models


class Resume(models.Model):
    """Represents a user's editable, multi-version resume in the Resume Creator."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_resumes",
    )
    title = models.CharField(
        max_length=255,
        default="My Resume",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resume_creator_resume"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} - {self.user.email}"


class ResumeVersion(models.Model):
    """Represents a specific tailored version of a resume."""
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    version_number = models.PositiveIntegerField()
    target_job_title = models.CharField(max_length=255, blank=True)
    target_company = models.CharField(max_length=255, blank=True)
    template_name = models.CharField(max_length=100, default="ATS Classic")
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resume_creator_version"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.resume.title} - Version {self.version_number}"


class ResumeSection(models.Model):
    """Individual editable section of a resume version."""

    class SectionType(models.TextChoices):
        SUMMARY = "SUMMARY", "Summary"
        EXPERIENCE = "EXPERIENCE", "Experience"
        PROJECTS = "PROJECTS", "Projects"
        EDUCATION = "EDUCATION", "Education"
        SKILLS = "SKILLS", "Skills"
        CERTIFICATIONS = "CERTIFICATIONS", "Certifications"
        ACHIEVEMENTS = "ACHIEVEMENTS", "Achievements"
        LANGUAGES = "LANGUAGES", "Languages"
        LINKS = "LINKS", "Links"
        CUSTOM = "CUSTOM", "Custom"

    version = models.ForeignKey(
        ResumeVersion,
        on_delete=models.CASCADE,
        related_name="sections",
    )
    section_type = models.CharField(max_length=50, choices=SectionType.choices)
    title = models.CharField(max_length=255)
    content = models.JSONField(default=dict)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resume_creator_section"
        ordering = ["display_order", "created_at"]

    def __str__(self):
        return f"{self.version} - {self.title}"


class ResumeTemplate(models.Model):
    class Category(models.TextChoices):
        ATS_FRIENDLY = "ats_friendly", "ATS Friendly"
        PROFESSIONAL = "professional", "Professional"
        MODERN = "modern", "Modern"
        MINIMAL = "minimal", "Minimal"
        TECHNICAL = "technical", "Technical"
        EXECUTIVE = "executive", "Executive"

    slug = models.SlugField(max_length=80, unique=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.ATS_FRIENDLY,
    )
    preview_image_url = models.URLField(max_length=2048, blank=True)
    is_ats_friendly = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveSmallIntegerField(default=0)
    layout_config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resume_creator_template"
        ordering = ["display_order", "name"]

    def __str__(self):
        return self.name


class ResumeAnalysis(models.Model):
    """A persistent ATS/gap analysis of one resume version against one job description."""

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        QUEUED = "QUEUED", "Queued"
        PROCESSING = "PROCESSING", "Processing"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resume_analyses",
    )
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="analyses",
    )
    resume_version = models.ForeignKey(
        ResumeVersion,
        on_delete=models.CASCADE,
        related_name="analyses",
    )
    job_description = models.ForeignKey(
        "job_descriptions_app.JobDescription",
        on_delete=models.CASCADE,
        related_name="resume_analyses",
    )
    target_job_title = models.CharField(max_length=255, blank=True, default="")
    target_company = models.CharField(max_length=255, blank=True, default="")
    job_description_text = models.TextField(blank=True)
    parsed_job_data = models.JSONField(default=dict, blank=True)
    ai_job = models.OneToOneField(
        "ai_jobs_app.AIJob",
        on_delete=models.SET_NULL,
        related_name="resume_analysis",
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    result = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resume_creator_analysis"
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["user", "-created_at"],
                name="rc_user_created_idx",
            ),
            models.Index(
                fields=["user", "status"],
                name="rc_user_status_idx",
            ),
        ]

    def __str__(self):
        return f"Analysis {self.pk}: {self.resume.title} ({self.status})"
