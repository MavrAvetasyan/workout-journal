$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $projectRoot "wwwroot"
$targetDir = Join-Path $projectRoot "docs"

if (-not (Test-Path $sourceDir)) {
  throw "Source directory not found: $sourceDir"
}

if (Test-Path $targetDir) {
  Remove-Item -LiteralPath $targetDir -Recurse -Force
}

New-Item -ItemType Directory -Path $targetDir | Out-Null
Copy-Item -Path (Join-Path $sourceDir "*") -Destination $targetDir -Recurse -Force
New-Item -ItemType File -Path (Join-Path $targetDir ".nojekyll") | Out-Null

Write-Host "Static site prepared in $targetDir"
