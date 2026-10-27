from django.db import models


class ResumeAnalysis(models.Model):
    """Extracted profile analysis from candidate uploaded resume for interview prep."""
    resume = models.OneToOneField(
        "interview_platform.CandidateInterviewResume",
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

    class Meta:
        db_table = "interview_resume_analysis"

    def __str__(self):
        return f"Interview Analysis - {self.resume_id}"
