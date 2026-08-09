# 证据链摘要 - HuaweiCloud DevKit 测试

本文件为 `devkit-test-report.md` 的配套证据链，用于支撑向 GitHub 仓库 `huaweicloud-mate/huaweicloud-devkit` 提交 Issue。

## 证据目录

所有原始证据位于: `/home/zhangfajun/devkit-test-evidence/`

## P1: 密钥对参数名不一致 - 证据链

### 证据 1: 技能文档中的错误参数名
- **文件**: `skills/huawei-ecs/references/create-instance.md` (安装后路径: `~/.config/opencode/skills/huawei-ecs/references/create-instance.md`)
- **第 33 行**: `hcloud ECS NovaCreateKeypair --keypair_name=<name>`
- **问题**: 参数应为 `--keypair.name` (点号嵌套)，不是 `--keypair_name` (下划线)

### 证据 2: 首次执行失败的输出
```
[USE_ERROR]Invalid parameter: keypair_name

Run `hcloud ECS NovaCreateKeypair --help` for details about this API.
```

### 证据 3: --help 显示的正确参数
```
--keypair.name
    required    string    body    Specifies the key pair name.
```

### 证据 4: 修正后执行成功的输出
- 见证据文件 `09-create-keypair.json`
- 返回了 keypair name, fingerprint, public_key, private_key

### 证据 5: NovaDeleteKeypair 使用下划线格式 (不一致)
```
--keypair_name
    required    string
```
- NovaCreateKeypair 用 `--keypair.name` (点号)
- NovaDeleteKeypair 用 `--keypair_name` (下划线)
- 同一资源类型的 Create/Delete 参数命名风格不一致

---

## P2: ListFlavors 废弃规格无过滤指引 - 证据链

### 证据 1: 技能文档缺少过滤指导
- **文件**: `skills/huawei-ecs/references/flavors.md`
- 仅说明 "Always discover flavors dynamically" 和 "Do not Hardcode"
- 未提及 `os_extra_specs.cond:operation:status` 字段
- 未提及 `os_extra_specs.cond:operation:az` 字段

### 证据 2: 首次创建 ECS 失败 (使用了废弃规格)
```
{
  "error": {
    "message": "Flavor as7.medium.2 is abandoned",
    "code": "Ecs.0019"
  }
}
```
- `as7.medium.2` 在 ListFlavors 返回结果中存在，但已被废弃

### 证据 3: ListFlavors 返回的规格状态统计
- 总规格数: 1000
- status=normal: 仅 3 个
- status=abandon: 大量
- status=sellout: 部分
- 见证据文件 `06-list-flavors.json` (2.4MB)

### 证据 4: 可用规格的 AZ 限制
- `at7.large.1` (2 vCPU, 2GB, normal):
  - `cond:operation:az`: `cn-north-4g(normal)`
  - 仅在 cn-north-4g 可用，cn-north-4a 不可用
- 技能文档未说明如何读取此字段选择正确的 AZ

### 证据 5: 修正后创建成功
- 使用 `at7.large.1` + AZ `cn-north-4g` 创建成功
- 见证据文件 `10-create-ecs.json`

---

## P3: MCP 工具需重启会话 - 证据链

### 证据 1: 安装输出提示需重启
```
========================================
  IMPORTANT: Restart your OpenCode session now!
  MCP tools only become available AFTER restart.
========================================
```

### 证据 2: Doctor 自检通过但 MCP 未生效
- Doctor 报告 `[PASS] MCP server can start` 和 `[PASS] OpenCode MCP configured`
- 但在同一会话中 MCP 工具不可用

### 证据 3: 技能中的 Fallback 指导
- `skills/huawei-ecs/SKILL.md` 第 104-114 行: "Without MCP (Fallback)" 和 "Without MCP" 章节
- 指导使用 hcloud CLI 直接执行，但警告 "Raw hcloud commands WILL appear in shell history"

---

## 测试环境信息

| 项目 | 值 |
|------|-----|
| OS | Linux |
| Node.js | v24.18.0 |
| npm | 11.16.0 |
| KooCLI | 7.2.12 |
| 插件版本 | v0.1.0 |
| 测试区域 | cn-north-4 |
| 测试时间 | 2026-08-09 18:05-18:21 (CST) |
| IAM 域名 | hwstaff_blue_dev |
| 公网 IP (测试机) | 1.92.82.218 |
