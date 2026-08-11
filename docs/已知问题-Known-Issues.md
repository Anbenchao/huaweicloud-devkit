# 已知问题 / Known Issues

> 来源: 多轮 FunctionGraph 部署测试 (2026-08-06 ~ 08-07)

---

## 1. 认证无法在 Agent 环境中完成

### 1.1 交互式 TUI 不可用
- `hcloud configure init` 需要真正的终端输入 (y/N)，Agent 工具链无法传递
- `hcloud configure set` 需要 AK/SK，插件安全规则禁止在聊天中粘贴
- **需改动**: `huaweicloud-cli-and-auth/SKILL.md`

### 1.2 隐私政策阻断
KooCLI 首次使用时要求交互式确认隐私协议（`同意并继续使用(y)/不同意并退出(N)`），非交互终端直接报错 `[USE_ERROR]您输入的是无效字符`。插件对此无任何处理指引。

### 1.3 无程序化登录引导
插件将认证完全委托给用户（"Ask the user to configure credentials outside the agent conversation"），Agent 无法独立完成登录闭环。

### 1.4 AK 脱敏不完整
`hcloud configure list` 正确脱敏 SK（`****`），但 AK 仍部分可见（`HPU****WYH`），不够安全。

**建议方案**:
- 提供 "配置就绪检查" 工作流: Agent 先 `hcloud configure list`，若无可用 profile，给用户命令模板并等待确认
- 增加非交互式环境变量认证方案指引
- 增加 `echo "y" | hcloud <cmd>` 绕过隐私政策的指引

---

## 2. 跨平台安装脚本缺失

仅有 PowerShell 脚本 (install-opencode.ps1)，Linux 需手动安装。建议提供 `install-opencode.sh`。

---

## 3. MCP Server 工具在 OpenCode 中未暴露

**根因**: `integrations/opencode/opencode.json` 使用相对路径。安装到 `~/.config/opencode/` 后路径无法解析，12 个 MCP 工具全部缺失。

**建议**: 安装脚本自动替换为绝对路径，或 opencode.json 增加引导注释。

---

## 4. 跨技能场景衔接空白

**问题**: FunctionGraph + APIG + VPC 的 HTTP 访问链路没有预定义的衔接路径。Agent 需要自行跨技能连接步骤。

**受影响场景**: 从函数部署到对外提供 HTTP 服务需要 DEDICATEDGATEWAY → APIG 实例 → API 分组 → 环境 → URL 的完整链路。

**建议**: 增加场景级 checklist 或 `huawei-apig` 技能中提供 FunctionGraph 触发器的联合工作流。

---


---

## Status Update (2026-08-11)

| Issue | Status |
|-------|--------|
| BUG-5.1 Skills path mismatch | ✅ Fixed - `resolveSkillsRoot()` now checks user dirs first |
| BUG-5.2 OBS --help syntax error | ✅ Fixed - `listOperations` uses `hcloud OBS help` |
| BUG-5.3 OBS safety policy gap | ✅ Fixed - obsutil write ops classified correctly, case-insensitive |
| BUG-5.4 list_regions API name | ✅ Fixed - uses `IAM KeystoneListRegions` |
| BUG-5.5 OBS SetBucketWebsite missing | ⚠️ Known limitation - KooCLI OBS has no website command; use REST API or console |
| P0-3 OBS case normalization | ✅ Fixed - `obsOp.toLowerCase()` before matching |
| P0-2 Skills path priority | ✅ Fixed - user dirs checked before plugin-relative path |
| P0-1 MCP version hardcoded | ✅ Fixed - reads from package.json dynamically |
