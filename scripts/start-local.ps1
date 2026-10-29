$ErrorActionPreference = "Stop"

$dockerCli = (Get-Command docker -ErrorAction SilentlyContinue).Source
if (-not $dockerCli) {
    $dockerCli = Join-Path $env:LOCALAPPDATA "Programs\DockerDesktop\resources\bin\docker.exe"
}
if (-not (Test-Path -LiteralPath $dockerCli)) {
    throw "Docker Desktop CLI was not found."
}

if (-not (Test-Path -LiteralPath ".env")) {
    Copy-Item -LiteralPath ".env.example" -Destination ".env"
    Write-Host "Created .env from .env.example. Replace placeholder secrets, then run this script again."
    exit 1
}

& $dockerCli compose -f compose.yaml -f compose.local.yaml config --quiet
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $dockerCli compose -f compose.yaml -f compose.local.yaml up --build -d --wait
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $dockerCli compose -f compose.yaml -f compose.local.yaml exec -T interview-api python manage.py seed_local_demo
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $dockerCli compose -f compose.yaml -f compose.local.yaml ps
