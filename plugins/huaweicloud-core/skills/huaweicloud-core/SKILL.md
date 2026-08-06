---
name: huaweicloud-core
description: Primary Huawei Cloud agent routing skill. Use when a developer asks Codex or OpenCode to build, deploy, debug, operate, or integrate an application with Huawei Cloud; choose among Huawei Cloud Skills, KooCLI, APIs, SDKs, future MCP tools, and low-priority Terraform guidance.
---

# Huawei Cloud Core

Use this as the first Huawei Cloud skill. Its job is routing, not encyclopedic service coverage.

## Operating Model

1. Restate the developer goal in one sentence.
2. Choose the smallest reliable capability path:
   - Huawei Cloud Skills: scenario workflows and task recipes.
   - KooCLI `hcloud`: local inspection, account context, and reviewed command execution.
   - API docs: exact endpoint, project_id, pagination, request body, and error contract.
   - SDK docs: application code integration.
   - MCP: prefer official or approved structured tools when available.
   - Terraform: low-priority V1 path; use only when repeatable reviewed IaC is clearly needed.
3. Load only the next relevant skill or reference. Do not load service documentation broadly.
4. Before any write operation, show the planned command/API/IaC change and get explicit user approval.
5. After execution, verify with a read-only command, API response, log, or metric.
6. Before guessing a KooCLI operation, use `huaweicloud_list_operations` or `hcloud <Service> --help`.

## Routing Rules

- Use `huaweicloud-capability-discovery` when the user names a scenario but not the concrete Huawei Cloud service or API.
- Use `huaweicloud-cli-and-auth` when credentials, profile, region, project_id, KooCLI, or local inspection is involved.
- Use `huaweicloud-api-and-sdk` when writing code that calls Huawei Cloud APIs or SDKs.
- Use `huaweicloud-safety` when secrets, credentials, payment, public exposure, IAM, deletion, scaling, or other risky actions appear.
- Use `huaweicloud-troubleshooting` for API errors, failed CLI commands, quota issues, resource not found, or permission failures.

## Tool Boundary

- Use `huaweicloud_run_readonly_command` for read-only inspection and local help.
- Use `huaweicloud_run_approved_command` only after exact-command approval.
- Do not scan all regions when the user gave a region hint; ask when the target/reference region is unclear.

## Quality Bar

Prefer short, precise instructions with commands the developer can run. Give source names and exact fields to verify. Avoid inventing service behavior; when uncertain, route to Huawei Cloud Skills or official API/SDK documentation.
