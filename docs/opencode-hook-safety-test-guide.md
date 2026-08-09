# OpenCode 测试指南：华为云 Hook 安全能力

本文用于在另一台安装了 OpenCode 的机器上测试 `dev-hooks` 分支新增的华为云 Hook 安全能力。

## 测试目标

验证本次新增能力是否可用：

- OpenCode 能安装本地 `dev-hooks` 分支的华为云插件。
- OpenCode 能看到并调用 3 个新增 MCP 工具。
- 高风险命令会被识别为 `deny`。
- 高风险策略文件会被识别为 `deny`。
- 沙箱/预览部署计划缺少 TTL、owner、cleanup 时会被识别为 `warn`。
- 不需要真实华为云账号即可完成本测试。

新增 MCP 工具：

```text
huaweicloud_hook_check_command
huaweicloud_hook_check_artifacts
huaweicloud_hook_check_deploy_plan
```

## 1. 准备环境

另一台机器需要：

- Node.js >= 20
- Git
- OpenCode

检查 Node.js：

```bash
node --version
```

如果低于 20，请先升级 Node.js。

## 2. 拉取测试分支

如果机器上还没有仓库：

```bash
git clone -b dev-hooks git@github.com:huaweicloud-mate/huaweicloud-devkit.git
cd huaweicloud-devkit
```

如果机器上已有仓库：

```bash
git fetch origin dev-hooks
git switch dev-hooks
git pull
```

确认当前分支：

```bash
git branch --show-current
```

预期输出：

```text
dev-hooks
```

## 3. 本地快速自检

先在命令行跑自动化测试：

```bash
npm test
npm run validate
```

预期：

- `npm test` 全部通过。
- `npm run validate` 输出 `Validated HuaweiCloud Devkit with ... skills.`

## 4. 安装到 OpenCode

因为 `dev-hooks` 还没有发布到 npm，所以不要用线上 `npx huaweicloud-devkit install` 测试本次分支。

请在仓库目录里执行本地安装：

```bash
node ./bin/setup.cjs install
```

安装后查看状态：

```bash
node ./bin/setup.cjs status
```

也可以运行自检：

```bash
node ./bin/setup.cjs doctor
```

安装完成后，重启 OpenCode 会话，让 MCP 配置生效。

## 5. 不打开 OpenCode 的本地冒烟测试

这一步用于确认新增 MCP 工具本身可用。

### 5.1 测试命令风险检查

```bash
node --input-type=module -e "import('./plugins/huaweicloud-core/src/tools.mjs').then(async ({callTool}) => console.log(JSON.stringify(await callTool('huaweicloud_hook_check_command', { command: 'hcloud VPC CreateSecurityGroupRule --security_group_rule.port_range_min=22 --security_group_rule.remote_ip_prefix=0.0.0.0/0' }), null, 2)))"
```

预期关键结果：

```json
{
  "ok": false,
  "decision": "deny"
}
```

并且 `findings[0].ruleId` 应为：

```text
hwc-network-public-admin-port
```

### 5.2 测试生成文件风险检查

```bash
node --input-type=module -e "import('./plugins/huaweicloud-core/src/tools.mjs').then(async ({callTool}) => console.log(JSON.stringify(await callTool('huaweicloud_hook_check_artifacts', { artifacts: [{ path: 'policy.txt', content: 'IAM policy Effect=Allow Action=* Resource=*' }] }), null, 2)))"
```

预期关键结果：

```json
{
  "ok": false,
  "decision": "deny"
}
```

并且 `findings[0].ruleId` 应为：

```text
hwc-iam-admin-policy
```

### 5.3 测试部署计划风险检查

```bash
node --input-type=module -e "import('./plugins/huaweicloud-core/src/tools.mjs').then(async ({callTool}) => console.log(JSON.stringify(await callTool('huaweicloud_hook_check_deploy_plan', { plan: { environment: 'preview', resources: [{ service: 'FunctionGraph', action: 'CreateFunction' }] } }), null, 2)))"
```

预期关键结果：

```json
{
  "ok": true,
  "decision": "warn"
}
```

并且 `findings[0].ruleId` 应为：

```text
hwc-sandbox-missing-ttl
```

### 5.4 测试安全命令

```bash
node --input-type=module -e "import('./plugins/huaweicloud-core/src/tools.mjs').then(async ({callTool}) => console.log(JSON.stringify(await callTool('huaweicloud_hook_check_command', { command: 'hcloud ECS ListServersDetails' }), null, 2)))"
```

预期关键结果：

```json
{
  "ok": true,
  "decision": "allow",
  "findings": []
}
```

## 6. 在 OpenCode 中测试

重启 OpenCode 后，在会话里分别输入下面的测试请求。

