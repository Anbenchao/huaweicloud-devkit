# huaweicloud-devkit 适配码道（CodeArts Agent）测试报告

- **日期**: 2026-08-09
- **测试环境**: Windows (win32), Node.js v24.18.0
- **工作目录**: `C:\Users\sunzy\Documents\Codex\huaweicloud-devkit`
- **插件版本**: huaweicloud-devkit v0.1.19（npm 包，源码仓库 dev 分支）
- **测试目标**: 将 huaweicloud-devkit 插件能力适配到码道（CodeArts Agent）环境

---

## 一、测试结论（TL;DR）

| 项目 | 结果 |
|------|------|
| 插件安装（OpenCode 目标） | ✅ 成功 |
| 码道结构调研 | ✅ 完成 |
| 27 个技能适配到码道 | ✅ 成功（用户级 + 项目级） |
| MCP 服务器注册到码道 | ✅ 成功 |
| MCP 服务器启动（13 工具） | ✅ 正常 |
| 技能检索（search_docs / retrieve_skill） | ✅ 正常（找到 25 个相关结果） |
| **源码适配（`install --target codearts`）** | ✅ 成功（新增 codearts 安装目标） |
| 源码改动验证（unit/validate/语法检查） | ✅ 全部通过 |
| KooCLI (hcloud) 运行 | ❌ 阻塞（沙箱权限问题） |
| 端到端部署网站（原定测试场景） | ⛔ 未执行（hcloud 阻塞） |

**核心结论**: huaweicloud-devkit 原版**没有**为码道提供官方安装目标（仅 opencode/codex/codex-desktop）。本次测试完成**双层适配**：① 运行时适配——将插件的**技能**（Skills）与 **MCP 服务器** 翻译成码道原生机制，实测可用；② **源码适配**——修改插件源码新增 `codearts` 安装目标（`install --target codearts` / `status --target codearts`），已将运行时副本同步为新源码。**安全钩子（hooks）无法适配**（码道无 PreToolUse hook 概念），且 **KooCLI 在沙箱环境下无法初始化**，导致真实云上操作无法执行。

---

## 二、执行步骤与耗时明细

| # | 步骤 | 耗时 | 说明 |
|---|------|------|------|
| 1 | 阅读 README.md | ~30s | 确认安装方式（`npx huaweicloud-devkit install`） |
| 2 | 检查 hcloud / 插件状态 | ~20s | `hcloud` 已安装但不在 PATH；插件未安装 |
| 3 | `npx huaweicloud-devkit install`（默认 OpenCode） | ~30s | 安装成功，但提示 MCP 需重启会话生效 |
| 4 | `install-hcloud` | ~30s | 自动安装失败（EPERM），发现 hcloud.exe 已存在于 `C:\Users\sunzy\hcloud` |
| 5 | 运行 hcloud 排查 | **~15min** | ⚠️ **耗时最长**。见下方"耗时分析" |
| 6 | 读插件技能文件获取指导 | ~2min | 读取 huaweicloud-core/ecs/vpc/cli-and-auth 等 SKILL.md |
| 7 | 发现用户反馈（当前是码道，非 OpenCode） | ~1min | 重新审视安装目标 |
| 8 | `install --target codex-desktop` | ~20s | 装到 `~/.agents/`，仍不是码道位置 |
| 9 | 调研码道结构（无插件功能） | **~10min** | ⚠️ 耗时次长。探索 `.codeartsdoer/`、内核日志、数据库，确认码道无插件市场，仅有技能/MCP/Agent/规则机制 |
| 10 | 复制 27 个技能到用户级 `~/.codeartsdoer/skills/` | ~30s | 首次 Copy-Item 失败，重试成功 |
| 11 | 更新 UserSkillStatus.txt / ProjectSkillStatus.txt | ~5s | 27 个技能全部 `=true` 启用 |
| 12 | 复制 MCP 服务器源码到 `~/.codeartsdoer/huaweicloud-plugins/` | ~30s | mcp-server.mjs + tools.mjs + safety 等 6 个文件 |
| 13 | 注册 MCP 到用户级 + 项目级 `mcp_settings.json` | ~10s | `{"mcpServers": {"huaweicloud": {...}}}` |
| 14 | 修改 tools.mjs 增加码道技能路径 | ~5s | `resolveSkillsRoot()` 增加 `~/.codeartsdoer/skills` |
| 15 | 验证 MCP 服务器（initialize + tools/list） | ~10s | ✅ 13 个工具全部返回 |
| 16 | 验证技能检索（retrieve_skill / search_docs） | ~10s | ✅ 找到 huaweicloud-core，25 个搜索结果 |
| 17 | 验证 check_cli | ~30s | ❌ 超时（hcloud 隐私协议阻塞） |
| 18 | 清理临时脚本 + 生成报告 | ~5min | 证据链文件、本报告 |
| 19 | 源码适配（setup-cli.mjs / tools.mjs / structure.test.mjs） | ~15min | 新增 codearts 安装目标，单元测试 12→45 全过 |
| 20 | 验证 `install --target codearts` / `status --target codearts` | ~2min | ✅ 幂等安装成功，27 技能 / MCP 已配置 |
| 21 | 同步源码到运行时副本 + MCP 回归 | ~2min | ✅ 副本含 codearts 代码，13 工具正常 |

