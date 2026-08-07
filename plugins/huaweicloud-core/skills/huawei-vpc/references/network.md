# VPC Network Management Reference

## Nested Prefix Summary

KooCLI 7.x VPC API requires nested prefixes:

| Resource | Create Param Prefix | Example |
|----------|---------------------|---------|
| VPC | `--vpc.` | `--vpc.name=my-vpc --vpc.cidr=192.168.0.0/16` |
| Subnet | `--subnet.` | `--subnet.name=web --subnet.vpc_id=<id> --subnet.cidr=192.168.1.0/24` |
| Security Group | `--security_group.` | `--security_group.name=sg-web` |
| SG Rule | `--security_group_rule.` | `--security_group_rule.direction=ingress` |

## EIP Management

```bash
# Create EIP (pay-per-use)
hcloud EIP CreatePublicip --publicip.type=EIP \
  --bandwidth.size=5 --bandwidth.share_type=PER --bandwidth.name=<name>

# Bind to ECS
hcloud EIP AssociatePublicips --publicip_id=<id> \
  --publicip.associate_instance_id=<ecs-id> --publicip.associate_instance_type=ecs

# Unbind
hcloud EIP UnbindPublicIp --publicip_id=<id>

# List
hcloud EIP ListPublicips

# Delete (unbind first)
hcloud EIP DeletePublicip --publicip_id=<id>
```

> EIP bills even when not bound. Release unused EIPs.

## Security Group Quick Reference

```bash
# Create SG (no vpc_id needed)
hcloud VPC CreateSecurityGroup --security_group.name=<name>

# Add SSH rule
hcloud VPC CreateSecurityGroupRule \
  --security_group_rule.security_group_id=<sg-id> \
  --security_group_rule.direction=ingress \
  --security_group_rule.protocol=tcp \
  --security_group_rule.multiport=22 \
  --security_group_rule.remote_ip_prefix=<cidr>
```

> SG is stateful — return traffic auto-allowed. Network ACL is stateless — need both directions.
