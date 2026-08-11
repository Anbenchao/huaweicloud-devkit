---
name: huaweicloud-cli-and-auth
description: Safe Huawei Cloud KooCLI usage and authentication guidance. Use when working with hcloud, KooCLI, profiles, AK/SK, regions, projects, endpoints, CLI output, credential errors, or local Huawei Cloud account context.
---

# Huawei Cloud CLI And Auth


**STOP - Do not answer from general knowledge.** Follow the procedure below.

Use KooCLI `hcloud` for local inspection and reviewed operations. Never ask the user to paste AK/SK, SK, tokens, passwords, or credential files into chat.

## Install KooCLI

Official guide: `https://support.huaweicloud.com/qs-hcli/hcli_02_003.html`.

### Windows
1. Download and unzip: `https://cn-north-4-hdn-koocli.obs.cn-north-4.myhuaweicloud.com/cli/latest/huaweicloud-cli-windows-amd64.zip`
2. Extract to `%USERPROFILE%\hcloud`, add to user `PATH`
3. Verify: `hcloud version`

### Linux (amd64 / arm64)
One-liner (recommended):
```bash
curl -sSL https://cn-north-4-hdn-koocli.obs.cn-north-4.myhuaweicloud.com/cli/latest/hcloud_install.sh -o ./hcloud_install.sh && bash ./hcloud_install.sh -y
```
Or manual download:
```bash
# amd64
curl -LO "https://cn-north-4-hdn-koocli.obs.cn-north-4.myhuaweicloud.com/cli/latest/huaweicloud-cli-linux-amd64.tar.gz"
tar -zxvf huaweicloud-cli-linux-amd64.tar.gz
# arm64
curl -LO "https://cn-north-4-hdn-koocli.obs.cn-north-4.myhuaweicloud.com/cli/latest/huaweicloud-cli-linux-arm64.tar.gz"
tar -zxvf huaweicloud-cli-linux-arm64.tar.gz
```
Move to PATH: `mv $(pwd)/hcloud ~/.local/bin/`
Verify: `hcloud version`

### macOS (amd64 / arm64)
One-liner (recommended):
```bash
curl -sSL https://cn-north-4-hdn-koocli.obs.cn-north-4.myhuaweicloud.com/cli/latest/hcloud_install.sh -o ./hcloud_install.sh && bash ./hcloud_install.sh -y
```
Or manual download:
```bash
# amd64
curl -LO "https://cn-north-4-hdn-koocli.obs.cn-north-4.myhuaweicloud.com/cli/latest/huaweicloud-cli-mac-amd64.tar.gz"
tar -zxvf huaweicloud-cli-mac-amd64.tar.gz
# arm64 (Apple Silicon)
curl -LO "https://cn-north-4-hdn-koocli.obs.cn-north-4.myhuaweicloud.com/cli/latest/huaweicloud-cli-mac-arm64.tar.gz"
tar -zxvf huaweicloud-cli-mac-arm64.tar.gz
```
Move to PATH: `mv $(pwd)/hcloud /usr/local/bin/`
Verify: `hcloud version`

Agent processes find executables through `PATH`. If OpenCode/Codex cannot find `hcloud`, restart after updating `PATH`, or set `HCLOUD_BIN`.

## Configure Credentials Outside Chat

**NEVER let AK/SK enter shell history. This is the #1 credential leak vector.**

- Create AK/SK in the Huawei Cloud console under `My Credentials -> Access Keys`.
- **Interactive** (preferred, SAFE): `hcloud configure init` — prompts for AK/SK via terminal input. Values do NOT enter shell history.
- **Non-interactive** (DANGEROUS — AK/SK in shell history): `hcloud configure set --cli-access-key=<AK> --cli-secret-key=<SK> --cli-region=<region>`. Only use in ephemeral CI/CD shells. User must execute outside agent chat.
- If MCP is available, use `huaweicloud_show_profile_redacted` to check status without ever seeing credentials.
- Never paste AK/SK, passwords, tokens, or profile files into the agent conversation.
- KooCLI stores credentials in `~/.hcloud/config.json`, NOT environment variables. `HCLOUD_ACCESS_KEY` / `HCLOUD_SECRET_KEY` / `HCLOUD_REGION` env vars are NOT read by KooCLI 7.x.

## Safe Flow