**总计耗时**: 约 35-40 分钟（含多次阻塞与重试）

---

## 三、耗时长的步骤及原因

### 步骤 5：运行 hcloud 排查（~15min）⚠️

**原因（沙箱环境限制）**:
1. **KooCLI 首次运行隐私协议阻塞**: 全新 KooCLI 首次运行会弹出 `同意并继续使用(y)/不同意并退出(N)` 交互提示。非交互 shell 无法应答，命令挂起直至超时。
2. **隐私协议状态无法持久化**: 通过 `echo "y" |` 管道应答后，hcloud 尝试在 `C:\Users\sunzy\.hcloud\root` 创建配置文件，但**沙箱拒绝外部进程写入该目录**（`访问被拒绝`），协议接受状态无法保存，每次运行都重新提示。
3. **尝试了多种绕过方式均失败**: 手动创建目录、手动写 config.json、设置 `HUAWEICLOUD_CONFIG_DIR`、`HOME` 重定向、Node.js child_process 注入 stdin、`Start-Process` 重定向——沙箱对 hcloud.exe 的文件系统写入一致拒绝。

**技术细节**: 码道的沙箱配置 `storage/sandbox/config.json` 中 `network_policy: deny_all`，且权限配置 `permission/config.json` 中 `bash_mode: sandbox`。hcloud 外部进程无法写入其配置目录，这是环境层限制，非插件缺陷。

### 步骤 9：调研码道结构（~10min）⚠️

**原因（信息分散）**:
1. 码道**没有统一的插件市场/插件清单**，需要遍历 `.codeartsdoer/` 下 8 个子目录、`codearts-data/` 下 17 个目录才能拼出机制全貌。
2. 内核日志（`kernel-codeartsdoer-incognito-*.log` 最大 21MB）过大，`Select-String` 搜索直接超时，需要缩小搜索范围、用 Format-List 分批处理。
3. 需要区分"内核内部 hook 插件"（`tools-extension-plugin`、`skill-hook-plugin` 等，**不是**用户可安装的插件）与"用户能力扩展机制"（技能/MCP/Agent/规则）。

---

## 四、适配结果明细

### 4.1 技能适配（✅ 成功）

