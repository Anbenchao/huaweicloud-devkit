# Security Group Rules

## Common Rules
| Direction | Protocol | Port | Source | Purpose |
|-----------|----------|------|--------|---------|
| Ingress | TCP | 22 | <office-ip>/32 | SSH |
| Ingress | TCP | 80 | 0.0.0.0/0 | HTTP |
| Ingress | TCP | 443 | 0.0.0.0/0 | HTTPS |
| Ingress | TCP | 3306 | <sg-app-id> | MySQL from app |
| Ingress | TCP | 6379 | <sg-app-id> | Redis from app |
| Egress | ALL | ALL | 0.0.0.0/0 | Outbound (default) |

## Create Rule
hcloud VPC CreateSecurityGroupRule --security_group_rule.security_group_id=<sg-id> --security_group_rule.direction=ingress --security_group_rule.protocol=tcp --security_group_rule.multiport=22 --security_group_rule.remote_ip_prefix=1.2.3.4/32
