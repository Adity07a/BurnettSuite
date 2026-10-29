#!/bin/sh
set -eu

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker with the Compose plugin is required." >&2
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example. Replace placeholder secrets, then run this script again." >&2
  exit 1
fi

docker compose -f compose.yaml -f compose.local.yaml config --quiet
docker compose -f compose.yaml -f compose.local.yaml up --build -d --wait
docker compose -f compose.yaml -f compose.local.yaml exec -T interview-api python manage.py seed_local_demo
docker compose -f compose.yaml -f compose.local.yaml ps
