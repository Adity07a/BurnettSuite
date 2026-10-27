from django.db import models


class Evaluation(models.Model):
    answer_fingerprint = models.CharField(max_length=64, blank=True, default="")
    question = models.OneToOneField(
        "interview_platform.InterviewQuestion",
        on_delete=models.CASCADE,
        related_name="evaluation"
    )
    overall_score = models.FloatField(default=0)
    technical_score = models.FloatField(default=0)
    communication_score = models.FloatField(default=0)
    relevance_score = models.FloatField(default=0)
    correctness_score = models.FloatField(default=0)
    strengths = models.JSONField(default=list, blank=True)
    weaknesses = models.JSONField(default=list, blank=True)
    feedback = models.TextField(blank=True, default="")
    improved_answer = models.TextField(blank=True, default="")
    evaluated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "interview_platform_evaluation"

    def __str__(self):
        return f"Evaluation - Question {self.question_id}"
