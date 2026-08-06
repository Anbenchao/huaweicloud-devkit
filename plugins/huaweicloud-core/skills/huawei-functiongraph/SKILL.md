---
name: huawei-functiongraph
description: "Use when creating, deploying, or managing serverless functions on FunctionGraph. Covers triggers (APIG/OBS/timer/SMN), cold start, reserved concurrency. Triggers: FunctionGraph, serverless, function, Lambda, trigger. NOT for: CCE containers (use huawei-cce)."
version: 1
---

# Huawei Cloud FunctionGraph

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Critical Warnings
| Trap | Why |
|------|-----|
| Cold start 100ms-2s | Reserve concurrency for latency-sensitive workloads |
| Max execution 900s | Timeout after 15 min. Use ECS/CCE for long tasks |
| Env vars plaintext | Use DEW for secrets |

## Common Workflows
| Task | Command |
|------|---------|
| List functions | hcloud FGS ListFunctions |
| Create function | hcloud FGS CreateFunction --func_name=<n> --runtime=Python3.10 --handler=index.handler |
| APIG trigger | hcloud FGS CreateTrigger --function_urn=<urn> --trigger_type_code=APIG |

## Runtimes
Python 3.6/3.9/3.10/3.11, Node.js 12/14/16/18, Java 8/11/17, Go 1.x
