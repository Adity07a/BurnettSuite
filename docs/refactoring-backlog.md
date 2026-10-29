# Refactoring backlog

This milestone establishes the suite boundary, deployment baseline, and common
authentication contract. The remaining work should be completed in small,
testable changes in this order.

## 1. Validate the backend baseline

- Run all Django migrations and tests in Linux containers.
- Add API integration tests for email login, mobile login, duplicate mobile
  rejection, inactive users, refresh, logout, and password reset.
- Import a sanitized production-data snapshot and report normalized email and
  mobile collisions before changing any existing account records.
- Build every Docker target and exercise all health checks through Nginx.

## 2. Production readiness

- Choose EC2 instance sizing and whether PostgreSQL/Redis move to RDS and
  ElastiCache.
- Configure DNS, ALB TLS, SMTP, secrets storage, EBS snapshots, database
  backups, log retention, metrics, and alarms.
- Replace test Bedrock bearer keys with automatically refreshed short-term
  credentials or EC2 instance-role authentication for production.
- Perform a restore drill and a rolling-deployment rehearsal before launch.

## 3. Security completion

- Keep Interview code execution disabled until it runs in an isolated sandbox
  with no application credentials, no unrestricted network, strict CPU/memory/
  process/time limits, and disposable filesystems.
- Add login throttling and account-lockout telemetry consistently across all
  products.
- Add central-login throttling, refresh-token rotation, and signing-key rotation.
- Add dependency, secret, container, and static-analysis scanning to CI.

## 4. Maintainability

- Resolve the Interview frontend hook/lint backlog and make lint blocking.
- Split the largest dashboards and API modules by feature boundary.
- Extract shared UI tokens and request/error-handling helpers into versioned
  packages only where all three products have the same behavior.
- Code-split the Resume frontend's large initial JavaScript bundle.
- Add OpenAPI schemas and generated contract checks for frontend API clients.

## 5. Product policy decisions

- Confirm which products allow public self-registration. BurnettPeople should
  normally remain invitation/provisioning based.
- Define mobile-number country-code rules, verification, recovery, suspension,
  deletion, and employee-offboarding behavior.
- Decide whether the platform launcher becomes a personalized dashboard after
  login or remains a shared product launcher.
