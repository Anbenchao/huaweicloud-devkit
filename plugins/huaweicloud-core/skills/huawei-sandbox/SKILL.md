---
name: huawei-sandbox
description: "Use when creating, connecting, or managing Huawei Cloud Sandbox instances and workspace terminals. Covers sandbox lifecycle (connect, release), terminal execution (one-shot and session-based), and credential injection. Triggers on: sandbox, workspace, terminal, hwlink, devstation, hdkitservice, remote exec. NOT for: ECS instances (use huawei-ecs), CCE clusters (use huawei-cce)."
version: 1
---

# Huawei Cloud Sandbox

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Overview

Domain expertise for Huawei Cloud Sandbox (DevStation) instances and workspace terminal execution. Covers sandbox lifecycle via hdkitservice API and remote terminal command execution via hwlink protocol.

## MCP Tools

### Sandbox Lifecycle

| Tool | Purpose |
|------|---------|
| `huaweicloud_sandbox_connect` | Create, boot, and connect to a sandbox in one call |
| `huaweicloud_sandbox_credentials` | Inject temporary AK/SK into a running sandbox |
| `huaweicloud_sandbox_release` | Shut down and delete a sandbox |

### Terminal Execution

| Tool | Purpose |
|------|---------|
| `huaweicloud_sandbox_exec` | One-shot command execution (no session reuse) |
| `huaweicloud_sandbox_exec_with_session` | Session-based execution (state persists) |
| `huaweicloud_sandbox_close_session` | Close a persistent terminal session |

## Workflow

1. **Connect**: `huaweicloud_sandbox_connect` — returns `session_id`, `dev_stage_id`, `connection_id`, `connection_address`
2. **Inject credentials** (optional): `huaweicloud_sandbox_credentials` — enables cloud API access from sandbox
3. **Execute commands**: `huaweicloud_sandbox_exec_with_session` for interactive work, `huaweicloud_sandbox_exec` for one-shot
4. **Release**: `huaweicloud_sandbox_release` — cleans up sandbox and session

## Critical Warnings

| Trap | Why |
|------|-----|
| Session state persists | `exec_with_session` preserves `cd`, env vars, aliases between calls |
| No session reuse in `exec` | Each `exec` call creates a new connection; previous state is lost |
| Destructive commands blocked | `rm -rf /`, `mkfs`, `dd if=`, fork bombs are denied by safety policy |
| Workspace ID required | Set `HW_WORKSPACE_ID` env var or pass `workspace_id` parameter |
| Node.js >= 22 required | Sandbox terminal uses built-in WebSocket (globalThis.WebSocket) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HW_ACCESS_KEY` | Yes | Huawei Cloud AK |
| `HW_SECRET_KEY` | Yes | Huawei Cloud SK |
| `HW_SECURITY_TOKEN` | No | STS security token |
| `HW_WORKSPACE_ID` | No | Default workspace ID |
| `HDKITSERVICE_ENDPOINT` | No | hdkitservice API endpoint |
| `HWLINK_ENDPOINT` | No | DevStation API endpoint |
