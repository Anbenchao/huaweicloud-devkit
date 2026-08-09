# Issue P3: MCP 工具安装后需重启会话才能生效

## 问题描述

`huaweicloud-devkit install` 成功后，MCP 工具在当前会话中不可用，需要重启 OpenCode 会话。安装输出明确提示 "Restart your OpenCode session now!"。

对于 Agent 在安装后立即执行任务的场景（如本次测试），MCP 的安全脱敏（凭证替换为 `***REDACTED***`）和写操作审批功能不可用。Agent 只能使用 fallback 模式直接执行 hcloud CLI，命令和输出会出现在 shell 历史中。

## 位置

- README.md "快速开始" 章节
- 安装输出: "IMPORTANT: Restart your OpenCode session now!"

## 影响

1. 安装后同会话无法使用 MCP 的 12 个结构化工具
2. 安全脱敏功能不可用（AK/SK、Token、密码可能出现在输出中）
3. 写操作审批功能不可用（`huaweicloud_run_approved_command`）
4. Agent 需降级为直接 hcloud CLI 执行

## 当前缓解措施

技能中有 "Without MCP (Fallback)" 指导（`SKILL.md` 第 104-114 行），Agent 可降级使用 hcloud CLI，但需手动注意安全。

## 建议

1. 考虑是否能在不重启的情况下热加载 MCP 工具
2. 在 README 中更显著地标注 "安装后必须重启会话"
3. 在技能的 fallback 指导中增加更多安全注意事项

## 环境信息

- OpenCode + Node.js v24.18.0
- 插件: huaweicloud-devkit v0.1.0
- Doctor 自检: 8/8 通过 (包括 "MCP server can start")

## 证据

- 安装输出含 "IMPORTANT: Restart your OpenCode session now!"
- Doctor 全部通过但 MCP 工具在同会话不可用
- 详见 `evidence-chain.md` P3 章节
