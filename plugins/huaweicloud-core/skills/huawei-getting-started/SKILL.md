---
name: huawei-getting-started
description: "Use when starting fresh with Huawei Cloud or KooCLI, installing prerequisites, setting up authentication, or exploring what is possible. Triggers: getting started, first time, setup, install, explore, quickstart, beginner, tutorial. NOT for: specific service operations (use huawei-ecs, huawei-obs, etc.)."
version: 1
---

# Huawei Cloud Getting Started

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## KooCLI Installation

| OS | Command |
|----|---------|
| Windows (PowerShell) | See https://support.huaweicloud.com/qs-hcli/hcli_02_003.html for MSI download |
| Linux | curl -LO "https://hwcloudcli.obs.cn-north-1.myhuaweicloud.com/cli/latest/hcloud_install.sh" && bash hcloud_install.sh |
| macOS | curl -LO "https://hwcloudcli.obs.cn-north-1.myhuaweicloud.com/cli/latest/hcloud_install.sh" && bash hcloud_install.sh |

## First-Time Setup
1. **Install KooCLI** using command above
2. **Configure credentials**: `hcloud configure set --ak=YOUR_AK --sk=YOUR_SK`
3. **Set region**: `hcloud configure set --region=cn-north-4`
4. **Verify**: `hcloud ECS ListServersDetails --cli-region=cn-north-4`

## Critical Warnings
| Trap | Why |
|------|-----|
| AK/SK must be kept secret | Never commit to git or share |
| Default region applies to all commands | Override with --cli-region= per command |
| Some services region-specific | Not all services available in all regions |

## What Can I Do? (Quick Index)
| Goal | Skill |
|------|-------|
| Create a VM | huawei-ecs |
| Store files | huawei-obs |
| Set up a database | huawei-rds / huawei-gaussdb |
| Create a network | huawei-vpc |
| Manage access | huawei-iam |
| Deploy an app | huawei-deployment |
| Run containers | huawei-cce |
| Build an API | huawei-apig |
| Run serverless | huawei-functiongraph |
| Monitor resources | huawei-cloud-eye |

## Pro Tips
- Use `hcloud <Service> --help` to discover operations (see huaweicloud-capability-discovery)
- Prepend `hcloud configure set --cli-region=<r>` to avoid per-command region flags
- Pipe sensitive output through IAM with `--cli-output-format=json`
