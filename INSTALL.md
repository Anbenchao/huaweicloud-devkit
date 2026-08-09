# HuaweiCloud Devkit 安装指南

## 前置条件

- Node.js >= 20
- 华为云账号
- KooCLI (hcloud) 已安装并配置

## 安装 KooCLI

参考官方文档：https://support.huaweicloud.com/qs-hcli/hcli_02_003.html

```bash
hcloud version  # 验证安装
hcloud configure init  # 配置 AK/SK 和区域
```

## 安装插件 (Codex)

```powershell
.\scripts\install-codex-local.ps1
```

新建 Codex 会话，输入 `@HuaweiCloud-Devkit` 加载插件。

## 安装插件 (OpenCode)

```powershell
.\scripts\install-opencode-local.ps1
```

将 `integrations/opencode/opencode.json` 中的 MCP 配置合并到你的 OpenCode 配置中。

## 验证

```bash
npm test
npm run validate
```

预期输出：
- 16 个测试全部通过
- "Validated HuaweiCloud Devkit with 11 skills."

## 开发环境

```bash
npm install    # 项目零 npm 运行时依赖，此步仅安装 dev 依赖
npm test       # 运行测试套件
npm run validate  # 校验插件包结构
```

## 目录结构

```
huaweicloud-devkit/
├── .agents/plugins/marketplace.json    # Codex 市场清单
├── plugins/huaweicloud-core/           # 插件主体
│   ├── .codex-plugin/plugin.json
│   ├── .claude-plugin/plugin.json
│   ├── .cursor-plugin/plugin.json
│   ├── .mcp.json                       # MCP 服务器配置
│   ├── hooks/                          # 安全钩子
│   ├── safety/policy.json              # 安全策略
│   ├── skills/                         # 11 个技能
│   └── src/                            # MCP 服务器源码
├── integrations/opencode/              # OpenCode 集成
├── scripts/                            # 安装与校验脚本
├── test/                               # 测试套件
└── docs/                               # 设计文档
```