### 6.1 命令风险检查

给 OpenCode 输入：

```text
请调用华为云插件的 huaweicloud_hook_check_command 工具检查这个命令是否安全，不要执行命令：
hcloud VPC CreateSecurityGroupRule --security_group_rule.port_range_min=22 --security_group_rule.remote_ip_prefix=0.0.0.0/0
```

预期：

- OpenCode 调用 `huaweicloud_hook_check_command`。
- 返回 `decision=deny`。
- 风险说明提到公网开放管理端口。
- 修复建议提到限制 CIDR、使用堡垒机或 VPN。

### 6.2 生成文件风险检查

给 OpenCode 输入：

```text
请调用华为云插件的 huaweicloud_hook_check_artifacts 工具检查这个策略文件是否安全，不要执行任何云操作：
文件名：policy.txt
内容：IAM policy Effect=Allow Action=* Resource=*
```

预期：

- OpenCode 调用 `huaweicloud_hook_check_artifacts`。
- 返回 `decision=deny`。
- 命中规则 `hwc-iam-admin-policy`。
- 风险说明提到过宽管理员权限。

### 6.3 沙箱部署计划风险检查

给 OpenCode 输入：

```text
请调用华为云插件的 huaweicloud_hook_check_deploy_plan 工具检查这个部署计划：
创建一个 preview 环境，资源是 FunctionGraph CreateFunction，没有设置 owner、ttl、cleanup。
```

预期：

- OpenCode 调用 `huaweicloud_hook_check_deploy_plan`。
- 返回 `decision=warn`。
- 命中规则 `hwc-sandbox-missing-ttl`。
- 提示需要补充 owner、TTL、cleanup。

### 6.4 安全命令检查

给 OpenCode 输入：

```text
请调用华为云插件的 huaweicloud_hook_check_command 工具检查这个只读命令：
hcloud ECS ListServersDetails
```

预期：

- 返回 `decision=allow`。
- `findings` 为空。

## 7. 可选：直接测试 Python Hook

这一步用于验证支持 Hook 的 Agent Host 执行前拦截能力。OpenCode 主要依赖 MCP 主动检查，Python Hook 不是 OpenCode 测试的必选项。

Windows PowerShell：

```powershell
'{"tool_name":"mcp__huaweicloud__create_security_group_rule","tool_input":{"command":"hcloud VPC CreateSecurityGroupRule --security_group_rule.port_range_min=22 --security_group_rule.remote_ip_prefix=0.0.0.0/0"}}' | python .\plugins\huaweicloud-core\hooks\huaweicloud-safety.py
```

macOS/Linux：

```bash
printf '%s' '{"tool_name":"mcp__huaweicloud__create_security_group_rule","tool_input":{"command":"hcloud VPC CreateSecurityGroupRule --security_group_rule.port_range_min=22 --security_group_rule.remote_ip_prefix=0.0.0.0/0"}}' | python3 ./plugins/huaweicloud-core/hooks/huaweicloud-safety.py
```

预期输出包含：

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "deny"
  }
}
```

## 8. 通过标准

本次测试通过需要满足：

- `npm test` 通过。
- `npm run validate` 通过。
- 本地冒烟测试 5.1、5.2、5.3、5.4 均符合预期。
- OpenCode 中能调用 3 个新增 MCP 工具。
- OpenCode 中高风险命令返回 `deny`。
- OpenCode 中宽 IAM 权限返回 `deny`。
- OpenCode 中沙箱缺少 TTL 返回 `warn`。

## 9. 常见问题

### OpenCode 看不到新工具

可能原因：

- 没有执行本地安装。
- 安装的是 npm 已发布版本，不是本地 `dev-hooks` 分支。
- 安装后没有重启 OpenCode。

处理：

```bash
git branch --show-current
node ./bin/setup.cjs install
node ./bin/setup.cjs status
```

然后重启 OpenCode。

### 返回 Unknown tool

说明当前 OpenCode 加载的 MCP server 不是 `dev-hooks` 分支代码。

处理：

- 确认当前分支是 `dev-hooks`。
- 重新执行 `node ./bin/setup.cjs install`。
- 重启 OpenCode。

### KooCLI 没安装会影响测试吗

不影响本次 3 个 Hook 检查工具测试。

这 3 个工具只做规则检查，不执行真实 `hcloud` 命令，不需要 AK/SK，也不需要真实云账号。

### 命令行 JSON 引号报错

如果在 PowerShell 里直接调用 MCP 驱动脚本遇到 JSON 引号问题，优先使用本文第 5 节的 `node --input-type=module -e ...` 命令，或者直接在 OpenCode 会话里按第 6 节测试。
