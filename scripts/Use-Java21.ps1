$ErrorActionPreference = 'Stop'
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME/bin/javac.exe")) {
    $jdk = Get-ChildItem "$env:USERPROFILE/.jdks" -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match '21[.]' } | Select-Object -First 1
    if (-not $jdk) { throw 'Configure JAVA_HOME pointing to JDK 21.' }
    $env:JAVA_HOME = $jdk.FullName
}
$env:PATH = "$env:JAVA_HOME/bin;$env:PATH"
