param(
  [string]$RepoRoot = (Resolve-Path "$PSScriptRoot\..").Path
)

$ErrorActionPreference = "Stop"
$marketplaceRoot = $RepoRoot
$pluginName = "huaweicloud-core"

$marketplaceJson = Join-Path $RepoRoot ".agents\plugins\marketplace.json"
if (Test-Path $marketplaceJson) {
  $marketplaceName = (Get-Content $marketplaceJson -Raw | ConvertFrom-Json).name
  if (-not $marketplaceName) { $marketplaceName = "huaweicloud-devkit" }
} else {
  $marketplaceName = "huaweicloud-devkit"
}

Write-Host "Registering local Codex marketplace from: $marketplaceRoot"
codex plugin marketplace add $marketplaceRoot
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERROR: Failed to register marketplace. Exit code: $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "Installing plugin: $pluginName@$marketplaceName"
codex plugin add "$pluginName@$marketplaceName"
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERROR: Failed to install plugin. Exit code: $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "Done. Start a new Codex thread and mention @huaweicloud-core."
