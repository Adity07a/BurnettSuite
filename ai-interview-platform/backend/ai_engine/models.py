from django.db import models
from resumes.models import Resume


class ResumeAnalysis(models.Model):

    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name="analysis"
    )

    skills = models.JSONField(default=list, blank=True)

    technologies = models.JSONField(default=list, blank=True)

    projects = models.JSONField(default=list, blank=True)

    experience = models.JSONField(default=list, blank=True)

    education = models.JSONField(default=list, blank=True)

    summary = models.TextField(blank=True)

    analyzed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analysis - {self.resume.file.name}"