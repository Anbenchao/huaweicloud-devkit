---
name: huawei-gaussdb
description: "Use when creating or managing GaussDB distributed database on Huawei Cloud. Covers GaussDB(for MySQL), GaussDB(for openGauss), sharding, HTAP. Triggers: GaussDB, distributed database, sharding, openGauss, HTAP. NOT for: single RDS (use huawei-rds)."
version: 1
---

# Huawei Cloud GaussDB

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Critical Warnings
| Trap | Why |
|------|-----|
| Shard key permanent | Cannot change after creation |
| Cross-shard queries expensive | Avoid joins across shard keys |
| Min 3 nodes for production | For HA in distributed mode |

## Common Workflows
| Task | Command |
|------|---------|
| List flavors | hcloud GaussDB ListFlavors --database_name=gaussdb-mysql |
| Create instance | hcloud GaussDB CreateInstance --name=<n> --datastore.type=gaussdb-mysql --shard_num=3 |
| Add shard | hcloud GaussDB ExpandInstance --instance_id=<id> --shard_num=<n> |

## Security
- MUST use VPC internal access
- MUST enable SSL
