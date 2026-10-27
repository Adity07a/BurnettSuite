FROM python:3.13-slim
WORKDIR /app

ENV PIP_DEFAULT_TIMEOUT=300 \
    PIP_RETRIES=10 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


COPY requirements.txt /app/
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY . /app/

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
