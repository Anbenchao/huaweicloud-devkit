---
name: huawei-apig
description: "Use when creating or managing API Gateway (APIG). Covers API creation, throttling, auth (IAM/APP/basic), CORS, publishing. Triggers: APIG, API gateway, throttling, publish API. NOT for: FunctionGraph triggers."
version: 1
---

# Huawei Cloud APIG

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Critical Warnings
| Trap | Why |
|------|-----|
| API group region-locked | Cannot move across regions |
| Throttling per-API default | Use app-level quotas for per-user limits |
| CORS must be explicit | OPTIONS preflight fails until configured |

## Common Workflows
| Task | Command |
|------|---------|
| Create group | hcloud APIG CreateApiGroupV2 --name=<n> |
| Create API | hcloud APIG CreateApiV2 --group_id=<id> --name=<n> --req_uri=/path --req_method=GET |
| Set throttle | hcloud APIG CreateThrottlingPolicyV2 --name=<n> --api_call_limits=1000 |
| Publish | hcloud APIG PublishApiV2 --api_id=<id> --env_id=<env> |
