$ErrorActionPreference = "Stop"

$dockerCli = (Get-Command docker -ErrorAction SilentlyContinue).Source
if (-not $dockerCli) {
    $dockerCli = Join-Path $env:LOCALAPPDATA "Programs\DockerDesktop\resources\bin\docker.exe"
}
if (-not (Test-Path -LiteralPath $dockerCli)) {
    throw "Docker Desktop CLI was not found."
}

$compose = @("compose", "-f", "compose.yaml", "-f", "compose.local.yaml")
& $dockerCli @compose exec -T interview-api python manage.py seed_local_demo
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Central demo identity is ready. Resume and People profiles are created on first access."
