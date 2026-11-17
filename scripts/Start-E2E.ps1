param([int]$Port = 18080)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/Use-Java21.ps1"
$root = Split-Path $PSScriptRoot
$configPath = Join-Path $root 'tests/e2e/runtime.local.json'
if (-not (Test-Path $configPath)) { throw 'Prepare runtime.local.json as described in tests/e2e/README.md; no production credentials.' }
$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
$env:DB_URL = 'jdbc:postgresql://127.0.0.1:55432/pulsepass_e2e'
$env:DB_USERNAME = 'pulsepass_test'
$env:DB_PASSWORD = $config.dbPassword
$env:PULSEPASS_JWT_SECRET_BASE64 = $config.jwtSecret
$env:SERVER_PORT = "$Port"
Push-Location $root
try { & "$env:JAVA_HOME/bin/java.exe" -jar 'target/pulsepass-0.0.1-SNAPSHOT.jar' } finally { Pop-Location }
