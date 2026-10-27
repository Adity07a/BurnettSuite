import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

try:
    from celery import Celery
    app = Celery("burnettsuite")
    app.config_from_object("django.conf:settings", namespace="CELERY")
    app.autodiscover_tasks()
except ImportError:
    app = None