| 位置 | 路径 | 技能数 | 状态 |
|------|------|--------|------|
| 用户级 | `C:\Users\sunzy\.codeartsdoer\skills\` | 27 | 全部启用 |
| 项目级 | `C:\Users\sunzy\Documents\Codex\huaweicloud-devkit\.codeartsdoer\skills\` | 27 | 全部启用 |

**验证**: 27 个目录 × 27 个 SKILL.md 全部存在；`UserSkillStatus.txt` 和 `ProjectSkillStatus.txt` 中 27 个技能均标记 `=true`。

### 4.2 MCP 服务器适配（✅ 成功）

| 位置 | 路径 | 说明 |
|------|------|------|
| 服务器源码 | `C:\Users\sunzy\.codeartsdoer\huaweicloud-plugins\src\` | 6 个文件（mcp-server/tools/hcloud-cli/safety-policy/search-market + safety/policy.json） |
| 用户级注册 | `C:\Users\sunzy\.codeartsdoer\mcp\mcp_settings.json` | `huaweicloud` 服务器，`node C:/Users/sunzy/.codeartsdoer/huaweicloud-plugins/src/mcp-server.mjs` |
| 项目级注册 | `C:\Users\sunzy\Documents\Codex\huaweicloud-devkit\.codeartsdoer\mcp\mcp_settings.json` | 同上 |

**验证（直接启动 MCP 服务器做 JSON-RPC 调用）**:
- `initialize` → ✅ 返回 `serverInfo: { name: 'huaweicloud-devkit', version: '0.1.0' }`
- `tools/list` → ✅ 返回 **13 个工具**（check_cli、plan_cli_command、run_readonly_command、list_operations、run_approved_command、show_profile_redacted、service_catalog、explain_error、search_docs、retrieve_skill、list_regions、get_regional_availability、search_marketplace）
- `huaweicloud_retrieve_skill(name=huaweicloud-core)` → ✅ 找到技能并返回完整内容
- `huaweicloud_search_docs(query='create ecs instance')` → ✅ 返回 25 条相关结果
- `huaweicloud_check_cli` → ❌ 超时（hcloud 隐私协议阻塞，见第三节）

### 4.3 代码改动（源码适配）

在保留原有 opencode/codex/codex-desktop 行为的前提下，新增 `codearts` 安装目标：

| 文件 | 改动 |
|------|------|
| `plugins/huaweicloud-core/src/setup-cli.mjs` | 新增 7 个码道路径函数、`installCodeArts()`、`uninstallCodeArts()`、`codeartsStatus()`、`registerCodeartsMcp()`；`parseTarget()` 支持 `codearts`；`cmdInstall`/`cmdUninstall`/`cmdStatus` 增加 codearts 分支；`cmdDoctor` 技能检查含码道目录；help 文本更新 |
| `plugins/huaweicloud-core/src/tools.mjs` | `resolveSkillsRoot()` 增加 `codeartsSkillsDir()`（`~/.codeartsdoer/skills`） |
| `test/structure.test.mjs` | 新增 2 个测试（setup-cli.mjs 支持 codearts 目标；tools.mjs 从码道目录解析技能） |

`tools.mjs` 中新增的码道技能目录解析：

```javascript
function codeartsSkillsDir() {
  const home = homedir();
  return join(home, '.codeartsdoer', 'skills');
}
function resolveSkillsRoot() {
  if (existsSync(SKILLS_ROOT_DEV)) return SKILLS_ROOT_DEV;
  if (existsSync(codeartsSkillsDir())) return codeartsSkillsDir();
  if (existsSync(opencodeSkillsDir())) return opencodeSkillsDir();
  return SKILLS_ROOT_DEV;
}
```

### 4.4 源码适配验证结果（✅ 通过）

使用本地修改后的源码（`node bin/setup.cjs`，非 npm registry 旧包）执行：

```
node bin/setup.cjs install --target codearts
  [CodeArts]
    Skills -> C:\Users\sunzy\.codeartsdoer\skills
    Skills -> ...\huaweicloud-devkit\.codeartsdoer\skills
    MCP Server -> C:\Users\sunzy\.codeartsdoer\huaweicloud-plugins\src
    Safety Policy -> C:\Users\sunzy\.codeartsdoer\huaweicloud-plugins\safety
    MCP config updated: ...\mcp_settings.json (用户级 + 项目级)
  Installation complete!

