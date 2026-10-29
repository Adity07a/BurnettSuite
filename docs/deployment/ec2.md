# EC2 deployment

## Recommended topology

Use one EC2 instance initially with Docker Compose, an encrypted EBS volume,
and an Application Load Balancer or trusted TLS reverse proxy in front of port
80. Point the platform, interview, resume, and people hostnames at the load
balancer.

For production, prefer managed PostgreSQL and Redis. The database containers in
`compose.yaml` are suitable for development and an initial controlled pilot,
but they should not be treated as a replacement for backups, failover, and
database monitoring.

## Host preparation

1. Install Docker Engine with the Compose plugin.
2. Clone the repository into `/opt/burnett-suite`.
3. Copy `.env.example` to `.env`, set production hostnames, and generate unique
   secrets and database passwords. Set `PUBLIC_SCHEME=https` after TLS is
   configured so email links, CORS, and CSRF origins use the public scheme.
   When using managed PostgreSQL, set `PEOPLE_DB_SSLMODE=require` and override
   the discrete database host/name/user/password variables and Compose
   dependencies for the managed connection topology.
4. Restrict `.env` to the deployment account: `chmod 600 .env`.
5. Configure DNS and TLS before enabling `SECURE_SSL_REDIRECT=true` and
   `SECURE_COOKIES=true`.
6. Grant the EC2 workload access to Amazon Bedrock. Prefer an instance role or
   automatically refreshed short-term credentials for production.

## Amazon Bedrock

All three products use the Bedrock OpenAI-compatible endpoint. For an initial
test deployment, configure the shared token and Region:

```dotenv
AWS_REGION=us-east-1
AWS_BEARER_TOKEN_BEDROCK=<bedrock-api-key>
RESUME_AI_PROVIDER=bedrock
PEOPLE_AI_PROVIDER=bedrock
```

Product-specific model, endpoint, and key variables remain available as
overrides. Keep keys in the EC2 secret-management/deployment layer, never in the
repository. Long-term Bedrock keys are intended for exploration; production
should use short-term credentials or an EC2 IAM role.

## Deploy or update

From `/opt/burnett-suite`:

```sh
sh scripts/deploy-ec2.sh
```

The script validates required tooling and configuration, builds the centralized
Docker targets, starts the stack, and waits for Compose health checks. Database
migrations run in the API startup commands before Gunicorn starts.

## Operations

```sh
docker compose ps
docker compose logs -f gateway interview-api resume-api people-api
docker compose exec interview-api python manage.py createsuperuser
docker compose exec resume-api python manage.py createsuperuser
docker compose exec people-api python manage.py createsuperuser
```

Back up all PostgreSQL databases and uploaded Interview media before upgrades.
Test restore procedures on a separate instance.
