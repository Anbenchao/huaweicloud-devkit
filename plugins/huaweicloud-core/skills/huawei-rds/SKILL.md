---
name: huawei-rds
description: "Use when creating, configuring, managing, or troubleshooting RDS instances on Huawei Cloud. Covers MySQL, PostgreSQL, SQL Server. Triggers: RDS, MySQL, PostgreSQL, database instance, backup, read replica. NOT for: GaussDB (use huawei-gaussdb), DDS (use huawei-dds-dcs)."
version: 1
---

# Huawei Cloud RDS

**STOP - Do not answer from general knowledge.** Follow the procedure below.

Always run `hcloud RDS <Operation> --help` before constructing commands to discover exact parameter names and requirements.

## Prerequisites

Before creating an RDS instance, you MUST have:
- A VPC and subnet (see `huawei-vpc` skill)
- A security group with database port open (MySQL=3306, PostgreSQL=5432)
- Run `hcloud RDS ListFlavors --database_name=<engine> --cli-region=<r>` to get spec codes

## Critical Warnings

| Trap | Why |
|------|-----|
| Engine version immutable | Cannot change MySQL to PostgreSQL in-place |
| Automated backups use OBS | Backup storage incurs separate charges |
| Storage auto-scaling off by default | Enable before storage runs out |
| `--password` conflicts with KooCLI system param | Non-interactive needs `echo b \| hcloud RDS CreateInstance ...` |
| Volume type must match flavor group | General flavor→CLOUDSSD; Dedicated→CLOUDSSD/ESSD; ARM→ULTRAHIGH |

## Common Workflows

| Task | Operation |
|------|-----------|
| List flavors | `ListFlavors --database_name=<engine>` |
| Create instance | `CreateInstance` — see below for required params |
| List instances | `ListInstances` (get status + connection info) |
| Create backup | `CreateManualBackup` |
| Create read replica | `CreateReadReplica` |
| Delete instance | `DeleteInstance` |

## Create Instance — Gotchas

Always run `hcloud RDS CreateInstance --help` first. Key traps:

| Param | Note |
|-------|------|
| `--password` | Conflicts with KooCLI system param. Pipe `echo b \|` to bypass |
| `--volume.type` | General=CLOUDSSD, Dedicated=CLOUDSSD\|ESSD, ARM=ULTRAHIGH |
| `--vpc_id`, `--subnet_id` | Required. Must exist in target region |
| `--security_group_id` | Required. Must have DB port open |
| `--availability_zone` | Required |

## Connecting to RDS

After the instance is ACTIVE, connect using a database client:

```bash
# Get connection info
hcloud RDS ListInstances --cli-region=<r>
# → private_ips + port

# Install MySQL client
apt install mysql-client   # Linux
# or: choco install mysql-cli  # Windows

# Connect (use SSL)
mysql -h <private_ip> -P 3306 -u root -p --ssl-mode=REQUIRED
```

## Database Operations

RDS instance is running, but **hcloud does NOT support SQL execution**. Use a database client:

```sql
CREATE DATABASE mydb;
USE mydb;
CREATE TABLE employee (name VARCHAR(100), age INT);
INSERT INTO employee VALUES ('Alice', 30);
SELECT * FROM employee;
```

## Troubleshooting

| Error | Fix |
|-------|-----|
| Connection refused | SG missing port 3306/5432 |
| Storage full | Manual resize or enable auto-scaling |
| DBS.280241 Invalid storage type | Volume type doesn't match flavor group — check matching table above |
| DBS.280448 Sold out | Try different volume type |
| --password interactive prompt | Pipe `echo b \|` before command to select API parameter |

## Security

- MUST use security groups, not open 0.0.0.0/0
- MUST enable SSL for connections
- MUST store passwords in DEW/CSMS

## Cross-Skill References

- **VPC/Subnet/Security Group**: See `huawei-vpc`
- **DEW secrets**: See `huawei-dew`
