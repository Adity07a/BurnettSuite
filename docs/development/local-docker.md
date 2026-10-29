# Local Docker development

## Start

From the repository root on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-local.ps1
```

On Linux or macOS:

```sh
sh scripts/start-local.sh
```

The first invocation creates `.env` and stops so placeholder secrets can be
changed. The second invocation validates Compose, builds all application images,
starts PostgreSQL and Redis, applies migrations, collects static files, and
waits for health checks. AI features use Amazon Bedrock and do not download a
local model.

## Local addresses

- Platform launcher: `http://localhost`
- Interview: `http://localhost:8081`
- Resume: `http://localhost:8082`
- BurnettPeople: `http://localhost:8083`

The gateway also retains the `*.localhost` hostname routes for environments
that resolve wildcard localhost names. Dedicated ports work consistently on
Windows without editing the machine's hosts file.

## Central demo login

The local start script creates one central identity:

- Email: `interview.demo@burnett.local`
- Mobile: `+919900000101`
- Password: `BurnettLocal!2026` (or `DEMO_USER_PASSWORD` from `.env`)

Open `http://localhost/login`. After login, the same HttpOnly cookie session is
valid on ports 8081, 8082, and 8083. Resume and People create their product-local
profiles automatically on first access.

## Operations

```sh
docker compose -f compose.yaml -f compose.local.yaml ps
docker compose -f compose.yaml -f compose.local.yaml logs -f
docker compose -f compose.yaml -f compose.local.yaml down
```

Use `down`, without `--volumes`, to preserve local databases. Removing volumes
deletes that local state.

## Provider selection

All three products use Amazon Bedrock by default. Set
`AWS_BEARER_TOKEN_BEDROCK` in the ignored root `.env`; the stack itself can
start without a key, but provider-backed AI requests require one. The key must
belong to the same AWS Region configured by `AWS_REGION`.

## First validation after Docker installation

Run these checks before feature testing:

```sh
docker compose -f compose.yaml -f compose.local.yaml config --quiet
docker compose -f compose.yaml -f compose.local.yaml build
docker compose -f compose.yaml -f compose.local.yaml up -d --wait
docker compose -f compose.yaml -f compose.local.yaml ps
```

Then test the central registration page and both email/mobile login paths before
opening each product and testing AI flows.
