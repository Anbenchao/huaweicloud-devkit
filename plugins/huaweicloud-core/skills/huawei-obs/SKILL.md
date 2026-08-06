---
name: huawei-obs
description: "Use when creating, configuring, or managing OBS buckets and objects on Huawei Cloud. Covers bucket creation, lifecycle policies, versioning, static website hosting, CORS, access control (IAM/bucket policy/ACL), cross-region replication, event notifications, and presigned URLs. Triggers on: OBS, bucket, object storage, lifecycle, versioning, static website, CORS, presigned, replication. NOT for: EVS block storage (use huawei-ecs), SFS file storage, CBR backup (use huawei-cbr)."
version: 1
---

# Huawei Cloud OBS

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Overview

Domain expertise for Huawei Cloud Object Storage Service (OBS). Covers bucket/object lifecycle, access control, replication, hosting, and presigned URLs.

## Critical Warnings

| Trap | Why |
|------|-----|
| Bucket name is global | All Huawei Cloud users share bucket namespace. Choose unique name |
| Three-layer permissions | IAM > Bucket Policy > ACL. Most restrictive wins |
| Strong consistency since 2021 | PUT then GET guarantees latest version (read-after-write) |
| Versioning is irreversible | Once enabled, cannot be disabled, only suspended |
| Non-empty bucket blocks delete | Must clear all objects AND versions before delete |

## Common Workflows

| Task | Command | Steps |
|------|---------|-------|
| Create bucket | hcloud OBS CreateBucket --bucket=<name> --location=<region> | references/bucket-lifecycle.md |
| Upload object | hcloud OBS PutObject --bucket=<name> --key=<key> --body=<file> | references/upload.md |
| Set lifecycle | hcloud OBS SetLifecycleConfiguration --bucket=<name> --lifecycle=<json> | references/bucket-lifecycle.md |
| Enable website | hcloud OBS SetBucketWebsite --bucket=<name> --index=index.html | references/static-website.md |
| Set CORS | hcloud OBS SetBucketCors --bucket=<name> --cors=<json> | references/cors.md |
| Presigned URL | hcloud OBS CreateSignedUrl --bucket=<name> --key=<key> --expires=<seconds> | references/presigned.md |
| Cross-region replication | hcloud OBS SetBucketReplication --bucket=<name> --replication=<json> | references/replication.md |

## Storage Classes

| Class | Use Case | Min Storage | Retrieval Fee |
|-------|----------|-------------|---------------|
| STANDARD | Frequently accessed | None | No |
| STANDARD_IA | Infrequent access | 30 days | Yes |
| ARCHIVE | Long-term archive | 90 days | Yes (hours) |

## Troubleshooting

| Error | Root Cause -> Fix |
|-------|------------------|
| AccessDenied on bucket | IAM/bucket policy/ACL conflict -> Check all three layers |
| BucketAlreadyExists | Name already taken globally -> Choose different name |
| NoSuchKey | Object does not exist or wrong region -> Verify key and region |
| EntityTooLarge | Single PUT limit 5GB -> Use multipart upload |

## Security Considerations

- MUST block public access by default
- MUST use HTTPS-only for buckets
- SHOULD enable access logging for audit
- SHOULD rotate presigned URL expiry (max 7 days)
- MUST NOT store AK/SK in bucket policies

## MCP Tools

- huaweicloud_list_operations service=OBS
- huaweicloud_run_readonly_command for bucket/object discovery
- huaweicloud_run_approved_command for writes

## Without MCP

Fall back to hcloud CLI. State: "MCP unavailable, using local hcloud CLI."

## References

- OBS Docs: https://support.huaweicloud.com/obs/
- Lifecycle: references/bucket-lifecycle.md
- Replication: references/replication.md
