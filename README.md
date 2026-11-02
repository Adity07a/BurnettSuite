# BurnettSuite

BurnettSuite contains three independently deployable products behind one
gateway and platform launcher:

- AI Interview Platform
- AI Resume Creator
- BurnettPeople

## Supported runtime

- Python 3.13
- Django 5.2 LTS
- Node.js 22
- PostgreSQL 16
- Redis 7

Each product has one reviewed Python dependency manifest at its product root.
The legacy backend `requirements.txt` files are compatibility entry points.

## Run the complete suite

1. Run `powershell -ExecutionPolicy Bypass -File scripts/start-local.ps1` on
   Windows, or `sh scripts/start-local.sh` on Linux/macOS.
2. On the first run, edit the generated `.env` and replace placeholder secrets.
3. Add an Amazon Bedrock API key to `AWS_BEARER_TOKEN_BEDROCK` in `.env` when
   testing AI features, then run the script again. No local model is downloaded.
4. Open `http://localhost` and sign in once for all three products.

The base `compose.yaml` and local override use Amazon Bedrock by default.
`compose.local.yaml` only enables deterministic local demo accounts.
See `docs/development/local-docker.md` for commands and troubleshooting.

The centralized `Dockerfile` uses separate targets for APIs, workers, and the
gateway. Compose starts them together while preserving independent health
checks and restarts.

## Authentication contract

The platform provides one login and registration screen for all three products.
The central login request is:

```json
{"identifier":"email@example.com or mobile number","password":"..."}
```

This is a first-party suite session, not social login or an external identity
provider. Interview temporarily owns the credential record. Its signed JWTs are
stored in HttpOnly cookies and accepted by all products. Resume and People keep
their own databases and create a bounded local profile when an authenticated
suite user first opens that product.

The shared header contains Interview, Resume, People, Login, Register, and
Logout navigation. Product-specific login and registration routes redirect to
the central screens.

Django username columns are retained only as generated internal keys where an
existing schema inherited them. They are not public identifiers and cannot be
used to log in.

## Security status

The Interview code-run endpoint is disabled until an isolated, resource-limited
runner is implemented. User code must never execute in an API or worker process.

See `docs/deployment/ec2.md` for the EC2 deployment checklist.
See `docs/refactoring-backlog.md` for the ordered follow-up work.
