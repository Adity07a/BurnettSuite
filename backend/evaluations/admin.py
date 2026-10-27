from django.contrib import admin
from .models import Evaluation


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'get_candidate',
        'get_interview_details',
        'get_question_number',
        'overall_score',
        'technical_score',
        'evaluated_at'
    )
    list_filter = ('evaluated_at', 'overall_score')
    search_fields = (
        'question__interview__user__username',
        'question__interview__user__first_name',
        'question__question'
    )
    ordering = ('-evaluated_at',)

    readonly_fields = ('evaluated_at',)

    def get_candidate(self, obj):
        return obj.question.interview.user.username
    get_candidate.short_description = 'Candidate'

    def get_interview_details(self, obj):
        interview = obj.question.interview
        return f"Interview #{interview.id} ({interview.interview_type})"
    get_interview_details.short_description = 'Interview'

    def get_question_number(self, obj):
        return f"Q{obj.question.question_number}"
    get_question_number.short_description = 'Question #'