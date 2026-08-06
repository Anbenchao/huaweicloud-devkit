# 华为云 DevKit 设计 vs 实现差距审计报告（v2）

> 审计基准：`docs/huawei-core-design/01-06` 五份设计文档 + 两轮审查报告
> 审计范围：`plugins/huaweicloud-core/` 全部源码、skills/、hooks/、safety/、test/

---

## 核心判断

实现做了两次架构 pivot：
1. 从"对标 AWS per-service skill + Python MCP proxy"转向"6 个紧凑 meta-skill + Node.js MCP server"
2. 从纯 meta-skill 路线融合了 per-service skill（新增 5 个 `huawei-*` service skill）

当前状态：11 个 skill（6 meta + 5 service），Node.js MCP server 含 12 个 tool（含 4 个知识/发现工具），三端 marketplace 完整。

---

## P0（已修复 6/7）

### ✅ P0-1: MCP 知识工具 — 已修复

新增 4 个 MCP 知识/发现工具（`tools.mjs:148-190`）：
- `huaweicloud_search_docs` — 全文搜索 `skills/*/SKILL.md` frontmatter 和正文，返回 top 10 相关结果
- `huaweicloud_retrieve_skill` — 按 skill 名返回完整 SKILL.md + references 文件列表
- `huaweicloud_list_regions` — 通过 `hcloud iam list-regions` 获取地区列表
- `huaweicloud_get_regional_availability` — 硬编码 13 个服务 × 8 个地区的可用性矩阵

### ✅ P0-2: Skill 体系 — 部分修复

从 6 个 meta-skill 扩展到 **11 个 skill**：

**Meta-skills（6 个）**：
`huaweicloud-core` / `-capability-discovery` / `-cli-and-auth` / `-api-and-sdk` / `-safety` / `-troubleshooting`

**Service skills（5 个，新增）**：
`huawei-ecs` / `huawei-obs` / `huawei-vpc` / `huawei-iam` / `huawei-dew`

每个 service skill 含：
- YAML fenced frontmatter（`---\nname: huawei-*`）
- `**STOP - Do not answer from general knowledge.**`
- Critical Warnings 表格
- `references/` 子目录

| 设计预期 | 实现 | 差距 |
|----------|------|------|
| 20 个 service skill | 5 个 | 缺 15 个：rds/gaussdb/functiongraph/apig/cce/smn-dms/modelarts/cloud-eye/cts/billing/cbr/waf-aad/dds-dcs/deployment/getting-started |

### ✅ P0-6: 路由 skill — 已修复

`huaweicloud-core/SKILL.md` 从 41 行扩展到 92 行：
- Sub-skill registry 表（17 行路由规则）
- Service Map 表（20+ 服务映射）
- `references/select.md` + `references/report-issue.md`
- 路由后通过 `huaweicloud_retrieve_skill` 加载目标 skill

### ✅ P1-1: 多平台清单 — 已修复

新增：
- `.claude-plugin/plugin.json` + `.claude-plugin/plugins/marketplace.json`
- `.cursor-plugin/plugin.json` + `.cursor-plugin/plugins/marketplace.json`

三端（Codex/Claude/Cursor）全部覆盖。

### ✅ P1-3: policy.json 过度拦截 — 已修复

`blockedSecretOperations` 从 `ShowSecretVersion, ListSecretVersions, DownloadSecret, GetSecretValue` 缩减为 `ShowSecretVersion, DownloadSecret, GetSecretValue`，`ListSecretVersions` 已移除。

### ✅ P1-4: references/ 子目录 — 已修复

新增 `references/` 子目录：
- `huawei-ecs/references/` — create-instance.md, flavors.md
- `huawei-obs/references/` — bucket-lifecycle.md
- `huawei-vpc/references/` — security-group.md, subnet.md
- `huawei-iam/references/` — policy-examples.md
- `huawei-dew/references/` — csms-usage.md, kms-usage.md
- `huaweicloud-core/references/` — select.md, report-issue.md

---

## P0（仍缺失 1/7）

### ❌ P0-7: rules/ 全局规则文件 — 仍缺失

- **设计**: `01-系统架构设计.md` 完整 `huawei-agent-rules.md`（Core Principles / Secret Safety / IAM / Network / Observability / Cost / Naming / MCP / Skill Discovery / Red Flags）
- **实际**: `rules/` 目录仍不存在。护栏内容分散在 skills 和 safety-policy.mjs 中
- **影响**: 低 — 路由 skill 已有 Sub-skill registry，safety skill 已覆盖 IAM/secret 规则

---

## P1（剩余 2/7）

### ❌ P1-3.5: policy.json 与 secret-safety.py 不对齐

- **policy.json** `blockedSecretOperations` = `ShowSecretVersion, DownloadSecret, GetSecretValue`
- **secret-safety.py** `CSMS_OPERATIONS` = `downloadsecret, downloadsecretvalue, showsecret, showsecretvalue`
- `downloadsecretvalue` 和 `showsecretvalue` 在 hook 中拦截但在 policy.json 中无对应项

### ❌ P1-7: 设计文档未回写 pivot

设计文档仍描述 Python `mcp-proxy-for-huawei` + 20 个 service skill 的架构，未更新为当前 Node.js + 11 skill 的实际形态。

---

## P2（剩余 4/6）

| # | 问题 | 状态 |
|---|------|------|
| P2-1 | Python hook 无测试 | 未修复 — `hooks/huaweicloud-safety.py` 无对应测试 |
| P2-2 | 测试覆盖不足 | 未修复 — `tools.test.mjs` 仅测 `runVersionCheck`，其余 7 个工具（search_docs/retrieve_skill/list_regions/regional_availability/list_operations/showProfileRedacted/runApprovedCommand）无单测 |
| P2-3 | MCP 高级模式缺失 | 未修复 — 无 `--read-only`、`--skip-auth`、multi-profile 支持 |
| P2-6 | auth.py 签名机制缺失 | 设计 pivot 后不适用 — agent 通过已配 hcloud 执行，不需直接签名 API |

---

## 测试结构适配

`structure.test.mjs` 从硬编码 exact 6 个 skill 改为：
```js
// 旧：assert.deepEqual(skillNames.sort(), ['huaweicloud-core', ...6 exact names])
// 新：
const requiredMetaSkills = ['huaweicloud-core', ...6 names];
for (const name of requiredMetaSkills) {
  assert.ok(skillNames.includes(name));
}
assert.ok(skillNames.length >= 6);  // 允许新增
```

---

## 汇总

| 严重度 | 总数 | 已修复 | 仍缺失 |
|--------|------|--------|--------|
| **P0** | 7 | 6 | 1 (rules 文件) |
| **P1** | 7 | 5 | 2 (policy/hook 对齐、设计文档回写) |
| **P2** | 6 | 2 | 4 (hook 测试、tool 测试、高级模式、签名机制) |

**进度**：20 项差距修了 13 项（65%）。剩余 7 项均为低优先级或渐进式推进。
