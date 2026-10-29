#!/bin/sh
set -eu

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "The Docker Compose plugin is required." >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo "Create .env from .env.example before deploying." >&2
  exit 1
fi

docker compose config --quiet
docker compose build --pull
docker compose up -d --remove-orphans --wait
docker compose ps
