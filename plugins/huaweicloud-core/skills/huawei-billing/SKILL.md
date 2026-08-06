---
name: huawei-billing
description: "Use when querying bills, costs, resource usage, or billing details on Huawei Cloud (BSS). Triggers: billing, BSS, cost, bill, expense, usage report, resource usage, budget. NOT for: resource management (use huawei-ecs etc.), creating resources."
version: 1
---

# Huawei Cloud Billing (BSS)

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Critical Warnings
| Trap | Why |
|------|-----|
| Bills may have 24h delay | Real-time cost may differ from final bill |
| API access needs BSS admin role | Not all IAM users can query billing |
| Cost data is read-only | APIs do not create or modify resources |

## Common Workflows
| Task | Command |
|------|---------|
| Query monthly bill | hcloud BSS ListCustomerBillsMonthlyCycle --bill_cycle=<YYYY-MM> |
| Query resource usage | hcloud BSS ListResourceUsage --bill_cycle=<YYYY-MM> |
| Query cost details | hcloud BSS ListCostDetail --bill_cycle=<YYYY-MM> |
| Query account balance | hcloud BSS ShowCustomerAccountBalances |

## Troubleshooting
| Error | Fix |
|-------|-----|
| Permission denied | Grant BSS Administrator or BSS Operator role |
| Empty result | Bill cycle may not have data yet |

## Security
- MUST restrict BSS access to finance/billing IAM roles
- MUST NOT hardcode billing data in scripts
- MUST use read-only credentials for billing queries
