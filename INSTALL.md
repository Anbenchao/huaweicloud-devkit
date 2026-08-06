# Installation

## Requirements

- Node.js 20 or newer
- Git
- Codex or OpenCode
- Huawei Cloud KooCLI `hcloud` for live CLI inspection

Credentials must be configured outside the agent conversation. Do not paste AK/SK, SK, passwords, tokens, or credential files into an agent chat.

KooCLI install guide: `https://support.huaweicloud.com/qs-hcli/hcli_02_003.html`.

- Windows: unzip KooCLI to a user directory such as `%USERPROFILE%\hcloud`, add it to the user `PATH`, then restart Codex/OpenCode.
- Linux: prefer a user-local path such as `~/.local/bin/hcloud`; make sure that directory is visible in the agent process `PATH`.
- If the agent cannot find `hcloud`, set `HCLOUD_BIN` to the full executable path.
- Verify with `hcloud version`.

## Codex

```powershell
.\scripts\install-codex-local.ps1
```

This registers the repository as a local marketplace and installs `huaweicloud-core`.

## OpenCode

```powershell
.\scripts\install-opencode-local.ps1
```

This copies the plugin skills and slash commands into the OpenCode config directory.

To enable local MCP tools, copy the MCP section from:

```text
integrations/opencode/opencode.json
```

into your OpenCode config, adjusting the relative path if your config lives outside the repository.

## Verify

```bash
npm test
npm run validate
```
