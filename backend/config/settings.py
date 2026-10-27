import sys
from pathlib import Path

# Add shared dependencies path if present
venv_site = Path(__file__).resolve().parent.parent.parent / 'ai-resume-creator' / 'venv' / 'Lib' / 'site-packages'
if venv_site.exists() and str(venv_site) not in sys.path:
    sys.path.insert(0, str(venv_site))
"""
Django settings for BurnettSuite unified application.
Integrates BurnettPeople (HRMS), AI Resume Creator, and AI Interview Platform.
"""
from datetime import timedelta
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Read .env from backend/ or root repository directory
ENV_FILE = BASE_DIR / ".env"
if not ENV_FILE.is_file():
    ENV_FILE = BASE_DIR.parent / ".env"
if ENV_FILE.is_file():
    load_dotenv(str(ENV_FILE))


def env_bool(name: str, default: bool = False) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: list = None) -> list:
    val = os.getenv(name)
    if not val:
        return default or []
    return [item.strip() for item in val.split(",") if item.strip()]


def env_int(name: str, default: int = 0) -> int:
    val = os.getenv(name)
    if val is None:
        return default
    try:
        return int(val.strip())
    except ValueError:
        return default


def env_float(name: str, default: float = 0.0) -> float:
    val = os.getenv(name)
    if val is None:
        return default
    try:
        return float(val.strip())
    except ValueError:
        return default


# Core Security
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "burnett-suite-unified-dev-secret-key-change-in-prod-2026")
DEBUG = env_bool("DJANGO_DEBUG", True)
ALLOWED_HOSTS = env_list(
    "DJANGO_ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1", "backend", "98.92.234.150"]
)

# Application Definition
INSTALLED_APPS = [
    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",

    # Domain 1: BurnettPeople — HRMS & Central Identity
    "accounts",
    "organization",
    "employees",
    "core",
    "attendance",
    "expenses",
    "hr_operations",
    "recognition",
    "status_updates",

    # Domain 2: AI Resume Creator
    "career_profiles",
    "resume_creator",
    "job_descriptions_app",
    "ai_jobs_app",

    # Domain 3: AI Interview Platform
    "interview_platform",
    "evaluations",
    "interview_assistant_app",
    "ai_engine_app",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Central Single Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
DB_ENGINE = os.getenv("DB_ENGINE", "postgresql" if DATABASE_URL else "sqlite").lower()

if DATABASE_URL:
    import urllib.parse
    parsed = urllib.parse.urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": parsed.path.lstrip("/"),
            "USER": parsed.username or "postgres",
            "PASSWORD": parsed.password or "",
            "HOST": parsed.hostname or "localhost",
            "PORT": str(parsed.port or 5432),
            "CONN_MAX_AGE": env_int("DB_CONN_MAX_AGE", 60),
            "CONN_HEALTH_CHECKS": True,
            "OPTIONS": {"sslmode": os.getenv("DB_SSLMODE", "prefer")},
        }
    }
elif DB_ENGINE in ("postgresql", "postgres"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "burnettsuite"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "127.0.0.1"),
            "PORT": os.getenv("DB_PORT", "5432"),
            "CONN_MAX_AGE": env_int("DB_CONN_MAX_AGE", 60),
            "CONN_HEALTH_CHECKS": True,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Single Central User Model
AUTH_USER_MODEL = "accounts.User"

# Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("TIME_ZONE", "Asia/Kolkata")
USE_I18N = True
USE_TZ = True

# Static and Media Files
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# REST Framework Configuration
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "120/min",
        "user": "600/min",
        "ai_jobs": "30/hour",
        "job_import": "30/hour",
        "job_descriptions": "60/hour",
    },
}

# Central JWT Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=6),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# CORS & CSRF Configuration
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
)
CORS_URLS_REGEX = r"^/api/.*$"
CSRF_TRUSTED_ORIGINS = env_list(
    "CSRF_TRUSTED_ORIGINS",
    default=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
)

# Email Configuration
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = env_int("EMAIL_PORT", 25)
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", False)
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@burnettsuite.local")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
FRONTEND_URL = FRONTEND_BASE_URL

# Redis and Celery (Single Background Worker Configuration)
REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TASK_TRACK_STARTED = True
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

# AI Service Configuration — Resume Creator (Ollama)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8001").rstrip("/")
AI_SERVICE_SHARED_TOKEN = os.getenv("AI_SERVICE_SHARED_TOKEN", "burnett-internal-ai-token-2026")

# AI Service Configuration — Interview Platform (AWS Bedrock)
AWS_BEARER_TOKEN_BEDROCK = os.getenv("AWS_BEARER_TOKEN_BEDROCK", "")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "zai.glm-4.7-flash")
BEDROCK_ASSISTANT_MODEL_ID = os.getenv("BEDROCK_ASSISTANT_MODEL_ID", "nvidia.nemotron-super-3-120b")
BEDROCK_BASE_URL = os.getenv("BEDROCK_BASE_URL", f"https://bedrock-mantle.{AWS_REGION}.api.aws/v1")
BEDROCK_PROJECT = os.getenv("BEDROCK_PROJECT", "default")
BEDROCK_TIMEOUT_SECONDS = env_float("BEDROCK_TIMEOUT_SECONDS", 60.0)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# BurnettPeople AI Provider fallback
AI_PROVIDER = os.getenv("AI_PROVIDER", "mock")
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4.1-mini")
AI_TIMEOUT_SECONDS = env_int("AI_TIMEOUT_SECONDS", 8)

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {"format": "{asctime} {levelname} {name} {message}", "style": "{"}
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "standard"}
    },
    "loggers": {
        name: {"handlers": ["console"], "level": os.getenv("LOG_LEVEL", "INFO"), "propagate": False}
        for name in ("accounts", "resume_creator", "interview_platform", "ai_jobs_app", "ai_engine_app")
    },
}
