# HuaweiCloud DevKit

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![CI](https://github.com/huaweicloud-mate/huaweicloud-devkit/actions/workflows/ci.yml/badge.svg)](https://github.com/huaweicloud-mate/huaweicloud-devkit/actions/workflows/ci.yml)

帮助 AI 编码助手安全、准确地使用华为云——技能引导、KooCLI 工具、安全策略一站式集成。

HuaweiCloud DevKit 为 AI 编码助手提供操作华为云所需的知识、工具和安全护栏，支持 OpenCode、Codex、Claude Code、Cursor 等主流 Agent。

## 快速开始

### OpenCode

```bash
npx huaweicloud-devkit install
```

自动安装 27 个技能、MCP 服务器和安全策略，并更新 OpenCode 配置。安装后**重启会话**使 MCP 工具生效。

```bash
npx huaweicloud-devkit doctor   # 自检：hcloud、MCP、技能、认证
npx huaweicloud-devkit status   # 查看安装状态
```

### Codex

```bash
npx huaweicloud-devkit install --target codex
```

> **注意：** 如果未检测到 Codex CLI，安装程序会自动跳过 Codex。

### Claude Code

通过 **设置 → 插件 → 团队市场 → 添加市场 → 从仓库导入**，指向 `huaweicloud-mate/huaweicloud-devkit`。Claude Code 会自动索引插件。

安装插件：

```
/plugin install huaweicloud-core@huaweicloud-devkit
```

### Cursor

通过 **设置 → 插件 → 团队市场 → 添加市场 → 从仓库导入**，指向 `huaweicloud-mate/huaweicloud-devkit`。

然后在**插件**面板中安装 **huaweicloud-core** 插件。

### 其他 Agent

对于支持 Model Context Protocol (MCP) 的 Agent，手动配置 MCP 服务器：

```json
{
  "mcp": {
    "huaweicloud": {
      "type": "local",
      "command": ["node", "<路径>/plugins/huaweicloud-core/src/mcp-server.mjs"],
      "enabled": true
    }
  }
}
```

然后安装技能：

```bash
npx huaweicloud-devkit install
```

> **前置条件：** 需要安装 [KooCLI](https://support.huaweicloud.com/qs-hcli/hcli_02_003.html)（`hcloud`）并完成认证。MCP 服务器需要 Node.js >= 20。如果 `hcloud` 不在 `PATH` 中，请设置 `HCLOUD_BIN` 环境变量指向完整路径。

## 包含内容

### 插件

`huaweicloud-core` 插件将 MCP 服务器配置、27 个 Agent 技能和安全策略打包为一次性安装。

| 插件 | 说明 |
|------|------|
| [huaweicloud-core](plugins/huaweicloud-core/) | 核心插件，含技能、MCP 服务器、安全策略。**从这里开始。** |

### 技能

Agent 技能是经过整理的指令和参考材料包，帮助 Agent 完成特定的华为云任务。技能按需加载——Agent 只发现和检索与当前任务相关的内容。

包含 7 个元技能（路由、发现、CLI/认证、API/SDK、安全、排错、市场发现）和 20 个服务技能（覆盖 ECS、OBS、VPC、IAM、RDS、GaussDB、FunctionGraph、APIG、CCE、SMN/DMS、ModelArts、Cloud Eye、CTS、DEW、Billing、CBR、WAF/AAD、DDS/DCS、Deployment、Getting Started）。

浏览 [`skills/`](plugins/huaweicloud-core/skills/) 目录查看所有可用技能。

### Rules 文件

推荐的项目级配置文件，告诉 Agent 如何高效使用华为云——例如优先使用 MCP 服务器、发现可用技能、遵循最小权限 IAM 原则。

详见 [`rules/huawei-agent-rules.md`](rules/huawei-agent-rules.md)。

### MCP 服务器

本地 MCP 服务器（`plugins/huaweicloud-core/src/mcp-server.mjs`）通过 Model Context Protocol 为 Agent 提供安全的 KooCLI 访问。

- **安全优先执行** — 所有 `hcloud` 命令执行前自动分类（读/写/密钥），写操作需用户明确批准。
- **输出脱敏** — 凭证形态的值（AK/SK、Token、密码）自动替换为 `***REDACTED***`。
- **12 个结构化工具** — 技能搜索、CLI 检查、只读命令、区域发现、错误解释等。
- **零运行时依赖** — 纯 Node.js（>= 20），无需 npm install。

详见 [MCP 工具表](#mcp-工具)。

## 安全模型

三层防御体系：

| 层级 | 机制 | 说明 |
|------|------|------|
| 技能层 | `SKILL.md` 流程文档 | 教会 Agent 正确的行为规则和安全用法 |
| 钩子层 | `huaweicloud-safety.py` | PreToolUse Hook 阻断高风险工具调用（Claude Code、Cursor 可用） |
| MCP 层 | `safety-policy.mjs` | Node.js 安全策略包装器，在所有 Agent 环境中强制执行 |

详见 [`docs/safety-model.md`](docs/safety-model.md)。

## MCP 工具

| 类别 | 工具 | 说明 |
|------|------|------|
| 知识发现 | `huaweicloud_search_docs` | 跨技能文件及文档全文搜索 |
| 知识发现 | `huaweicloud_retrieve_skill` | 按名称加载完整技能内容及参考文件 |
| 知识发现 | `huaweicloud_list_regions` | 列出可用华为云区域 |
| 知识发现 | `huaweicloud_get_regional_availability` | 检查目标区域的服务可用性 |
| CLI | `huaweicloud_check_cli` | 检查 KooCLI `hcloud` 是否已安装 |
| CLI | `huaweicloud_plan_cli_command` | 分类计划命令（读/写/密钥）但不执行 |
| CLI | `huaweicloud_list_operations` | 列出服务的可用 KooCLI 操作 |
| CLI | `huaweicloud_run_readonly_command` | 执行只读命令并脱敏输出 |
| CLI | `huaweicloud_run_approved_command` | 经用户明确批准后执行写命令 |
| 安全 | `huaweicloud_show_profile_redacted` | 安全查看 KooCLI 配置（凭证脱敏） |
| 路由 | `huaweicloud_service_catalog` | 返回推荐的能力来源排序 |
| 排错 | `huaweicloud_explain_error` | 解释错误码并建议诊断步骤 |

## 文档

- [系统架构设计](docs/01-系统架构设计.md)
- [核心技能设计](docs/02-核心技能设计.md)
- [安全模型](docs/safety-model.md)
- [KooCLI 官方文档](https://support.huaweicloud.com/qs-hcli/hcli_02_003.html)

## 许可证

本项目基于 Apache-2.0 许可证发布。详见 [LICENSE](LICENSE)。
