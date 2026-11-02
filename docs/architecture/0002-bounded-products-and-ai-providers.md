# ADR 0002: Bounded product models and shared AI contract

Status: accepted for the current refactoring phase.

## Context

BurnettSuite contains three products with different account lifecycles and data
ownership rules. BurnettPeople provisions employees, while Interview and Resume
support candidate self-registration. Their existing migrations and production
data are independent.

The products also used different AI transports: Interview used Amazon Bedrock's
OpenAI-compatible endpoint, Resume called Ollama directly in multiple modules,
and BurnettPeople used a generic OpenAI-compatible HTTP call.

## Decision

- Keep Django models and databases inside their owning product. A centralized
  database model would couple deployment order and migrations and would make a
  failure in one product capable of blocking all three.
- Share API contracts and environment-variable conventions instead of database
  tables. Authentication uses `identifier` plus `password`; AI configuration
  uses provider, model, base URL, key, and timeout values.
- Use Amazon Bedrock as the default AI provider for local Docker and EC2. Keep
  provider selection behind one service boundary; no local Ollama container or
  model download is required.
- Keep model response validation inside each product because Interview,
  Resume, and People require different schemas and safety rules.

## Compatibility

Legacy Resume variables `LLM_PROVIDER` and `OLLAMA_MODEL` remain fallback inputs.
Existing Interview Bedrock variables remain supported. BurnettPeople accepts
both `bedrock` and the previous `openai_compatible` provider name.

## Consequences

The suite gains one deployment topology and consistent configuration without a
high-risk database merger. Small normalization helpers may remain duplicated at
product boundaries; this is preferred to creating a runtime dependency between
independently deployed authentication systems.
