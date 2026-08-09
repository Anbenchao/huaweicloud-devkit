# Issue P2: ListFlavors 技能缺少废弃规格过滤指引

## 问题描述

技能 `huawei-ecs/references/flavors.md` 正确提醒 "不要硬编码规格名" 和 "始终先 ListFlavors"，但未说明如何从返回结果中过滤出**实际可用**的规格。

`ListFlavors` 返回的 1000 条记录中，绝大多数规格的 `os_extra_specs.cond:operation:status` 为 `abandon`。在 cn-north-4 区域仅 3 个规格为 `normal` 状态。Agent 按文档 "pick from actual results" 选择规格后，创建 ECS 会失败（Ecs.0019 Flavor abandoned）。

此外，规格在不同 AZ 的可用性不同（`os_extra_specs.cond:operation:az` 字段），文档未提及此字段。

## 位置

- 文件: `plugins/huawei-core/skills/huawei-ecs/references/flavors.md`
- `SKILL.md` 第 38 行: "Always run `hcloud ECS ListFlavors --cli-region=<r>` to discover available flavors before recommending"

## 复现步骤

```bash
# 1. ListFlavors 返回 1000 条规格
hcloud ECS ListFlavors --cli-region=cn-north-4 --cli-output=json
# 结果中 as7.medium.2 存在，但 os_extra_specs.cond:operation:status = "abandon"

# 2. 用废弃规格创建 ECS (失败)
hcloud ECS CreateServers --server.flavorRef=as7.medium.2 ...
# 错误: "Flavor as7.medium.2 is abandoned" (Ecs.0019)
```

## 期望行为

`flavors.md` 应补充以下内容：

1. 如何读取 `os_extra_specs.cond:operation:status` 字段过滤可用规格（值为 `normal`）
2. 如何读取 `os_extra_specs.cond:operation:az` 字段确认 AZ 可用性（如 `cn-north-4g(normal)` 表示仅在 4g 可用）
3. 示例过滤命令（如 jq/python 过滤脚本）
4. 说明 `sellout` 状态表示售罄

## 环境信息

- KooCLI: 7.2.12
- 插件: huaweicloud-devkit v0.1.0
- 区域: cn-north-4
- ListFlavors 返回 1000 条，仅 3 条 status=normal

## 证据

- `06-list-flavors.json`: ListFlavors 完整返回 (2.4MB, 1000 条)
- 首次创建 ECS 失败: `Ecs.0019 Flavor as7.medium.2 is abandoned`
- 详见 `evidence-chain.md` P2 章节
