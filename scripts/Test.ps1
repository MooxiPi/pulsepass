$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/Use-Java21.ps1"
$root = Split-Path $PSScriptRoot
$configPath = Join-Path $root 'tests/e2e/runtime.local.json'
if (Test-Path $configPath) {
    $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
    $env:PULSEPASS_TEST_DB_URL = 'jdbc:postgresql://127.0.0.1:55432/pulsepass_test'
    $env:PULSEPASS_TEST_DB_USERNAME = 'pulsepass_test'
    $env:PULSEPASS_TEST_DB_PASSWORD = $config.dbPassword
}
Push-Location $root
try { mvn -B verify; if ($LASTEXITCODE -ne 0) { throw 'Maven verification failed.' } } finally { Pop-Location }
