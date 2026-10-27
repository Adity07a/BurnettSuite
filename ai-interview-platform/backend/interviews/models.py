from django.conf import settings
from django.db import models
from ai_engine.model_catalog import MODEL_CHOICES, interview_default_model


class Interview(models.Model):

    INTERVIEW_TYPES = [
        ("technical", "Technical"),
        ("hr", "HR"),
        ("project", "Project"),
    ]

    DIFFICULTY_LEVELS = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]

    DURATION_CHOICES = [
        (10, "10 Minutes"),
        (20, "20 Minutes"),
        (30, "30 Minutes"),
        (45, "45 Minutes"),
        (60, "60 Minutes"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interviews"
    )

    interview_type = models.CharField(
        max_length=20,
        choices=INTERVIEW_TYPES
    )

    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_LEVELS
    )

    duration = models.PositiveIntegerField(
        choices=DURATION_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    model_id = models.CharField(max_length=100, choices=MODEL_CHOICES, default=interview_default_model)
    candidate_context = models.TextField(default="", blank=True)
    job_description = models.TextField(default="", blank=True)  # <--- Target role Job Description
    question_source = models.CharField(max_length=10, choices=[("ai", "AI generated"), ("local", "Local question bank")], default="ai")
    
    # Stores questions already asked during this interview
    asked_questions = models.JSONField(
        default=list,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.interview_type} - "
            f"{self.duration} min"
        )


class InterviewQuestion(models.Model):
    interview = models.ForeignKey(
        Interview,
        on_delete=models.CASCADE,
        related_name="questions"
    )

    question_number = models.PositiveIntegerField()

    question = models.TextField()
    bank_id = models.CharField(max_length=100, blank=True, default="", db_index=True)
    # Snapshot the rubric so later edits to the JSON do not change this attempt.
    reference_answer = models.TextField(blank=True, default="")
    rubric = models.JSONField(default=list, blank=True)

    answer = models.TextField(
        blank=True,
        default=""
    )

    asked_at = models.DateTimeField(
        auto_now_add=True
    )

    answered_at = models.DateTimeField(
        null=True,
        blank=True
    )
    skipped_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["question_number"]

        constraints = [
            models.UniqueConstraint(
                fields=["interview", "question_number"],
                name="unique_interview_question_number"
            )
        ]

    def __str__(self):
        return f"Interview {self.interview.id} - Question {self.question_number}"


class QuestionProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="question_progress")
    bank_id = models.CharField(max_length=100)
    correctness_score = models.FloatField()
    mastered = models.BooleanField(default=False)
    last_question = models.ForeignKey(InterviewQuestion, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "bank_id"], name="unique_user_bank_progress")]


class QuestionBank(models.Model):
    QUESTION_TYPES = [
        ('conceptual', 'Conceptual / Spoken'),
        ('coding', 'Coding Challenge'),
    ]
    DIFFICULTY_LEVELS = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Full question text or problem statement")
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='conceptual')
    topic = models.CharField(max_length=100, default='General')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='medium')
    
    # Coding specific fields
    starter_code = models.TextField(blank=True, default='')
    solution_code = models.TextField(blank=True, default='')
    test_cases = models.JSONField(blank=True, default=list, help_text="List of input/output test cases")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.get_question_type_display()}] {self.title} ({self.difficulty})"