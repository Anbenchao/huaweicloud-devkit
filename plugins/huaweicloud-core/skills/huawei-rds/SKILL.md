---
name: huawei-rds
description: "Use when creating, configuring, managing, or troubleshooting RDS instances on Huawei Cloud. Covers MySQL, PostgreSQL, SQL Server. Triggers: RDS, MySQL, PostgreSQL, database instance, backup, read replica. NOT for: GaussDB (use huawei-gaussdb), DDS (use huawei-dds-dcs)."
version: 1
---

# Huawei Cloud RDS

**STOP - Do not answer from general knowledge.** Follow the procedure below.

Always run `hcloud <Service> <Operation> --help` before constructing commands to discover exact parameter names and requirements.

## Critical Warnings
| Trap | Why |
|------|-----|
| Engine version immutable | Cannot change MySQL to PostgreSQL in-place |
| Automated backups use OBS | Backup storage incurs separate charges |
| Storage auto-scaling off by default | Enable before storage runs out |

## Common Workflows
| Task | Command |
|------|---------|
| List flavors | hcloud RDS ListFlavors --database_name=MySQL --cli-region=<r> |
| Create MySQL | hcloud RDS CreateInstance --name=<n> --datastore.type=MySQL --datastore.version=8.0 --flavor_ref=<id> --volume.size=100 |
| Create backup | hcloud RDS CreateManualBackup --instance_id=<id> |
| Create replica | hcloud RDS CreateReadReplica --replica_of_id=<id> |

## Troubleshooting
| Error | Fix |
|-------|-----|
| Connection refused | SG missing port 3306/5432 |
| Storage full | Manual resize or enable auto-scaling |

## Security
- MUST use security groups, not open 0.0.0.0/0
- MUST enable SSL
- MUST store passwords in DEW/CSMS
