from django.conf import settings


MODEL_CHOICES = [
    ("google.gemma-3-4b-it", "Google Gemma 3 4B IT"),
    ("nvidia.nemotron-super-3-120b", "NVIDIA Nemotron Super 3"),
    ("zai.glm-4.7-flash", "GLM 4.7 Flash"),
]


def assistant_default_model():
    return settings.BEDROCK_ASSISTANT_MODEL_ID


def interview_default_model():
    return settings.BEDROCK_MODEL_ID