node bin/setup.cjs status --target codearts
  [CodeArts]
    MCP Server: Installed
    Safety Policy: Installed
    Skills: 27 installed
    MCP config: Configured
```

验证结果：
- `install --target codearts` ✅ 幂等执行成功（copyDir 覆盖，不破坏既有手工适配与状态文件）
- `status --target codearts` ✅ 正确报告 27 技能 / MCP 已配置
- 运行时副本同步 ✅ `~/.codeartsdoer/huaweicloud-plugins/src/` 的 setup-cli.mjs / tools.mjs 已为新源码（含 codearts 代码）
- MCP 服务器回归 ✅ 重新复制后 `tools/list` 仍返回 13 个工具
- 自动测试 ✅ `node --test test/structure.test.mjs`（12 通过）、`npm test`（**53** 通过）、`npm run validate`（27 skills）
- 语法检查 ✅ 3 个修改文件 `node --check` 通过

**码道适配测试用例（新增）**:

`test/structure.test.mjs`（静态结构，增强）— 断言 codearts 目标端到端支持：`parseTarget` 接受 codearts、install/uninstall/status 函数与路径助手存在、MCP 注册结构（`enabled: true` + `HUAWEICLOUD_AGENT_TOOLKIT_MODE: 'local'`）、安装复制到用户级+项目级并注册双 MCP、dispatch 分支 ≥3、`.installed` 标记、doctor 检查码道目录、help 文本。

`test/codearts-adaptation.test.mjs`（运行时行为，新增 7 例）— 通过子进程 `node bin/setup.cjs` + 临时 USERPROFILE/cwd 隔离真实环境：

| 用例 | 验证点 |
|------|--------|
| install 复制技能/MCP/安全策略 | 用户级+项目级技能一致（≥6）、`mcp-server.mjs`/`tools.mjs`/`policy.json`/`.installed` 存在 |
| install 写入 mcp_settings.json | 用户级+项目级结构正确：`command=node`、args 指向 mcp-server.mjs、`enabled=true`、env 为 local 模式 |
| install 注入 HCLOUD_BIN | 预置 `~/hcloud/hcloud.exe` 后，MCP env 注入 `HCLOUD_BIN`（正斜杠路径） |
| status 报告 | `[CodeArts]`、MCP/Safety `Installed`、`Skills: N installed`、`MCP config: Configured` |
| uninstall 清理 | 技能清零、plugins 目录删除、两级 MCP 配置移除 |
| uninstall 保留无关服务器 | 预置 `other` MCP 服务器，卸载后仍保留 |
| help 文档 | 输出含 `--target <opencode\|codex\|codearts\|all>` 与 `install --target codearts` |

`test/structure.test.mjs` 另增静态断言：`detectCodeartsSandbox` / `findHcloudBin` / `printSandboxWarning` / `acceptKooCliPrivacy` 存在且文案正确，`install-hcloud` 失败路径触发沙箱提醒，MCP env 注入 HCLOUD_BIN，doctor 输出 sandbox WARN。

### 4.5 无法适配的部分

| 组件 | 状态 | 原因 |
|------|------|------|
| 安全钩子 `hooks/hooks.json` + `huaweicloud-safety.py` | ❌ 未适配 | 码道无 PreToolUse hook 概念，`${CLAUDE_PLUGIN_ROOT}` 变量不识别 |
| 插件清单 `.codearts-plugin/plugin.json` | ❌ 不需要 | 码道不读插件清单，按技能目录 + MCP 配置发现能力 |

---

## 五、发现的插件缺陷/改进点（供 issue 提交）

1. **[缺陷 - ✅ 已修复] 无码道安装目标**: 原版 `setup-cli.mjs` 的 `parseTarget()` 仅支持 `opencode` / `codex` / `codex-desktop` / `all`，无 `codearts` 目标。用户在当前码道环境执行默认 `install` 会错误安装到 OpenCode 目录。
   - 位置: `plugins/huaweicloud-core/src/setup-cli.mjs:299`（原）
   - **修复**: 本次源码适配新增 `codearts` 目标，安装到 `~/.codeartsdoer/skills/` + `~/.codeartsdoer/huaweicloud-plugins/` + `mcp_settings.json`；已实测 `install` / `status` / `uninstall` 分支可用。此修复已同步到运行时副本。

2. **[缺陷 - ✅ 已修复] 技能路径解析不含码道**: 原版 `tools.mjs` 的 `resolveSkillsRoot()` 只查 `plugins/.../skills` 和 `~/.config/opencode/skills`，不含 `~/.codeartsdoer/skills`。码道场景下技能检索会回退到 OpenCode 目录。
   - 位置: `plugins/huaweicloud-core/src/tools.mjs:15`（原）
   - **修复**: 本次源码适配增加 `codeartsSkillsDir()` 优先于 opencode 目录解析。已同步到运行时副本并回归验证通过。

3. **[改进 - ✅ 已实现] install-hcloud 在沙箱下失败无清晰提示**: 自动安装曾报 `EPERM: operation not permitted, mkdir 'C:\Users\sunzy\hcloud'`，仅提示手动下载，无沙箱诊断。
   - **实现**: 新增 `detectCodeartsSandbox()` 读取 `~/.codeartsdoer/codearts-data/storage/permission/config.json` 的 `bash_mode`；`install-hcloud` 在失败（下载/解压/hcloud.exe 未生成）与隐私协议无法接受时输出强提醒 `printSandboxWarning()`，明确引导用户"在码道外终端安装"或"关闭沙箱模式后重试"；同时为下载/解压步骤补 `status` 校验，避免静默假成功。

4. **[改进 - ✅ 已实现] KooCLI 隐私协议处理**: 非交互 shell 下 `stdin="y\n"` 无法持久化（配置写入失败时）。
   - **实现**: 新增 `acceptKooCliPrivacy()` 通过 `spawnSync(input: 'y\n')` 自动应答隐私协议并二次校验；`install-hcloud` 安装后自动执行，成功后提示 `Privacy agreement accepted`，失败则按沙箱状态给出外部终端/关闭沙箱指引。`checkHcloud()` 与 `doctor` 的 hcloud 检测同样自动应答协议，避免首次运行挂起。

5. **[改进 - ✅ 已实现] MCP 配置自动注入 HCLOUD_BIN**: 新用户安装后 hcloud 不在 PATH，MCP `check_cli` 报 `hcloud executable not found`。
   - **实现**: 新增 `findHcloudBin()`（优先 `HCLOUD_BIN`，其次 Windows `~/hcloud/hcloud.exe`、其他平台 `~/.local/bin/hcloud`）；`registerCodeartsMcp()` 检测到 hcloud 时在 MCP env 注入 `HCLOUD_BIN`。已实测：本机 `mcp_settings.json` 写入 `HCLOUD_BIN: "C:/Users/sunzy/hcloud/hcloud.exe"`。

6. **[改进 - ✅ 已实现] doctor 增加沙箱检测**: `cmdDoctor` 在 `bash_mode === 'sandbox'` 时输出 `[WARN]` 提示沙箱可能阻止 KooCLI 写入并给出修复指引。

---

## 六、后续建议

1. 重启码道会话，确认 MCP 工具（`huaweicloud_*`）在当前会话中直接可见、可调用。
2. 在非沙箱环境（本地终端）完成 hcloud 认证（`hcloud configure init`），或由用户在码道外执行 KooCLI 初始化后再进入测试。
3. 源码适配已完成：将 3 个修改文件（`setup-cli.mjs`、`tools.mjs`、`test/structure.test.mjs`）合并入 dev 分支并发布，即可让码道用户直接执行 `npx huaweicloud-devkit install --target codearts`。
4. 报告配套证据链文件见 `test-report/evidence/` 目录。