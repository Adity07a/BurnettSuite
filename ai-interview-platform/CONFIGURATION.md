Frontend API configuration
==========================

All frontend requests share `frontend/src/services/api.js`, including token refresh.
`VITE_API_BASE_URL` is the API root, including `/api`:

- Development: `http://127.0.0.1:8000/api`
- Production: `/api` (the same origin as the frontend; the web server must proxy
  `/api/` to Django without removing the prefix).
- If the backend is hosted separately, set `VITE_API_BASE_URL` to its full API
  root, for example `https://backend.example.com/api`, and rebuild the frontend.

Registration uses `/api/users/register/`, login uses `/api/users/login/`, and
refresh uses `/api/users/token/refresh/`. Other endpoints share the `/api/` prefix.
The backend retains `/users/` routes for compatibility with older clients.

Set `FRONTEND_URL` in the backend environment to the frontend's public origin.
It is used for AI provider attribution and the default CORS allowlist. For a
separate backend origin, set `CORS_ALLOWED_ORIGINS` to comma-separated frontend
origins (scheme, host, and optional port, with no path). Local development allows
both `http://localhost:5173` and `http://127.0.0.1:5173` by default.

Question generation logs
========================

Logs go to backend stderr, visible in the server terminal or its service/container
logs. `AI_LOG_LEVEL` defaults to `INFO`. Each log includes a timestamp and level.
Generation logs include a `generation_id`, interview ID, question number, model,
region, provider, and elapsed milliseconds. Provider failures include exception
type, HTTP status, provider request ID, and error code. Empty or truncated
responses are failures. Provider failures return an error for retry instead of canned questions. Resume
API logs also include a resume ID and generation ID. There are no free-model
fallback API calls.

The `/api/ai/question/<interview_id>/` response includes `generation_id` on success
or generation failure so it can be matched to server logs. Resume text, prompts,
credentials, and raw provider response bodies are excluded from these logs.

Restart the backend and rebuild/redeploy the frontend after configuration changes.

Production readiness
====================

Set these backend environment values before deployment:

- `DJANGO_DEBUG=false`
- `DJANGO_SECRET_KEY`: a new random secret (required with debug disabled).
- `DJANGO_ALLOWED_HOSTS`: comma-separated backend hostnames, without schemes.
- `DB_PASSWORD`: the PostgreSQL password; there is no hardcoded fallback.
- `AWS_BEARER_TOKEN_BEDROCK`, `AWS_REGION`, and `BEDROCK_MODEL_ID` for resume analysis,
  question generation, and answer evaluation. The existing model is
  `zai.glm-4.7-flash` in `us-east-1`. The OpenAI-compatible endpoint defaults to
  `https://bedrock-mantle.<AWS_REGION>.api.aws/v1`; `BEDROCK_BASE_URL` can override
  it. `BEDROCK_PROJECT` defaults to `default`.
- `FRONTEND_URL`: the HTTPS frontend origin.

Configure HTTPS at the reverse proxy; browser microphone access requires a secure
origin (localhost is a development exception). Once HTTPS is configured, set
`DJANGO_SECURE_COOKIES=true`. Configure HTTP-to-HTTPS redirects at the proxy or
set `DJANGO_SECURE_SSL_REDIRECT=true` after configuring trusted proxy scheme
handling. Enable `DJANGO_SECURE_HSTS_SECONDS` only after HTTPS works correctly.

All three AI operations use the configured paid Bedrock model. Questions rotate
through interview-type-specific topics and reject exact or close text duplicates.
Rejected question output is retried once; provider failures are not retried.
Question prompts include resume and project context and a 256-token output limit.
The frontend evaluates saved answers while loading the next question, and offers
a retry if evaluation fails. Completion waits for pending evaluations.
`BEDROCK_TIMEOUT_SECONDS` defaults to 60 seconds, and SDK retries are disabled.
Set Gunicorn and reverse-proxy request timeouts above the maximum request duration (a question may use two calls)
(for example, 120 seconds), or move AI work to a background job. The deployment
workflow does not currently set the Gunicorn timeout or configure the proxy.
Resume upload analyzes synchronously; provider failures preserve the uploaded
resume and return `analysis_status=failed`. No background retry is scheduled.

Local verification without PostgreSQL:

Local development now defaults to SQLite at `backend/db.sqlite3` when
`DJANGO_DEBUG=true`. Run `python manage.py migrate` to initialize it. PostgreSQL
configuration is retained but inactive locally; set `DB_ENGINE=postgresql` to
select it explicitly. With `DJANGO_DEBUG=false`, PostgreSQL remains the default.
Existing PostgreSQL data is not copied into SQLite; register a local account.

```
cd backend
python manage.py test users resumes ai_engine evaluations interviews --settings=config.test_settings
python manage.py makemigrations --check --dry-run --settings=config.test_settings
```

This uses an isolated in-memory SQLite database and mocked AI calls. Verify
PostgreSQL migrations and the full registration/upload/interview/evaluation flow
against the deployed environment separately. Local tests cannot confirm provider
credentials, model availability, HTTPS, proxy routing, or production concurrency.

Interview Help Assistant
========================

