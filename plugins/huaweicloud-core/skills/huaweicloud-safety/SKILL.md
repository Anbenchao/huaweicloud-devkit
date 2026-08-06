---
name: huaweicloud-safety
description: Huawei Cloud safety policy for agents. Use when handling credentials, secrets, IAM, public exposure, billing, destructive actions, scaling, write operations, hooks, command approval, output redaction, or risk review.
---

# Huawei Cloud Safety

Use this skill before any Huawei Cloud action that may expose secrets, change resources, affect cost, change IAM, or expose a network endpoint.

## Rules

1. Never ask the user to paste AK/SK, SK, tokens, passwords, private keys, or credential files.
2. Never read local `.hcloud` or `.huaweicloud` credential files into the agent context.
3. Never call APIs or CLI operations that return secret values directly into the agent context.
4. Always classify operations before execution:
   - read-only
   - write
   - secret
   - IAM/security
   - cost/payment
   - public exposure
5. For any non-read-only operation, show the exact planned change and wait for explicit user approval.
6. Redact secrets from command output, errors, JSON, logs, and generated reports.
7. If a command contains `adminPass`, `password`, token, or any secret-like field, warn that plaintext can remain in shell history. Prefer local-only input, runtime injection, or user-side execution.

## Enforcement Layers

- Hooks: `hooks/huaweicloud-safety.py` can block risky tool calls on platforms that support plugin hooks.
- MCP wrapper: the Node MCP server applies the same safety policy for Codex/OpenCode paths that do not enforce hooks.
- Skills: this document teaches agents the rule before they act.

## Write Execution Boundary

- Default path: use `huaweicloud_plan_cli_command` to produce a reviewed command block, then let the user or host agent execute it after approval.
- Approved tool path: use `huaweicloud_run_approved_command` only when the exact planned command has been shown and the user explicitly approved that exact command.
- After a write, verify with `huaweicloud_run_readonly_command` or another read-only check.

## Safe Alternatives

- Use redacted profile inspection instead of raw `hcloud configure show`.
- Use runtime secret injection instead of fetching secret values into chat.
- Use read-only verification after a write.
- Prefer reviewed IaC for durable infrastructure changes.
