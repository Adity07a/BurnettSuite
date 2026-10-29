# syntax=docker/dockerfile:1.7

# One centralized Dockerfile with isolated runtime targets. Build a target with:
#   docker build --target interview-api .
# The root compose.yaml builds and starts every target as one BurnettSuite stack.

FROM python:3.13-slim AS python-base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1
RUN useradd --create-home --uid 10001 appuser

FROM python-base AS interview-api
WORKDIR /app
COPY ai-interview-platform/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt
COPY --chown=appuser:appuser ai-interview-platform/backend/ /app/
RUN mkdir -p /app/media /app/staticfiles && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]

FROM python-base AS resume-api
WORKDIR /app
COPY ai-resume-creator/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt
COPY --chown=appuser:appuser ai-resume-creator/backend/django_backend/ /app/
RUN mkdir -p /app/media /app/staticfiles && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]

FROM python-base AS resume-ai
WORKDIR /app
COPY ai-resume-creator/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt
COPY --chown=appuser:appuser ai-resume-creator/backend/ai_service/ /app/
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2", "--proxy-headers"]

FROM python-base AS people-api
WORKDIR /app
COPY BurnettPeople/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt
COPY --chown=appuser:appuser BurnettPeople/backend/ /app/
RUN mkdir -p /app/media /app/staticfiles && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]

FROM node:22-alpine AS interview-web
WORKDIR /build
COPY ai-interview-platform/frontend/package*.json ./
RUN npm ci
COPY ai-interview-platform/frontend/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build
RUN sed -i 's#</head>#<link rel="stylesheet" href="/suite-assets/shell.css"><script src="/suite-assets/shell.js" defer></script></head>#' dist/index.html

FROM node:22-alpine AS resume-web
WORKDIR /build
COPY ai-resume-creator/frontend/package*.json ./
RUN npm ci
COPY ai-resume-creator/frontend/ ./
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build
RUN sed -i 's#</head>#<link rel="stylesheet" href="/suite-assets/shell.css"><script src="/suite-assets/shell.js" defer></script></head>#' dist/index.html

FROM node:22-alpine AS people-web
WORKDIR /build
COPY BurnettPeople/frontend/package*.json ./
RUN npm ci
COPY BurnettPeople/frontend/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build
RUN sed -i 's#</head>#<link rel="stylesheet" href="/suite-assets/shell.css"><script src="/suite-assets/shell.js" defer></script></head>#' dist/index.html

FROM nginx:1.29-alpine AS gateway
COPY infrastructure/gateway/default.conf.template /etc/nginx/templates/default.conf.template
COPY infrastructure/gateway/platform/ /usr/share/nginx/html/platform/
COPY infrastructure/gateway/suite/ /usr/share/nginx/html/suite-assets/
COPY --from=interview-web /build/dist/ /usr/share/nginx/html/interview/
COPY --from=resume-web /build/dist/ /usr/share/nginx/html/resume/
COPY --from=people-web /build/dist/ /usr/share/nginx/html/people/
EXPOSE 80
