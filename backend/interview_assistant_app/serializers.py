from rest_framework import serializers
from ai_engine_app.model_catalog import MODEL_CHOICES


class HistoryMessageSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=["user", "assistant"])
    content = serializers.CharField(max_length=4000)


class AssistantQuestionSerializer(serializers.Serializer):
    model_id = serializers.ChoiceField(choices=MODEL_CHOICES, required=False)
    refine = serializers.BooleanField(default=False)
    question = serializers.CharField(max_length=4000)
    mode = serializers.ChoiceField(choices=["learn", "practice", "feedback"], default="learn")
    history = HistoryMessageSerializer(many=True, required=False, default=list)

    def validate_history(self, history):
        if len(history) > 6:
            raise serializers.ValidationError("Send at most six recent messages.")
        return history
