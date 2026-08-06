param(
  [string]$RepoRoot = (Resolve-Path "$PSScriptRoot\..").Path
)

$ErrorActionPreference = "Stop"
$marketplaceRoot = $RepoRoot
$pluginName = "huaweicloud-core"
$marketplaceName = "huaweicloud-agent-toolkit"

Write-Host "Registering local Codex marketplace from: $marketplaceRoot"
codex plugin marketplace add $marketplaceRoot

Write-Host "Installing plugin: $pluginName@$marketplaceName"
codex plugin add "$pluginName@$marketplaceName"

Write-Host "Done. Start a new Codex thread and mention @huaweicloud-core."
