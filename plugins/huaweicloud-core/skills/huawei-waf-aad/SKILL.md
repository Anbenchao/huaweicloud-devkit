---
name: huawei-waf-aad
description: "Use when configuring Web Application Firewall (WAF) policies/rules, or Anti-DDoS (AAD) protection on Huawei Cloud. Triggers: WAF, AAD, firewall, DDoS, web protection, IP blacklist, rate limiting, CC attack. NOT for: security groups (use huawei-vpc), CTS audit (use huawei-cts)."
version: 1
---

# Huawei Cloud WAF & AAD

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Critical Warnings
| Trap | Why |
|------|-----|
| WAF needs CNAME redirect | Update DNS to point to WAF CNAME |
| AAD Standard vs Enterprise | Enterprise has dedicated IP, Standard is shared |
| Premium WAF instance required | Cloud WAF (basic) has limited rules |

## Common Workflows
| Task | Command |
|------|---------|
| Create WAF policy | hcloud WAF CreatePolicy --name=<n> --cli-region=<r> |
| Create WAF rule | hcloud WAF CreateRule --policy_id=<id> --rule_type=cc --conditions='[{"category":"url","contents":["/api"]}]' |
| List WAF policies | hcloud WAF ListPolicy --cli-region=<r> |
| Query AAD protection | hcloud AAD ListProtectedIp --cli-region=<r> |

## Troubleshooting
| Error | Fix |
|-------|-----|
| Site not protected | Verify DNS CNAME points to WAF |
| Legit traffic blocked | Add IP to WAF whitelist |

## Security
- MUST enable WAF for all public-facing web services
- MUST configure rate limiting for API endpoints
- MUST use WAF with ELB, not direct ECS exposure
