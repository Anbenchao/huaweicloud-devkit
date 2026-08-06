# HuaweiCloud Devkit

让 AI 编码助手安全、准确地使用华为云能力——技能引导、KooCLI 工具、安全策略一站式集成。

本项目遵循 `aws/agent-toolkit-for-aws` 的设计模式，当前版本聚焦于路由引导、安全管控和本地 CLI 使能，而非复制华为云全量服务文档。

## V1 能力范围

- Codex 插件包：`plugins/huaweicloud-core`
- OpenCode 集成资源：`integrations/opencode`
- **26 个技能**：6 个元技能（路由、发现、CLI/认证、API/SDK、安全、排错）+ 20 个服务技能（覆盖 ECS、OBS、VPC、IAM、RDS、GaussDB、FunctionGraph、APIG、CCE、SMN/DMS、ModelArts、Cloud Eye、CTS、DEW、Billing、CBR、WAF/AAD、DDS/DCS、Deployment、Getting Started）
- 零依赖 Node.js MCP 服务器：安全规划 + 只读 CLI 执行 + 4 个知识发现工具
- PreToolUse 安全钩子层
- 共享安全策略：自动脱敏 + 阻断危险操作
- KooCLI 操作发现、超时处理、网络重试退避、写操作精确命令审批

## V1 不做什么

- 不克隆所有华为云服务文档
- 不替代官方文档 `support.huaweicloud.com`
- 不暴露任意 `hcloud` 命令执行
- 不将 AK/SK、Token、密码或云端密钥值拉入 Agent 上下文
- 不以 Terraform 为默认路径（Terraform 仅为审查型 IaC 的备选方案）

写操作仅通过 `huaweicloud_run_approved_command` 执行，且要求精确命令字符串已被展示并获用户明确批准。更安全的默认方式是使用 `huaweicloud_plan_cli_command` 返回可复制的命令块。

## 架构

```text
开发者请求
  -> huaweicloud-core 路由技能
  -> 能力路径选择（技能 / KooCLI / API / SDK / MCP / Terraform）
  -> 安全策略与审批关卡
  -> 只读验证
```

## 安装 (Codex)

从仓库根目录运行：

```powershell
.\scripts\install-codex-local.ps1
```

然后新建 Codex 会话，输入 `@huaweicloud-core`。

## 安装 (OpenCode)

```powershell
.\scripts\install-opencode-local.ps1
```

将 `integrations/opencode/opencode.json` 中的 MCP 示例合并到你的 OpenCode 配置。

## 开发

```bash
npm test
npm run validate
```

项目运行时零 npm 依赖。

## KooCLI

从 https://support.huaweicloud.com/qs-hcli/hcli_02_003.html 安装华为云 KooCLI，执行 `hcloud version` 验证，然后在 Agent 会话之外配置凭证。如果 Codex 或 OpenCode 找不到可执行文件，设置 `HCLOUD_BIN` 为 `hcloud` 的完整路径。

## 安全模型

三层防御：

- **技能层**：教会 Agent 正确行为规则
- **钩子层**：PreToolUse Hook 阻断高风险工具调用
- **MCP 层**：Node.js 安全策略 wrapper 在无钩子环境下强制执行

详见 `docs/safety-model.md`。

## 技能矩阵

### 元技能（路由与基础能力）

| 技能 | 用途 |
|------|------|
| huaweicloud-core | 路由中枢，Sub-skill registry 表，18 个路由入口 |
| huaweicloud-capability-discovery | 能力发现，场景→服务映射 |
| huaweicloud-cli-and-auth | KooCLI 安装、认证、安全用法 |
| huaweicloud-api-and-sdk | API/SDK 应用集成指导 |
| huaweicloud-safety | 安全策略、审批关卡、写操作边界 |
| huaweicloud-troubleshooting | 排错诊断工作流 |

### 服务技能

| 技能 | 华为云服务 |
|------|-----------|
| huawei-ecs | 弹性云服务器 ECS |
| huawei-obs | 对象存储服务 OBS |
| huawei-vpc | 虚拟私有云 VPC |
| huawei-iam | 统一身份认证 IAM |
| huawei-rds | 关系型数据库 RDS |
| huawei-gaussdb | 分布式数据库 GaussDB |
| huawei-functiongraph | 函数工作流 FunctionGraph |
| huawei-apig | API 网关 APIG |
| huawei-cce | 云容器引擎 CCE |
| huawei-smn-dms | 消息通知 SMN + 分布式消息 DMS |
| huawei-modelarts | AI 开发平台 ModelArts |
| huawei-cloud-eye | 云监控 Cloud Eye |
| huawei-cts | 云审计服务 CTS |
| huawei-dew | 数据加密服务 DEW (CSMS + KMS) |
| huawei-billing | 费用中心 Billing |
| huawei-cbr | 云备份 CBR |
| huawei-waf-aad | Web 应用防火墙 WAF + Anti-DDoS |
| huawei-dds-dcs | 文档数据库 DDS + 分布式缓存 DCS |
| huawei-deployment | 部署服务 CloudDeploy |
| huawei-getting-started | 入门引导 |

## MCP 工具

| 类别 | 工具 | 说明 |
|------|------|------|
| 发现 | huaweicloud_search_docs | 跨技能/文档全文搜索 |
| 发现 | huaweicloud_retrieve_skill | 按名称加载完整技能 |
| 发现 | huaweicloud_list_regions | 列出可用区域 |
| 发现 | huaweicloud_get_regional_availability | 检查服务区域可用性 |
| CLI | huaweicloud_check_cli | 检查 hcloud 安装状态 |
| CLI | huaweicloud_plan_cli_command | 分类并规划命令（不执行） |
| CLI | huaweicloud_list_operations | 列出服务的 KooCLI 操作 |
| CLI | huaweicloud_run_readonly_command | 执行只读命令 |
| CLI | huaweicloud_run_approved_command | 执行已批准的写命令 |
| 安全 | huaweicloud_show_profile_redacted | 安全查看配置（脱敏） |
| 路由 | huaweicloud_service_catalog | 返回推荐的能力来源 |
| 排错 | huaweicloud_explain_error | 解释错误并建议诊断步骤 |

## 许可证

Apache-2.0
