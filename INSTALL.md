# HuaweiCloud DevKit 安装指南

## 快速开始（AI Agent）

### 第 1 步 — 安装依赖

**Node.js >= 20**

```bash
node -v   # 确认版本 >= 20
```

**KooCLI（hcloud）**

```bash
# Windows：自动下载安装
npx --yes huaweicloud-devkit install-hcloud

# Linux / macOS：打印安装命令，手动执行
npx --yes huaweicloud-devkit install-hcloud
```

安装过程中会提示确认隐私协议（`y/N`），输入 `y` 即可。完成后验证：
```bash
hcloud version   # 应输出 KooCLI 版本号
```

> **Windows 用户**：hcloud 安装在 `%USERPROFILE%\hcloud\hcloud.exe`。如果 `hcloud` 不在 PATH 中，后续步骤会自动检测并注入 `HCLOUD_BIN`。
>
> **CodeArts 沙箱模式**：沙箱会阻止 KooCLI 写入配置目录，请使用码道外终端安装 KooCLI。

### 第 2 步 — 配置认证

**交互式（推荐，安全）**：
```bash
hcloud configure init
```
按提示输入 AK、SK、区域。

**非交互式（有安全风险，AK/SK 进入 shell history）**：
```bash
hcloud configure set --cli-access-key=<AK> --cli-secret-key=<SK> --cli-region=<region>
```

验证：
```bash
hcloud configure list   # 应显示配置的 AK/SK/region
```

### 第 3 步 — 安装插件

**OpenCode / 通用 Agent**

```bash
npx --yes huaweicloud-devkit install
```

**CodeArts Agent（码道）**

```bash
npx --yes huaweicloud-devkit install --target codearts
```

**Codex（CLI 版本）**

```bash
npx --yes huaweicloud-devkit install --target codex
```

