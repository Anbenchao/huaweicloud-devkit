---
name: huawei-cloud-eye
description: "Use when setting up monitoring, alarms, dashboards, or event rules on Huawei Cloud Eye (CES). Triggers: Cloud Eye, CES, monitoring, alarm, metrics, dashboard, event monitoring. NOT for: CTS audit logs (use huawei-cts), AAD anti-DDoS (use huawei-waf-aad)."
version: 1
---

# Huawei Cloud Cloud Eye (CES)

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Critical Warnings
| Trap | Why |
|------|-----|
| Custom metrics cost extra | Plan metric count to avoid billing surprises |
| Alarm actions need SMN topics | Create SMN topic before alarm rule |
| Metric data retention limited | Raw data: 7 days, aggregated: varies |

## Common Workflows
| Task | Command |
|------|---------|
| List metrics | hcloud CES ListMetrics --namespace=SYS.ECS --cli-region=<r> |
| Create alarm rule | hcloud CES CreateAlarm --alarm_name=<n> --metric_name=cpu_util --namespace=SYS.ECS --period=300 --filter=average --value=90 --comparison_operator=>=  |
| List alarms | hcloud CES ListAlarms --cli-region=<r> |
| Create dashboard | hcloud CES CreateDashboard --dashboard_name=<n> |

## Troubleshooting
| Error | Fix |
|-------|-----|
| Alarm not triggering | Check metric period (300s minimum) |
| No metric data | Agent not installed or ECS stopped |

## Security
- MUST use role-based alarm notifications
- MUST not expose alarm action endpoints publicly
