---
name: huawei-vpc
description: "Use when creating, configuring, or managing VPC networks, subnets, security groups, EIPs, NAT gateways, VPN connections, load balancers, or network ACLs on Huawei Cloud. Triggers on: VPC, subnet, security group, EIP, NAT, VPN, load balancer, ELB, network ACL, route table, bandwidth. NOT for: DNS or CDN configuration."
version: 1
---

# Huawei Cloud VPC

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Overview

Domain expertise for Huawei Cloud Virtual Private Cloud (VPC). Covers VPC/subnet lifecycle, security groups, EIP management, NAT gateways, VPN, load balancers, and network ACLs.

## Critical Warnings

| Trap | Why |
|------|-----|
| VPC CIDR cannot change | Once set, VPC CIDR block is immutable |
| Security group stateful | SG rules are stateful. Return traffic auto-allowed |
| Network ACL stateless | ACL rules must allow both inbound AND outbound |
| EIP bills when idle | Unbound EIP still charges. Release when unused |
| Subnet AZ binding | Subnet tied to single AZ. Cross-AZ needs multiple subnets |

## Common Workflows

| Task | Command | Steps |
|------|---------|-------|
| Create VPC | hcloud VPC CreateVpc --vpc.name=<name> --vpc.cidr=192.168.0.0/16 | references/vpc.md |
| Create subnet | hcloud VPC CreateSubnet --subnet.name=<name> --subnet.vpc_id=<id> --subnet.cidr=192.168.1.0/24 --subnet.availability_zone=<az> | references/subnet.md |
| Security group | hcloud VPC CreateSecurityGroup --security_group.name=<name> | references/security-group.md |
| SG rule | hcloud VPC CreateSecurityGroupRule --security_group_id=<id> --direction=ingress --protocol=tcp --port=22 --remote_ip_prefix=<cidr> | references/security-group.md |
| Create EIP | hcloud EIP CreatePublicip --bandwidth.size=5 --bandwidth.share_type=PER | references/eip.md |
| NAT gateway | hcloud NAT CreateNatGateway --nat.name=<name> --nat.spec=1 --router_id=<vpc-id> --internal_network_id=<subnet-id> | references/nat.md |

## Troubleshooting

| Error | Root Cause -> Fix |
|-------|------------------|
| Cannot reach instance | SG missing rule or no EIP -> Add SG rule / Bind EIP |
| Subnet CIDR conflict | Overlapping with existing subnets -> Choose non-overlapping CIDR |
| NAT gateway no internet | Route table missing default route -> Add 0.0.0.0/0 via NAT |
| EIP quota exceeded | Default quota 10 per account -> Request quota increase |

## Security Considerations

- MUST use security groups, NOT iptables
- MUST scope SG rules to specific CIDRs, NOT 0.0.0.0/0
- SHOULD use network ACLs as defense-in-depth
- SHOULD place databases in private subnets (no EIP)
- MUST enable VPC flow logs for audit

## MCP Tools

- huaweicloud_list_operations service=VPC
- huaweicloud_run_readonly_command for VPC/subnet discovery
- huaweicloud_run_approved_command for writes

## References

- VPC Docs: https://support.huaweicloud.com/vpc/
- Subnet guide: references/subnet.md
- Security group: references/security-group.md