> 需要先安装 [Codex CLI](https://github.com/openai/codex-cli)。

**Codex Desktop**

```bash
npx --yes huaweicloud-devkit install --target codex-desktop
```

安装到 `~/.agents/` 目录：skills、MCP 插件、安全策略，通过 `.mcp.json` 注册。

**一键安装所有目标**

```bash
npx --yes huaweicloud-devkit install --target all
```

安装完成后输出提示：
```
MCP 工具在重启 OpenCode 会话后才生效
关闭当前会话 → 重新打开，直接描述华为云任务即可
重启前请勿执行 hcloud 命令，避免 AK/SK 泄露
```

### 第 4 步 — 验证

```bash
npx --yes huaweicloud-devkit doctor
```

预期输出：
```
[PASS] Node.js >= 20
[PASS] MCP server installed
[PASS] Safety policy installed
[PASS] MCP configured
[PASS] hcloud CLI installed
[PASS] hcloud credentials configured
[PASS] Skills installed (27)

Results: 7 pass, 0 warn, 0 fail
All checks passed.
```

### 第 5 步 — 重启会话

**必须关闭当前 Agent 会话并重新打开**，MCP 工具（14 个）才会生效。重启后直接描述华为云任务即可，例如：

> 帮我在北京四创建一个 ECS 实例，安装 Nginx，绑 EIP，浏览器能访问 "Hello World"。

---

## 各平台详细说明

### OpenCode

**自动安装**（第 3 步即可完成）：
- 27 个技能 → `~/.config/opencode/skills/`
- MCP 服务器 → `~/.config/opencode/huaweicloud-plugins/src/`
- 安全策略 → `~/.config/opencode/huaweicloud-plugins/safety/`
- MCP 配置 → `~/.config/opencode/opencode.jsonc`

**配置格式**：
```json
{
  "mcp": {
    "huaweicloud-devkit": {
      "type": "local",
      "command": ["node", "C:/Users/<用户名>/.config/opencode/huaweicloud-plugins/src/mcp-server.mjs"],
      "enabled": true
    }
  }
}
```

**常用命令**：
```bash
npx --yes huaweicloud-devkit status    # 查看安装状态
npx --yes huaweicloud-devkit update    # 更新到最新版
npx --yes huaweicloud-devkit uninstall # 卸载
```

### CodeArts Agent（码道）

**自动安装**：
- 技能 → `~/.codeartsdoer/skills/` + 项目 `.codeartsdoer/skills/`
- MCP → 用户级 + 项目级 `mcp_settings.json`
- 自动注入 `HCLOUD_BIN`（若检测到 `~/hcloud/hcloud.exe`）

**沙箱模式注意**：码道默认 `bash_mode: sandbox` 阻止 KooCLI 写入配置。若 `doctor` 提示沙箱警告，请：
- 方案 A：在码道外终端安装使用 KooCLI（推荐）
- 方案 B：关闭沙箱模式（设置 → 权限 → Bash 模式）后重试

**认证**：KooCLI 就绪后，在码道外终端执行 `hcloud configure init` 配置 AK/SK。

### Codex

需要先安装 [Codex CLI](https://github.com/openai/codex-cli)。

```bash
# 安装
npx --yes huaweicloud-devkit install --target codex

# 在 Codex 中使用
@huaweicloud-core 帮我创建一台 ECS
```

### Codex Desktop

```bash
npx --yes huaweicloud-devkit install --target codex-desktop
```

安装到 `~/.agents/` 目录：
- 技能 → `~/.agents/skills/`
- MCP + 安全策略 → `~/.agents/huaweicloud-plugins/`
- MCP 注册 → `~/.agents/huaweicloud-plugins/.mcp.json` + `~/.agents/opencode.json`

### Claude Code

通过 **设置 → 插件 → 团队市场 → 添加市场 → 从仓库导入**，指向 `huaweicloud/HuaweiCloud-Devkit`。

安装插件：
```
/plugin install huaweicloud-core@huaweicloud-devkit
```

### Cursor

通过 **设置 → 插件 → 团队市场 → 添加市场 → 从仓库导入**，指向 `huaweicloud/HuaweiCloud-Devkit`。然后在插件面板中安装 **huaweicloud-core**。

---

## MCP 工具列表

| 工具 | 说明 |
|------|------|
| `huaweicloud_check_cli` | 检查 KooCLI 安装状态 |
| `huaweicloud_plan_cli_command` | 规划命令（分类读/写/密钥，不执行） |
| `huaweicloud_run_readonly_command` | 执行只读命令并脱敏输出 |
| `huaweicloud_run_approved_command` | 经用户批准后执行写命令 |
| `huaweicloud_list_operations` | 列出服务可用操作 |
| `huaweicloud_show_profile_redacted` | 安全查看 KooCLI 配置（脱敏） |
| `huaweicloud_service_catalog` | 返回推荐的能力来源排序 |
| `huaweicloud_explain_error` | 解释错误码并建议诊断步骤 |
| `huaweicloud_search_docs` | 搜索技能文档 |
| `huaweicloud_retrieve_skill` | 加载完整技能内容 |
| `huaweicloud_list_regions` | 列出可用区域 |
| `huaweicloud_get_regional_availability` | 检查区域服务可用性 |
| `huaweicloud_search_marketplace` | 搜索技能市场 |
| `huaweicloud_setup_obs_config` | 同步 hcloud 凭证到 OBS 配置 |

---

## 安全模型

| 层级 | 机制 | 说明 |
|------|------|------|
| 技能层 | `SKILL.md` | 教会 Agent 正确的行为规则 |
| 钩子层 | `huaweicloud-safety.py` | PreToolUse Hook 阻断高风险调用 |
| MCP 层 | `safety-policy.mjs` | 写操作拦截、输出脱敏、命令分类 |

---

## 常见问题

**Q: 安装后 MCP 工具不生效？**  
必须重启 Agent 会话。MCP 服务器仅在会话启动时加载配置。

**Q: `hcloud` 命令找不到？**  
设置环境变量 `HCLOUD_BIN` 指向 hcloud 完整路径：
```bash
# Windows
setx HCLOUD_BIN "C:\Users\<用户名>\hcloud\hcloud.exe"
# Linux/macOS
export HCLOUD_BIN="$HOME/.local/bin/hcloud"
```

**Q: OBS 命令报 "Please set ak, sk"？**  
调用 `huaweicloud_setup_obs_config` 工具自动同步凭证。

**Q: 安全组规则创建被拒绝（SYS.0403）？**  
组织 SCP 策略限制了 `0.0.0.0/0` 规则，改用特定 CIDR 范围。

**Q: ECS 创建报 Flavor abandoned？**  
Switch to a different AZ or flavor family。`ListFlavors` 显示全局状态，特定 AZ 可能有不同结果。
