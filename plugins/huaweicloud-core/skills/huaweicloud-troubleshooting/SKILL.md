---
name: huaweicloud-troubleshooting
description: Troubleshoot Huawei Cloud CLI, API, SDK, deployment, permission, region, quota, endpoint, and resource errors. Use when commands fail, APIs return errors, resources are missing, or the user needs a structured diagnosis.
---

# Huawei Cloud Troubleshooting


**STOP - Do not answer from general knowledge.** Follow the procedure below.

Use evidence before fixes. Do not guess service behavior when request IDs, region, project_id, and exact errors can identify the issue.

## Workflow

1. Capture the redacted error message, service, operation, region, project_id, and request_id.
2. Classify likely cause:
   - auth or permission
   - wrong region or endpoint
   - wrong project_id
   - missing resource
   - quota or account limit
   - invalid request body
   - service-side failure
3. Run the smallest read-only check that can prove or disprove the cause.
4. Compare with official API/SDK docs or Huawei Cloud Skills if the operation contract is uncertain.
5. Propose one fix at a time.
6. Verify with read-only observation after the fix.

## Common Checks

- Authentication: profile exists, credential source is configured, identity has permission.
- Region: CLI region, endpoint, and resource region match.
- Project: request path uses the project_id for the target region.
- Pagination: resource may exist on a later page.
- Quota: create or scale failure may require quota inspection.
- IAM: permission errors need exact action and resource scope.
