---
name: huawei-dds-dcs
description: "Use when creating or managing Document Database Service (DDS/MongoDB-compatible) or Distributed Cache Service (DCS/Redis/Memcached) on Huawei Cloud. Triggers: DDS, DCS, MongoDB, Redis, Memcached, document DB, cache, replica set, sharding. NOT for: RDS (use huawei-rds), GaussDB (use huawei-gaussdb)."
version: 1
---

# Huawei Cloud DDS & DCS

**STOP - Do not answer from general knowledge.** Follow the procedure below.

Always run `hcloud <Service> <Operation> --help` before constructing commands to discover exact parameter names and requirements.

## Critical Warnings
| Trap | Why |
|------|-----|
| DDS replica set needs 3 nodes | Minimum deployment is 3-node replica |
| DCS Redis password is mandatory | Cannot disable auth |
| DDS engine version immutable | Choose version before creating instance |

## Common Workflows
| Task | Command |
|------|---------|
| List DDS flavors | hcloud DDS ListFlavors --engine_name=DDS-Community --cli-region=<r> |
| Create DDS instance | hcloud DDS CreateInstance --name=<n> --datastore.type=DDS-Community --datastore.version=4.0 --mode=ReplicaSet |
| Create DCS Redis | hcloud DCS CreateInstance --name=<n> --engine=Redis --engine_version=6.0 --capacity=2 |
| List DCS instances | hcloud DCS ListInstances --cli-region=<r> |

## Troubleshooting
| Error | Fix |
|-------|-----|
| DDS connection timeout | Check VPC/subnet and security group (port 8635) |
| DCS auth failure | Redis requires --password parameter on connect |

## Security
- MUST enable DDS SSL connections
- MUST use strong passwords for DCS instances
- MUST deploy in VPC private subnet, not public
