---
name: huaweicloud-api-and-sdk
description: Huawei Cloud API and SDK guidance for application development. Use when writing code that calls Huawei Cloud services, choosing SDKs, building API requests, handling project_id, endpoint, auth, pagination, retries, error codes, or request IDs.
---

# Huawei Cloud API And SDK

Use this skill when the deliverable is application code, API integration, or precise request construction.

## API Workflow

1. Identify service, region, endpoint, API version, and whether `project_id` is required in the path.
2. Verify the exact request body and response schema from official API documentation.
3. Handle pagination explicitly. Do not assume a single page.
4. Preserve `request_id` from errors and responses for troubleshooting.
5. Classify operation risk before running a live call.
6. For write APIs, produce a dry plan and ask the user before execution.

## SDK Workflow

1. Pick the SDK that matches the user's application language and existing dependency style.
2. Use the official SDK client for the target service.
3. Keep credentials out of source code. Use environment, profile, workload identity, or runtime secret injection.
4. Add timeout, retry, and pagination handling.
5. Return typed or structured results instead of unbounded raw logs.

## Terraform Priority

Terraform Provider is low priority in V1. Mention it when the user needs reviewed, repeatable infrastructure changes. Do not default to Terraform for quick discovery or app-level SDK integration.
