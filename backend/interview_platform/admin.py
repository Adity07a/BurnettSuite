from django.contrib import admin
from .models import Interview, InterviewQuestion


class InterviewQuestionInline(admin.StackedInline):
    model = InterviewQuestion
    extra = 0
    can_delete = False
    readonly_fields = (
        'question_number',
        'question',
        'answer',
        'asked_at',
        'answered_at',
        'get_evaluation_score',
        'get_evaluation_feedback'
    )
    fields = (
        'question_number',
        'question',
        'answer',
        ('asked_at', 'answered_at'),
        'get_evaluation_score',
        'get_evaluation_feedback'
    )

    def get_evaluation_score(self, obj):
        if hasattr(obj, 'evaluation'):
            return f"Overall: {obj.evaluation.overall_score} | Tech: {obj.evaluation.technical_score} | Comm: {obj.evaluation.communication_score}"
        return "Not Evaluated"
    get_evaluation_score.short_description = "Evaluation Scores"

    def get_evaluation_feedback(self, obj):
        if hasattr(obj, 'evaluation'):
            return obj.evaluation.feedback or "No feedback recorded."
        return "-"
    get_evaluation_feedback.short_description = "AI Feedback"


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'get_candidate',
        'interview_type',
        'difficulty',
        'duration',
        'status',
        'created_at'
    )
    list_filter = ('status', 'interview_type', 'difficulty', 'created_at')
    search_fields = ('user__username', 'user__first_name', 'user__email')
    ordering = ('-created_at',)
    inlines = [InterviewQuestionInline]

    def get_candidate(self, obj):
        return obj.user.username
    get_candidate.short_description = 'Candidate'


@admin.register(InterviewQuestion)
class InterviewQuestionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'get_candidate',
        'get_interview_id',
        'question_number',
        'short_question',
        'answered_at'
    )
    list_filter = ('interview__user', 'answered_at')
    search_fields = ('interview__user__username', 'question')
    ordering = ('-id',)

    def get_candidate(self, obj):
        return obj.interview.user.username
    get_candidate.short_description = 'Candidate'

    def get_interview_id(self, obj):
        return f"Interview #{obj.interview.id} ({obj.interview.interview_type})"
    get_interview_id.short_description = 'Interview'

    def short_question(self, obj):
        return (obj.question[:75] + '...') if len(obj.question) > 75 else obj.question
    short_question.short_description = 'Question'