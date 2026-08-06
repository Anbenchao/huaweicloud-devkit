---
name: huawei-smn-dms
description: "Use when creating or managing SMN topics/subscriptions/messages or DMS Kafka/RabbitMQ/RocketMQ queues on Huawei Cloud. Triggers: SMN, DMS, notification, message queue, Kafka, RabbitMQ, RocketMQ, topic, subscription. NOT for: APIG (use huawei-apig), FunctionGraph triggers (use huawei-functiongraph)."
version: 1
---

# Huawei Cloud SMN & DMS

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Critical Warnings
| Trap | Why |
|------|-----|
| SMN subscriptions must be confirmed | HTTP/HTTPS endpoints need manual confirmation |
| DMS Kafka version immutable | Cannot upgrade minor version in-place |
| Message retention has costs | Longer retention increases storage charges |

## Common Workflows
| Task | Command |
|------|---------|
| Create SMN topic | hcloud SMN CreateTopic --name=<n> --display_name=<d> --cli-region=<r> |
| Publish message | hcloud SMN PublishMessage --topic_urn=<urn> --subject=<s> --message=<m> |
| List Kafka instances | hcloud DMS ListInstances --engine=kafka --cli-region=<r> |
| Create Kafka topic | hcloud DMS CreateInstanceTopic --instance_id=<id> --topics='[{"name":"t1","partition":3}]' |

## Troubleshooting
| Error | Fix |
|-------|-----|
| Subscription not confirmed | Check endpoint/email for confirmation link |
| DMS connection refused | Verify VPC/subnet and security group rules |

## Security
- MUST use HTTPS endpoints for SMN subscriptions
- MUST enable DMS access control (ACL)
- MUST store SMN/DMS credentials in DEW/CSMS
