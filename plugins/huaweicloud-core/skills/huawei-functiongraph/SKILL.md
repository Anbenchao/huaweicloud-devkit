---
name: huawei-functiongraph
description: "Use when creating, deploying, or managing serverless functions on FunctionGraph. Covers triggers (APIG/OBS/timer/SMN), cold start, reserved concurrency. Triggers: FunctionGraph, serverless, function, Lambda, trigger. NOT for: CCE containers (use huawei-cce)."
version: 1
---

# Huawei Cloud FunctionGraph

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Overview

Domain expertise for Huawei Cloud FunctionGraph. Covers function lifecycle, code deployment, trigger configuration, cold start management, and troubleshooting.

## Critical Warnings

| Trap | Why |
|------|-----|
| Cold start 100ms-2s | Reserve concurrency for latency-sensitive workloads |
| Max execution 900s | Timeout after 15 min. Use ECS/CCE for long tasks |
| Env vars plaintext | Use DEW for secrets |
| Service name is `FunctionGraph` | NOT `FGS`. KooCLI 7.x uses the full service name |
| CLI requires `project_id` | Get it: `hcloud IAM ListProjects` or extract from URN `urn:fss:<region>:<project_id>:...` |

## Prerequisites

```bash
hcloud configure list              # confirm a profile exists
hcloud FunctionGraph --help        # confirm service is available
```

## Runtimes

Python 2.7/3.6/3.9/3.10/3.11, Node.js 6.10–18.15, Java 8/11/17, Go 1.x/1.8, C# 2.0–6.0, PHP 7.3/8.3, Cangjie 1.0, Custom, Custom Image. Verify current: `hcloud FunctionGraph ListRuntimes`.

## Common Workflows

| Task | Command | Details |
|------|---------|---------|
| List functions | `hcloud FunctionGraph ListFunctions --cli-region=<r> --project_id=<p>` | |
| Show function | `hcloud FunctionGraph ShowFunctionConfig --function_urn=<urn> --cli-region=<r> --project_id=<p>` | |
| Create function | `hcloud FunctionGraph CreateFunction --func_name=<n> --runtime=Python3.10 --handler=index.handler --memory_size=128 --package=default --timeout=3 --cli-region=<r> --project_id=<p>` | references/create-function.md |
| Delete function | `hcloud FunctionGraph DeleteFunction --function_urn=<urn> --cli-region=<r> --project_id=<p>` | |
| Invoke function | `hcloud FunctionGraph InvokeFunction --function_urn=<urn> --name=<test-event> --cli-region=<r> --project_id=<p>` | Use `v0` for raw output, `v1` for APIG-wrapped. Pass via `--x_cff_request_version`. |
| Create trigger | `hcloud FunctionGraph CreateFunctionTrigger --function_urn=<urn> --trigger_type_code=<type> --event_type_code=<event> --trigger_status=ACTIVE --event_data.<key>=<value> --cli-region=<r> --project_id=<p>` | references/triggers.md |
| List triggers | `hcloud FunctionGraph ListFunctionTriggers --function_urn=<urn> --cli-region=<r> --project_id=<p>` | |
| Deploy workflow | Write code → zip → CreateFunction → InvokeFunction → CreateFunctionTrigger | references/deploy-workflow.md |

## Troubleshooting

| Error | Root Cause -> Fix |
|-------|------------------|
| `不支持的服务名称:FGS` | Use `FunctionGraph`, not `FGS` |
| `不支持的operation:CreateTrigger` | Use `CreateFunctionTrigger` |
| `缺少必填参数:{*}` on Invoke | Add `--name=<value>` body param |
| `缺少必填参数` on Create | Ensure `--memory_size`, `--package`, `--timeout`, `--cli-region`, `--project_id` |
| `event_data` parse error | Use dotted format: `--event_data.key=value`, NOT JSON |
| Function times out | Increase `--timeout` or optimize code |
| Code too large | Inline limit 10KB → use `zip`/`obs` `--code_type` |
| Cold start slow | Set reserved instances for critical functions |
| Auth failure | Run `hcloud configure init` |

## Security Considerations

- MUST use DEW for secrets, never hardcode in environment variables
- MUST use `--app_xrole` (agency) for cross-service access
- SHOULD enable CTS audit logging for function invocations
- MUST NOT expose AK/SK in function code

## MCP Tools

- `huaweicloud_list_operations` service=FunctionGraph
- `huaweicloud_run_readonly_command` for discovery
- `huaweicloud_run_approved_command` for writes

## Without MCP

Fall back to hcloud CLI. State: "MCP unavailable, using local hcloud CLI."

## Cross-Skill References

- **APIG trigger setup**: See `huawei-apig` for API group creation and publishing
- **OBS trigger setup**: See `huawei-obs` for bucket and object event configuration
- **DEW secrets**: See `huawei-dew` for managing function secrets
- **SMN notifications**: See `huawei-smn-dms` for notification topics
- **VPC configuration**: See `huawei-vpc` for network settings

## References

- FunctionGraph Docs: https://support.huaweicloud.com/functiongraph/
- Create function: references/create-function.md
- Triggers: references/triggers.md
- Deploy workflow: references/deploy-workflow.md
