from rest_framework import serializers
from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):

    def validate_file(self, file):
        if not file.name.lower().endswith((".pdf", ".docx")):
            raise serializers.ValidationError("Only PDF and DOCX resumes are supported.")
        if file.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Resume files must be 10 MB or smaller.")
        return file

    class Meta:
        model = Resume
        fields = [
            "id",
            "file",
            "uploaded_at",
            "extracted_text",
        ]

        read_only_fields = [
            "id",
            "uploaded_at",
            "extracted_text",
        ]
