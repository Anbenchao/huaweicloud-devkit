# Huawei Cloud Agent Toolkit

Huawei Cloud Agent Toolkit helps coding agents use Huawei Cloud Skills, KooCLI, APIs, SDKs, and future MCP tools with less context, safer execution, and more accurate implementation decisions.

This project follows the useful shape of `aws/agent-toolkit-for-aws`, but keeps V1 focused on guidance, routing, safety, and local CLI/API enablement instead of trying to re-document every Huawei Cloud service.

## What V1 Provides

- Codex plugin package: `plugins/huaweicloud-core`
- OpenCode integration assets: `integrations/opencode`
- Compact meta-skills for capability routing, KooCLI/auth, API/SDK usage, safety, and troubleshooting
- A zero-dependency Node.js MCP server for safe planning and read-only Huawei Cloud CLI usage
- A hook-based safety layer for agents that support `PreToolUse` hooks
- A shared safety policy that redacts secrets and blocks dangerous raw operations
- KooCLI operation discovery, timeout handling, transient network retries, and an exact-command approval path for writes

## What V1 Does Not Try To Do

- It does not clone all Huawei Cloud Skills into this repository.
- It does not replace `skills.huaweicloud.com`.
- It does not expose arbitrary `hcloud` command execution.
- It does not fetch AK/SK, tokens, passwords, or cloud secret values into the agent context.
- It does not make Terraform Provider the default path; Terraform is a lower-priority option for reviewed IaC.

Write-capable execution is available only through `huaweicloud_run_approved_command`, and only after the exact command string has been shown to and approved by the user. The safer default is still to return a copyable command block from `huaweicloud_plan_cli_command`.

## Architecture

```text
Developer request
  -> huaweicloud-core skill
  -> capability path selection
  -> Huawei Cloud Skills / KooCLI / API / SDK / MCP / Terraform
  -> safety policy and approval gates
  -> read-only verification
```

## Install For Codex

From the repository root:

```powershell
.\scripts\install-codex-local.ps1
```

Then start a new Codex thread and mention `@huaweicloud-core`.

## Install For OpenCode

From the repository root:

```powershell
.\scripts\install-opencode-local.ps1
```

Then merge the MCP example from `integrations/opencode/opencode.json` into your OpenCode config if you want local tools.

## Development

```bash
npm test
npm run validate
```

The project has no runtime npm dependencies.

## KooCLI

Install Huawei Cloud KooCLI from `https://support.huaweicloud.com/qs-hcli/hcli_02_003.html`, verify with `hcloud version`, and configure credentials outside the agent conversation. If Codex or OpenCode cannot find the executable, set `HCLOUD_BIN` to the full `hcloud` path.

## Safety Model

The toolkit uses three layers:

- Skills teach the agent what to do.
- Hooks block risky tool calls on platforms that support hooks.
- MCP/CLI wrappers enforce the same policy when hooks are unavailable.

See `docs/safety-model.md`.
