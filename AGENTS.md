# AGENTS.md — HuaweiCloud Devkit

## Commands

```bash
npm test                 # all tests (node --test)
npm run validate         # structural validation
node --test test/structure.test.mjs   # single test file
node ./scripts/validate-package.mjs   # validation alone
```

No build step, no linter, no typecheck. Zero runtime npm dependencies.

## Architecture

This is an **agent guidance + safety package**, not a service encyclopedia. Six compact meta-skills route agent intent to the right capability path (Skills / KooCLI / API / SDK / MCP / Terraform).

```
plugins/huaweicloud-core/
  skills/           ← 6 meta-skills (*not* per-service)
  src/              ← Node.js MCP server (stdio JSON-RPC)
  safety/           ← shared policy.json
  hooks/            ← Python PreToolUse hook
  .codex-plugin/    ← Codex plugin manifest
  .mcp.json         ← MCP server config for agents
```

Safety is 3-layer: **skills teach → hooks block → MCP/CLI wrappers enforce**.

## File Naming: Design Docs vs Implementation

Design docs in `docs/` use `huawei-*` and plan 20+ service skills. The **actual implementation** uses `huaweicloud-*` and has 6 skills. Design docs are planning artifacts; trust the filesystem.

Exact skill list (tethered to `test/structure.test.mjs`):
`huaweicloud-api-and-sdk`, `huaweicloud-capability-discovery`, `huaweicloud-cli-and-auth`, `huaweicloud-core`, `huaweicloud-safety`, `huaweicloud-troubleshooting`

## Creating or Editing Skills

- Every `SKILL.md` must start with `---\nname: huaweicloud-<name>` YAML frontmatter (validated by both `npm run validate` and `structure.test.mjs`)
- No `TODO` or `[TODO]` markers in committed files (also validated)
- Skill count must remain exactly 6 — update `test/structure.test.mjs` when adding/removing
- Add `node --test` tests if introducing new measurable invariants

## Safety Model

Write operations are blocked by default. The only write path is `huaweicloud_run_approved_command`, which requires `approvedCommand` + `approvedByUser: true`.

Policy vocabulary lives in `plugins/huaweicloud-core/safety/policy.json`. Both `src/safety-policy.mjs` and `hooks/huaweicloud-safety.py` read from it. If you add a blocked pattern, update the policy JSON, not just one enforcement layer.

## Common Gotchas

- KooCLI 7.x uses `--param=value`, not space-separated. Array params are 1-indexed (`nics.1.subnet_id`, not `.0`).
- `hcloud` must be in PATH or `HCLOUD_BIN` set. Agent processes inherit the environment of their launcher.
- Codex manifest (`plugin.json`) must NOT include a `hooks` field — it fails schema validation.
- Skills are compact routing workflows, not service docs. Do not copy Huawei Cloud documentation into them. Point to `support.huaweicloud.com` instead.
- OpenCode integration lives in `integrations/opencode/` (separate from the plugin).
- Node >= 20 required, ESM only.
