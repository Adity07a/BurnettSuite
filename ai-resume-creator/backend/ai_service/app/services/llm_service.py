"""Provider-neutral text and JSON generation for the Resume AI service."""

import json
from typing import Any

import httpx

from app.core.ai_settings import AISettings


def _messages(prompt: str, system_prompt: str) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    return messages


async def generate_text(
    prompt: str,
    system_prompt: str = "",
    temperature: float = 0.2,
    *,
    json_schema: dict[str, Any] | None = None,
) -> str:
    """Generate text through Ollama or an OpenAI-compatible Bedrock endpoint."""

    settings = AISettings.from_environment()
    settings.validate_for_request()
    if json_schema is not None:
        # Ollama can enforce this schema through its native `format` field.
        # Bedrock models vary in structured-output support, so the schema is
        # also included in the prompt and always validated locally.
        prompt = (
            f"{prompt}\n\nReturn JSON matching this schema exactly:\n"
            f"{json.dumps(json_schema, separators=(',', ':'))}"
        )
    messages = _messages(prompt, system_prompt)

    if settings.provider == "ollama":
        payload: dict[str, Any] = {
            "model": settings.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if json_schema is not None:
            payload["format"] = json_schema
        url = f"{settings.base_url}/api/chat"
        headers: dict[str, str] = {}
    else:
        payload = {
            "model": settings.model,
            "messages": messages,
            "temperature": temperature,
        }
        url = f"{settings.base_url}/chat/completions"
        headers = {"Authorization": f"Bearer {settings.api_key}"}

    try:
        async with httpx.AsyncClient(timeout=settings.timeout_seconds) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
    except httpx.ConnectError as exc:
        raise RuntimeError(
            f"Cannot connect to the {settings.provider} AI provider."
        ) from exc
    except httpx.TimeoutException as exc:
        raise RuntimeError(
            f"The {settings.provider} AI provider timed out."
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"The {settings.provider} AI provider returned HTTP "
            f"{exc.response.status_code}."
        ) from exc

    try:
        body = response.json()
        if settings.provider == "ollama":
            generated = body["message"]["content"]
        else:
            generated = body["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(
            f"The {settings.provider} AI provider returned an invalid response."
        ) from exc

    generated = str(generated or "").strip()
    if not generated:
        raise RuntimeError(
            f"The {settings.provider} AI provider returned an empty response."
        )
    return generated


def _strip_markdown_fence(raw_response: str) -> str:
    cleaned = raw_response.strip()
    if not cleaned.startswith("```"):
        return cleaned
    lines = cleaned.splitlines()
    if lines and lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]
    return "\n".join(lines).strip()


async def generate_json(
    prompt: str,
    system_prompt: str = "",
    temperature: float = 0.1,
    *,
    json_schema: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Generate and parse a JSON object, with optional Ollama schema guidance."""

    raw_response = await generate_text(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=temperature,
        json_schema=json_schema,
    )
    cleaned_response = _strip_markdown_fence(raw_response)
    try:
        parsed = json.loads(cleaned_response)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "The AI provider did not return valid JSON. Please try again."
        ) from exc
    if not isinstance(parsed, dict):
        raise RuntimeError("The AI response must be a JSON object.")
    return parsed
