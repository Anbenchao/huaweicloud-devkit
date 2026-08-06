---
name: huaweicloud-cli-and-auth
description: Safe Huawei Cloud KooCLI usage and authentication guidance. Use when working with hcloud, KooCLI, profiles, AK/SK, regions, projects, endpoints, CLI output, credential errors, or local Huawei Cloud account context.
---

# Huawei Cloud CLI And Auth

Use KooCLI `hcloud` for local inspection and reviewed operations. Never ask the user to paste AK/SK, SK, tokens, passwords, or credential files into chat.

## Install KooCLI

- Official install guide: `https://support.huaweicloud.com/qs-hcli/hcli_02_003.html`.
- Windows: download and unzip KooCLI, for example to `%USERPROFILE%\hcloud`, then add that directory to the user `PATH`.
- Linux: install into the user path when possible, for example `~/.local/bin/hcloud`, so no `sudo` is needed. The official Linux package is available from Huawei Cloud's documented download page; common amd64 package URL: `https://cn-north-4-hdn-koocli.obs.cn-north-4.myhuaweicloud.com/cli/latest/huaweicloud-cli-linux-amd64.tar.gz`.
- Agent processes find executables through their own `PATH`. If OpenCode/Codex cannot find `hcloud`, restart the agent after updating `PATH`, or set `HCLOUD_BIN` to the full `hcloud` executable path.
- Verify with `hcloud version`.

## Configure Credentials Outside Chat

- Create AK/SK in the Huawei Cloud console under `My Credentials -> Access Keys`.
- Prefer interactive setup: `hcloud configure init`.
- Non-interactive setup is local only: `hcloud configure set --cli-access-key=<AK> --cli-secret-key=<SK> --cli-region=<region>`.
- Required concepts: Access Key ID, Secret Access Key, Region such as `ap-southeast-3`, and Project ID. KooCLI can often resolve Project ID from the configured region.
- Never paste AK/SK, passwords, tokens, or profile files into the agent conversation.

## Safe Flow

1. Check whether `hcloud` is installed.
2. Ask the user to configure credentials outside the agent conversation when setup is needed.
3. Inspect profile and region only through redacted tooling.
4. Discover exact operation names with `hcloud <Service> --help` before guessing. Example: ECS instance listing is commonly `ECS ListServersDetails`; ECS creation is commonly `ECS CreateServers`; image lookup may be under `IMS GlanceShowImage`.
5. Use `--cli-output=json` for machine-readable responses when supported.
6. For resource operations, include `--cli-region`, `--cli-profile`, and service-specific project information when required.
7. Classify every command before running it:
   - Read-only: `List*`, `Show*`, `Get*`, `Describe*`.
   - Write: `Create*`, `Delete*`, `Update*`, `Resize*`, `Start*`, `Stop*`, `Authorize*`, and similar.
   - Secret: any operation returning secret string, binary secret, token, or password.
8. For write operations, show the exact command and ask for explicit approval.

## KooCLI Syntax Notes

- Prefer `--param=value`; KooCLI 7.x may reject some space-separated parameter forms.
- Array-style parameters use 1-based indexes, for example `--server.nics.1.subnet_id=<subnet-id>`, not `.0`.
- For ECS creation, first inspect help: `hcloud ECS CreateServers --help`.
- Minimal create shape to refine after help lookup:

```bash
hcloud ECS CreateServers --cli-region=ap-southeast-3 --server.name=<name> --server.flavorRef=<flavor-id> --server.imageRef=<image-id> --server.nics.1.subnet_id=<subnet-id> --server.root_volume.volumetype=SSD
```

If a command needs an `adminPass` or other password field, do not leave plaintext secrets in shell history. Prefer local-only input or runtime injection.

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
