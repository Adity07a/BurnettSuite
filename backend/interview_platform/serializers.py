from rest_framework import serializers
from .models import QuestionBank
from .models import Interview


class InterviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Interview
        fields = [
            "id",
            "interview_type",
            "difficulty",
            "model_id",
            "question_source",
            "duration",
            "job_description",
            "status",
            "created_at",
            "started_at",
            "completed_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "created_at",
            "started_at",
            "completed_at",
        ]


class QuestionBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBank
        fields = '__all__'