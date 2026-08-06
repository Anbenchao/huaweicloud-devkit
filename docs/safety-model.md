# Safety Model

The toolkit assumes coding agents can accidentally expose secrets or perform expensive/destructive cloud operations. V1 therefore defaults to read-only execution and explicit approval gates.

## Blocked By Default

- Reading `.hcloud` or `.huaweicloud` credential files.
- Printing cloud credential environment variables.
- Calling secret-value APIs that return plaintext secret strings or binary secrets.
- Running write operations such as create, delete, update, resize, start, stop, authorize, revoke, attach, detach, enable, or disable without explicit approval.
- Echoing password-like fields such as `adminPass` back into generated reports or command output without a shell-history warning.

## Enforcement

- `plugins/huaweicloud-core/hooks/huaweicloud-safety.py` handles hook-capable agents.
- `plugins/huaweicloud-core/src/safety-policy.mjs` handles Codex/OpenCode MCP tools.
- `plugins/huaweicloud-core/safety/policy.json` stores the shared rule vocabulary.

## Write Operations

The default write path is planning: `huaweicloud_plan_cli_command` returns a command for review. The optional execution path is `huaweicloud_run_approved_command`, which requires an exact command string already shown to the user plus explicit approval. This is an agent workflow guardrail, not a substitute for IAM least privilege or human review.

## Non-Goals

This is not a hard security boundary. Users still need IAM least privilege, audit logs, secure local credential storage, and review of generated commands or code.
