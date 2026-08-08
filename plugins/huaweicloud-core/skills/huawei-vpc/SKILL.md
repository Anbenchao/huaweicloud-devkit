---
name: huawei-vpc
description: "Use when creating, configuring, or managing VPC networks, subnets, security groups, EIPs, NAT gateways, VPN connections, load balancers, or network ACLs on Huawei Cloud. Triggers on: VPC, subnet, security group, EIP, NAT, VPN, load balancer, ELB, network ACL, route table, bandwidth. NOT for: DNS or CDN configuration."
version: 1
---

# Huawei Cloud VPC

**STOP - Do not answer from general knowledge.** Follow the procedure below.

Always run `hcloud <Service> <Operation> --help` before constructing commands to discover exact parameter names and requirements.

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
| EIP PER type needs `--bandwidth.name` | PER bandwidth requires explicit name; `--help` marks it optional but it's required |
| **VPC params need nested prefix** | KooCLI 7.x VPC API uses `--vpc.<param>`, `--subnet.<param>`, `--security_group.<param>`. Example: `--vpc.name=xxx` NOT `--name=xxx` |
| **Security group needs no vpc_id** | VPC v3 API `CreateSecurityGroup` does NOT accept `vpc_id`. Security groups are region-level, not VPC-bound |

## Common Workflows

| Task | Command | Steps |
|------|---------|-------|
| Create VPC | hcloud VPC CreateVpc --vpc.name=<name> --vpc.cidr=<cidr> | CIDR must not conflict with existing VPCs. Run `hcloud VPC ListVpcs` first |
| Create subnet | hcloud VPC CreateSubnet --subnet.name=<name> --subnet.vpc_id=<id> --subnet.cidr=<cidr> --subnet.availability_zone=<az> | Subnet CIDR must be a subset of the VPC CIDR |
| Security group | hcloud VPC CreateSecurityGroup --security_group.name=<name> | references/security-group.md |
| SG rule | hcloud VPC CreateSecurityGroupRule --security_group_rule.security_group_id=<id> --security_group_rule.direction=ingress --security_group_rule.protocol=tcp --security_group_rule.multiport=22 --security_group_rule.remote_ip_prefix=<cidr> | references/security-group.md |
| Create EIP | hcloud EIP CreatePublicip --publicip.type=5_bgp --bandwidth.size=5 --bandwidth.share_type=PER --bandwidth.name=<name> | Run `hcloud EIP CreatePublicip --help` to confirm valid type values per region |
| Bind EIP to ECS | hcloud EIP AssociatePublicips --publicip_id=<id> --publicip.associate_instance_id=<port-id> --publicip.associate_instance_type=PORT | Get port ID from `hcloud ECS ListServersDetails --server_id=<id>` → `OS-EXT-IPS:port_id` |
| Unbind EIP | hcloud EIP UnbindPublicIp --publicip_id=<id> | references/eip.md |
| List EIPs | hcloud EIP ListPublicips | |
| NAT gateway | hcloud NAT CreateNatGateway --nat.name=<name> --nat.spec=<spec> --router_id=<vpc-id> --internal_network_id=<subnet-id> | Run `hcloud NAT CreateNatGateway --help` for available spec values |

## Troubleshooting

| Error | Root Cause -> Fix |
|-------|------------------|
| Cannot reach instance | SG missing rule or no EIP -> Add SG rule / Bind EIP |
| Subnet CIDR conflict | Overlapping with existing subnets -> Choose non-overlapping CIDR |
| NAT gateway no internet | Route table missing default route -> Add 0.0.0.0/0 via NAT |
| EIP quota exceeded | Default quota 10 per account -> Request quota increase |
| EIP.7905 | Run `hcloud EIP ListPublicips --cli-region=<r>` first to check current usage |
| VPC.0301: Bandwidth name invalid | PER type requires `--bandwidth.name`, even though `--help` marks it optional |
| EIP has no public IP after binding | May need AddIngressEipV2 for ELB-type resources (see huawei-apig) |

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
