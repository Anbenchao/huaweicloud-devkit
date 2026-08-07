---
name: huawei-cbr
description: "Use when creating or managing Cloud Backup and Recovery (CBR) vaults, backups, and restore operations on Huawei Cloud. Triggers: CBR, backup, restore, vault, snapshot, disaster recovery. NOT for: OBS object versioning (use huawei-obs), RDS automated backups (use huawei-rds)."
version: 1
---

# Huawei Cloud CBR

**STOP - Do not answer from general knowledge.** Follow the procedure below.

Always run `hcloud <Service> <Operation> --help` before constructing commands to discover exact parameter names and requirements.

## Critical Warnings
| Trap | Why |
|------|-----|
| Vault binds to a single resource type | Can't mix ECS and EVS in same vault |
| Restore requires instance shutdown | Plan maintenance window |
| Backup storage billed by size | Delete stale backups to control cost |

## Common Workflows
| Task | Command |
|------|---------|
| Create vault | hcloud CBR CreateVault --vault.name=<n> --vault.billing.charging_mode=post_paid --vault.billing.protect_type=backup --cli-region=<r> |
| Create backup | hcloud CBR CreateCheckpoint --vault_id=<id> --name=<n> |
| Restore backup | hcloud CBR RestoreBackup --backup_id=<id> |
| List vaults | hcloud CBR ListVaults --cli-region=<r> |

## Troubleshooting
| Error | Fix |
|-------|-----|
| Backup failed | Check agent status on target instance |
| Restore stuck | Verify target resource state allows restore |

## Security
- MUST encrypt backups with KMS
- MUST restrict vault access to resource IAM roles
- MUST test restore procedures regularly
