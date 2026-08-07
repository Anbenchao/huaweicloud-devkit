---
name: huawei-cts
description: "Use when managing Cloud Trace Service (CTS) audit logs, trackers, and traces on Huawei Cloud. Triggers: CTS, Cloud Trace, audit log, tracker, trace, operation record. NOT for: CES monitoring alarms (use huawei-cloud-eye), log analysis (use LTS)."
version: 1
---

# Huawei Cloud CTS

**STOP - Do not answer from general knowledge.** Follow the procedure below.

Always run `hcloud <Service> <Operation> --help` before constructing commands to discover exact parameter names and requirements.

## Critical Warnings
| Trap | Why |
|------|-----|
| Tracker must have OBS bucket | Create OBS bucket before enabling tracker |
| Trace data retained 7 days by default | Use OBS for long-term retention |
| Organization tracker affects all accounts | Admin consent needed |

## Common Workflows
| Task | Command |
|------|---------|
| List trackers | hcloud CTS ListTrackers --tracker_type=system --cli-region=<r> |
| Create tracker | hcloud CTS CreateTracker --tracker_name=<n> --bucket_name=<bucket> --file_prefix_name=<prefix> |
| Query traces | hcloud CTS ListTraces --tracker_name=<n> --service_type=ECS |
| Delete tracker | hcloud CTS DeleteTracker --tracker_name=<n> |

## Troubleshooting
| Error | Fix |
|-------|-----|
| No traces showing | Wait 5-15 minutes after operation |
| OBS permission denied | Check tracker OBS bucket policy |

## Security
- MUST enable CTS tracker for all regions
- MUST configure trace file encryption (KMS)
- MUST restrict OBS bucket access to authorized users