Open `/assistant` or click Assistant in the navigation. A navigation click starts
voice input immediately (subject to browser microphone permission). Stop the
microphone to review and edit the transcript before sending (the default).
Voice input uses the browser Web Speech API, independently of the Bedrock response
model. Select English (India), English (US), or English (UK); the default is
English (India). Technical vocabulary hints are applied when supported by the
browser. Ambiguous LangChain/LangGraph spellings offer an explicit correction.
Optional automatic sending waits for finalized results and a 2.5-second pause;
suggested corrections require review. Sending stops the microphone.
The application plays no prompts, readiness sounds,
or spoken answers. Browser/OS microphone indications are controlled by the browser.
Leaving the page stops recognition and cancels pending requests and timers.

The authenticated endpoint is `POST /api/assistant/answer/` with `question` and
optional `mode` (`learn`, `practice`, or `feedback`, default `learn`). It uses
`BEDROCK_ASSISTANT_MODEL_ID`, defaulting to `nvidia.nemotron-super-3-120b`,
and returns text only. Interview questions, evaluations, and resume analysis
continue using `BEDROCK_MODEL_ID` (`zai.glm-4.7-flash`). Both models use the
configured Bedrock endpoint and credentials. Restart the backend after changing
model settings. Conversation history is stored per authenticated user until
they start a new conversation. Voice recognition requires a supported
browser and localhost or HTTPS; typed chat works without microphone access.

Run assistant tests with `python manage.py test interview_assistant`.


Model selection and response refinement
=======================================

Assistant and interview setup offer Google Gemma 3 4B IT
(`google.gemma-3-4b-it`), NVIDIA Nemotron Super 3
(`nvidia.nemotron-super-3-120b`), and GLM 4.7 Flash (`zai.glm-4.7-flash`).
All use the existing Bedrock credentials and regional endpoint. Ensure these
models are available to your AWS account in the configured region. Defaults
remain `BEDROCK_ASSISTANT_MODEL_ID` and `BEDROCK_MODEL_ID`; set those to one of
the supported IDs. Resume analysis continues using `BEDROCK_MODEL_ID`.

Run `python manage.py migrate` before restarting the backend. Rebuild the frontend.
The authenticated `/api/ai/models/` endpoint supplies both selectors.
An interview stores its selected model and candidate resume/project context at
creation; question generation and evaluation use that model throughout.
Assistant model changes preserve the same server-side conversation and candidate
context. Reload restores history and the last model used. New conversation ends
the old chat and captures the latest resume on the next message.

The assistant's optional refinement checkbox performs a second call to the same
selected model using the question, history, resume, interaction mode, and draft.
Only the refined answer is persisted and returned. This adds latency and token
cost; if either call fails, the turn is not saved and can be retried.
Practice asks one question at a time and provides feedback after an attempt.
Interview prompts rotate topics, reject repeated questions, and request deeper
reasoning or concrete examples based on preceding answers. These instructions
improve consistency but cannot guarantee factual correctness of model output.


Interview audio now uses Edge TTS `hi-IN-SwaraNeural`, including for English
question text, matching the selected sample. Install backend requirements and
restart Django. The authenticated question speech endpoint returns MP3 audio
only for questions owned by the user. It caches generated audio in the Django
cache for one hour. The default local-memory cache is process-local and temporary.
Question text is sent to Microsoft's online speech service; internet is required.
No paid TTS API key is configured. Browser speech is used if generation or audio
playback fails. Ending/leaving an interview stops pending audio and requests.

Local practice repeats and skipping
===================================

After a local-bank question finishes playing and the microphone starts, wait
three seconds for speech onset. If none is detected, read the question again,
at most twice more, with the same three-second wait after each reading. If there
is still no speech after the second repeat, skip and load another question.
Speech onset or an interim transcript cancels the repeat/skip countdown.
The existing five-second pause after answering still submits the answer.
Microphone failure pauses automatic advancement; it is not treated as silence.

Change question skips immediately, stopping old playback, recognition and timers.
Skipped questions are recorded but not scored or mastered, and remain eligible
in later local sessions. Apply the `skipped_at` migration before restarting.

Swara troubleshooting
=====================

Install the updated `backend/requirements.txt` in the environment used by the
running server (including edge-tts, aiohttp, tabulate and pinned dependencies),
run migrations and restart the backend. Swara is generated server-side: the
friend's browser does not need Swara installed as an OS voice.

Inspect the authenticated question `/speech/` request in browser Network:

- 503 / `voice_dependency_missing`: install requirements in the actual server
  environment and restart it.
- 504 / `voice_timeout`: provider synthesis exceeded the server timeout.
- 502 / `voice_provider_error`: inspect `interview_speech_failed` server logs;
  check outbound HTTPS/WebSocket access to the provider, DNS, proxy and TLS.
- 404: check deployed backend version and reverse proxy API routing.
- 401/403: check authentication and question ownership.
- 200 but `NotAllowedError`: browser autoplay was blocked. Tap Play question;
  the page retries the already-fetched audio directly from that click.

The page reports these categories separately, and browser fallback remains
available for generation/decoding failures. A live local Swara synthesis check
passed during development; without the friend's request status/server log, their
original failure cannot be attributed to a specific cause. Use HTTPS for deployed
microphone access and configure the frontend API URL for the reachable backend,
not the friend's own localhost.