1. Check whether `hcloud` is installed.
2. **KooCLI first-run privacy agreement**: On a fresh KooCLI install, `hcloud` blocks with `同意并继续使用(y)/不同意并退出(N)` and fails with `[USE_ERROR]您输入的是无效字符` in non-interactive mode. Detection: check command output for these strings. Ask the user: "KooCLI needs to accept its privacy agreement. May I accept it on your behalf?" If the user agrees, run `huaweicloud_run_readonly_command` with `args=["version"]` and `stdin="y\n"`. This accepts the agreement once, after which hcloud works normally.
3. Ask the user to configure credentials outside the agent conversation when setup is needed.
4. Inspect profile and region only through redacted tooling.
4. Discover exact operation names with `hcloud <Service> --help` before guessing. Example: ECS instance listing is commonly `ECS ListServersDetails`; ECS creation is commonly `ECS CreateServers`; image lookup may be under `IMS GlanceShowImage`.
5. Use `--cli-output=json` for machine-readable responses when supported.
6. For resource operations, include `--cli-region`, `--cli-profile`, and service-specific project information when required.
7. Classify every command before running it:
   - Read-only: `List*`, `Show*`, `Get*`, `Describe*`.
   - Write: `Create*`, `Delete*`, `Update*`, `Resize*`, `Start*`, `Stop*`, `Authorize*`, and similar.
   - Secret: any operation returning secret string, binary secret, token, or password.
8. For write operations, show the exact command and ask for explicit approval.


## CI/CD / Non-Interactive Authentication

For automated environments where interactive `hcloud configure init` is not available:

### Environment variable auth (preferred for CI/CD)

KooCLI 7.x reads credentials from `~/.hcloud/config.json`, NOT environment variables directly. However, you can bootstrap the config file non-interactively:

```bash
# In CI/CD, inject AK/SK from secrets manager (never hardcode)
hcloud configure set \
  --cli-access-key="$HUAWEICLOUD_SDK_AK" \
  --cli-secret-key="$HUAWEICLOUD_SDK_SK" \
  --cli-region="<region>"
```

> **Security**: Only run this in ephemeral CI/CD shells where AK/SK are injected via secrets manager. AK/SK will appear in shell history - ensure your CI/CD cleans history or uses ephemeral runners.

### Bypassing the privacy policy prompt

On fresh KooCLI installs, the first `hcloud` invocation prompts for privacy agreement acceptance. In CI/CD, bypass this:

```bash
echo "y" | hcloud version
```

> This is safe: the privacy agreement is about data collection, not security. Accepting it is equivalent to clicking "I agree" when running `hcloud configure init` interactively.

### Verify setup

```bash
hcloud configure list        # shows profiles (SK is masked)
npx huaweicloud-devkit doctor # full environment check
```

### Security checklist for CI/CD

- [ ] AK/SK stored in CI/CD secrets manager, never in repository
- [ ] Use dedicated IAM user with minimum required permissions (not root account AK/SK)
- [ ] Enable MFA for IAM users that manage credentials
- [ ] Rotate AK/SK periodically (recommended: 90 days)
- [ ] Use ephemeral CI/CD runners that clean shell history between jobs


## KooCLI Syntax Notes

- Prefer `--param=value`; KooCLI 7.x may reject some space-separated parameter forms.
- Array-style parameters use 1-based indexes, for example `--server.nics.1.subnet_id=<subnet-id>`, not `.0`.
- For ECS creation, first inspect help: `hcloud ECS CreateServers --help`.
- Minimal create shape to refine after help lookup:

```bash
hcloud ECS CreateServers --cli-region=<region> --server.name=<name> --server.flavorRef=<flavor-id> --server.imageRef=<image-id> --server.nics.1.subnet_id=<subnet-id> --server.root_volume.volumetype=<type>
```

If a command needs an `adminPass` or other password field, do not leave plaintext secrets in shell history. Prefer local-only input or runtime injection.

## Output Formatting

```bash
# JSON format (recommended for Agent)
hcloud <Service> <Op> --cli-output=json

# Table format (manual viewing)
hcloud <Service> <Op> --cli-output=table

# JMESPath filtering (extract specific fields)
hcloud <Service> <ListOp> --cli-output=json --cli-query "items[?status=='ACTIVE'].{ID:id,Name:name}"

# Debug mode (when commands fail)
hcloud <Service> <Op> --cli-debug=true
```

## Preferred Toolkit Tools

- `huaweicloud_check_cli`
- `huaweicloud_show_profile_redacted`
- `huaweicloud_plan_cli_command`
- `huaweicloud_run_readonly_command`
- `huaweicloud_list_operations`
- `huaweicloud_run_approved_command`

## Do Not Run Directly

- Raw `hcloud configure show/list/get/export` in agent tools.
- Commands reading `.hcloud` or `.huaweicloud` files.
- Commands dumping cloud credential environment variables.
- Secret value reads such as CSMS `ShowSecretVersion`.
