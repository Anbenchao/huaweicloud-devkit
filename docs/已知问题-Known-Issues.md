# 已知问题 / Known Issues

> 来源: FunctionGraph 部署测试 (R1–R3), 2026-08-06

---

## 1. 首次认证配置 — Agent 环境中 `hcloud configure init` 不可用

**影响**: 对首次使用的用户，插件无法帮助 Agent 完成认证。

**根因**: `hcloud configure init` 是交互式 TUI，需要真正的终端交互输入 (y/N 等)。在 Agent 工具链中，无法传递交互输入。

**现状**:
- `hcloud configure set` 非交互式替代方案需要用户提供 AK/SK，但插件安全规则禁止在聊天中粘贴凭证
- 测试中能通过认证是因为环境中已预先存在手动配置好的 profile，而非插件完成

**需改动的技能**: `huaweicloud-cli-and-auth/SKILL.md`

**建议方案**:
- 提供 "配置就绪检查" 工作流: Agent 先 `hcloud configure list`，若无可用 profile，给用户清晰的命令模板并等待确认
- 提供引导用户离线配置的 step-by-step 指令，而非尝试在当前工具中执行交互式命令

---

## 2. 跨平台安装脚本缺失

**影响**: Linux 环境下需手动执行安装步骤，仅有 PowerShell 脚本 (install-opencode.ps1)。

**现状**: 插件安装步骤在 Linux 下无自动化脚本，需要手动:
- 复制 skills/ 到 `~/.config/opencode/skills/`
- 复制 commands/ 到 `~/.config/opencode/commands/`
- 编辑 opencode.jsonc 配置 MCP 路径

**归属**: 仓库基础设施 (非具体技能)

**建议**: 提供 `install-opencode.sh` Bash 安装脚本。

---

## 3. MCP Server 工具在 OpenCode 中未暴露

**影响**: 安全策略无法在 MCP 层强制执行，Agent 降级为直接使用 `hcloud` CLI，失去安全防护层。

**根因**: `integrations/opencode/opencode.json` 中的 MCP server 路径为相对路径 (`../../plugins/huaweicloud-core/src/mcp-server.mjs`)。当配置合并到 `~/.config/opencode/opencode.jsonc` 时，相对路径无法正确解析。

**现状**: 12 个 MCP 工具全部缺失 (search_docs, retrieve_skill, list_regions, check_cli, plan_cli_command, list_operations, run_readonly_command, run_approved_command, show_profile_redacted, service_catalog, explain_error, get_regional_availability)。

**建议**:
- 安装脚本中自动将相对路径替换为绝对路径
- 或在 opencode.json 中增加 `_note` 指引用户手动修改
