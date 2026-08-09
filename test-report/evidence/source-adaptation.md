# 源码适配验证证据（install --target codearts）

日期: 2026-08-09
工作目录: C:\Users\sunzy\Documents\Codex\huaweicloud-devkit
执行方式: `node bin/setup.cjs`（本地修改后的源码，非 npm registry 旧包）

## 修改文件清单（git diff --stat）

```
 plugins/huaweicloud-core/src/setup-cli.mjs | 115 ++++++++++++++++++++++++++++-
 plugins/huaweicloud-core/src/tools.mjs     |   5 ++
 test/structure.test.mjs                    |  17 +++++
 3 files changed, 134 insertions(+), 3 deletions(-)
```

## 1. install --target codearts 输出

```
Installing HuaweiCloud DevKit for codearts...

  Node.js v24.18.0 OK

[CodeArts]
  Skills -> C:\Users\sunzy\.codeartsdoer\skills
  Skills -> C:\Users\sunzy\Documents\Codex\huaweicloud-devkit\.codeartsdoer\skills
  MCP Server -> C:\Users\sunzy\.codeartsdoer\huaweicloud-plugins\src
  Safety Policy -> C:\Users\sunzy\.codeartsdoer\huaweicloud-plugins\safety
  MCP config updated: C:\Users\sunzy\.codeartsdoer\mcp\mcp_settings.json
  MCP config updated: C:\Users\sunzy\Documents\Codex\huaweicloud-devkit\.codeartsdoer\mcp\mcp_settings.json

Installation complete!
```

结果: ✅ 幂等执行成功（copyDir 覆盖，不破坏既有手工适配与状态文件）
待处理: 底部提示文案仍为 "MCP 工具在重启 OpenCode 会话后才生效"，应改为 CodeArts（文案级小问题，不影响功能）

## 2. status --target codearts 输出

```
HuaweiCloud DevKit Status

[CodeArts]
  MCP Server: Installed
  Safety Policy: Installed
  Skills: 27 installed
  MCP config: Configured

Environment:
  Node.js: v24.18.0
  Platform: win32
```

结果: ✅ 正确报告 27 技能 / MCP 已配置

## 3. 运行时副本已同步新源码

```
~/.codeartsdoer/huaweicloud-plugins/src/setup-cli.mjs: has installCodeArts=true, has codeartsSkillsDir=true (31071 bytes)
~/.codeartsdoer/huaweicloud-plugins/src/tools.mjs: has codeartsSkillsDir=true (31970 bytes)
用户级技能: 27, 项目级技能: 27
```

## 4. MCP 服务器回归验证（Content-Length framing）

```
tool count: 13
huaweicloud_check_cli, huaweicloud_plan_cli_command, huaweicloud_run_readonly_command,
huaweicloud_list_operations, huaweicloud_run_approved_command, huaweicloud_show_profile_redacted,
huaweicloud_service_catalog, huaweicloud_explain_error, huaweicloud_search_docs,
huaweicloud_retrieve_skill, huaweicloud_list_regions, huaweicloud_get_regional_availability,
huaweicloud_search_marketplace
```

结果: ✅ 重新复制后 tools/list 仍返回 13 个工具

## 5. 自动测试与语法检查

- `node --test test/structure.test.mjs` -> 12 tests passed
- `npm test` -> 45 tests passed
- `npm run validate` -> Validated HuaweiCloud DevKit with 27 skills.
- `node --check`（setup-cli.mjs / tools.mjs / structure.test.mjs）-> 无输出（通过）

## 6. KooCLI 沙箱/隐私协议增强（后续迭代）

根因调查：新用户在码道默认沙箱模式（`bash_mode: sandbox`）下，`install-hcloud` 会因沙箱拒绝外部进程创建 `~/hcloud` 抛 EPERM；即使手动放置 hcloud.exe，沙箱拒绝写入 `~/.hcloud/root` 导致隐私协议无法持久化，每次运行重弹协议、非交互下报 `[USE_ERROR]您输入的是无效字符`。

新增能力（setup-cli.mjs）：
- `detectCodeartsSandbox()` — 读取 `~/.codeartsdoer/codearts-data/storage/permission/config.json` 的 `bash_mode`
- `findHcloudBin()` — 定位 hcloud（`HCLOUD_BIN` → `~/hcloud/hcloud.exe` / `~/.local/bin/hcloud`）
- `printSandboxWarning()` — 强提醒：A. 码道外终端安装 B. 关闭沙箱模式后重试
- `acceptKooCliPrivacy()` — `spawnSync(input:'y\n')` 自动应答隐私协议并二次校验
- `install-hcloud` 下载/解压补 status 校验，失败与协议无法接受时触发沙箱提醒
- `registerCodeartsMcp()` env 自动注入 `HCLOUD_BIN`
- `doctor` 在 sandbox 模式下输出 `[WARN]`

实测验证：
- `install --target codearts` → mcp_settings.json env 注入 `HCLOUD_BIN: "C:/Users/sunzy/hcloud/hcloud.exe"` ✅
- `install-hcloud` → `Install complete.` + `Privacy agreement accepted. KooCLI ready.` ✅
- `doctor` → `[PASS] hcloud CLI installed`、Version 7.2.12、无 sandbox WARN（当前 always_allow）✅
- 测试: `npm test` 53 passed（+1 静态沙箱处理断言、+1 运行时 HCLOUD_BIN 注入）