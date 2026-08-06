param(
  [string]$RepoRoot = (Resolve-Path "$PSScriptRoot\..").Path,
  [string]$OpenCodeConfigRoot = "$HOME\.config\opencode"
)

$ErrorActionPreference = "Stop"

$sourceSkills = Join-Path $RepoRoot "plugins\huaweicloud-core\skills"
$targetSkills = Join-Path $OpenCodeConfigRoot "skills"
$targetCommands = Join-Path $OpenCodeConfigRoot "commands"

New-Item -ItemType Directory -Force -Path $targetSkills | Out-Null
New-Item -ItemType Directory -Force -Path $targetCommands | Out-Null

Copy-Item -Recurse -Force -Path (Join-Path $sourceSkills "*") -Destination $targetSkills
Copy-Item -Recurse -Force -Path (Join-Path $RepoRoot "integrations\opencode\commands\*") -Destination $targetCommands

Write-Host "OpenCode skills installed to: $targetSkills"
Write-Host "OpenCode commands installed to: $targetCommands"
Write-Host "Add the MCP section from integrations/opencode/opencode.json to your OpenCode config if you want local tools."
