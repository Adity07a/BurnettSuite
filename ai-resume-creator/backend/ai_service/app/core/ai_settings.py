"""Single source of truth for Resume AI provider configuration.

Ollama remains available for local/offline development. ``bedrock`` uses the
OpenAI-compatible Amazon Bedrock endpoint already used by the Interview app.
Keeping provider selection in environment variables lets the same container
image run locally and on EC2 without code changes.
"""

from dataclasses import dataclass
import os


SUPPORTED_PROVIDERS = {"ollama", "bedrock", "openai_compatible"}


@dataclass(frozen=True)
class AISettings:
    provider: str
    model: str
    base_url: str
    api_key: str
    timeout_seconds: float

    @classmethod
    def from_environment(cls) -> "AISettings":
        provider = os.getenv("AI_PROVIDER", os.getenv("LLM_PROVIDER", "ollama"))
        provider = provider.strip().lower()
        if provider not in SUPPORTED_PROVIDERS:
            supported = ", ".join(sorted(SUPPORTED_PROVIDERS))
            raise RuntimeError(
                f"Unsupported AI provider '{provider}'. Supported providers: {supported}."
            )

        region = os.getenv("AWS_REGION", "us-east-1").strip()
        if provider == "ollama":
            model = (
                os.getenv("AI_MODEL")
                or os.getenv("OLLAMA_MODEL")
                or "qwen2.5:3b"
            )
            base_url = (
                os.getenv("AI_BASE_URL")
                or os.getenv("OLLAMA_BASE_URL")
                or "http://localhost:11434"
            )
            api_key = ""
        else:
            model = (
                os.getenv("AI_MODEL")
                or os.getenv("BEDROCK_MODEL_ID")
                or "zai.glm-4.7-flash"
            )
            base_url = (
                os.getenv("AI_BASE_URL")
                or os.getenv("BEDROCK_BASE_URL")
                or f"https://bedrock-mantle.{region}.api.aws/v1"
            )
            api_key = (
                os.getenv("AI_API_KEY")
                or os.getenv("AWS_BEARER_TOKEN_BEDROCK")
                or ""
            ).strip()

        return cls(
            provider=provider,
            model=model.strip(),
            base_url=base_url.rstrip("/"),
            api_key=api_key,
            timeout_seconds=float(os.getenv("AI_TIMEOUT_SECONDS", "180")),
        )

    def validate_for_request(self) -> None:
        if not self.model:
            raise RuntimeError("AI_MODEL is not configured.")
        if not self.base_url:
            raise RuntimeError("AI_BASE_URL is not configured.")
        if self.provider != "ollama" and not self.api_key:
            raise RuntimeError(
                "AI_API_KEY or AWS_BEARER_TOKEN_BEDROCK is required for this provider."
            )
