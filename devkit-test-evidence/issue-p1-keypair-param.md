# Issue P1: NovaCreateKeypair 参数名与技能文档不一致

## 问题描述

技能参考文档 `skills/huawei-ecs/references/create-instance.md` 中 `NovaCreateKeypair` 的参数名写为 `--keypair_name`，但 KooCLI 7.x 实际参数为 `--keypair.name`（点号嵌套格式）。Agent 按文档执行会报错 `Invalid parameter: keypair_name`。

同时，`NovaDeleteKeypair` 使用 `--keypair_name`（下划线格式），与 `NovaCreateKeypair` 的 `--keypair.name`（点号格式）风格不一致。

## 位置

- 文件: `plugins/huawei-core/skills/huawei-ecs/references/create-instance.md`
- 第 33 行: `hcloud ECS NovaCreateKeypair --keypair_name=<name>`

## 复现步骤

```bash
# 按文档执行 (失败)
hcloud ECS NovaCreateKeypair --cli-region=cn-north-4 --keypair_name=test-kp
# 输出: [USE_ERROR]Invalid parameter: keypair_name

# 实际正确参数 (成功)
hcloud ECS NovaCreateKeypair --cli-region=cn-north-4 --keypair.name=test-kp
```

## 期望行为

文档参数名应与 KooCLI 实际参数一致：`--keypair.name=<name>`

## 环境信息

- KooCLI: 7.2.12
- 插件: huaweicloud-devkit v0.1.0

## 证据

- `--help` 输出显示参数为 `--keypair.name`
- `NovaDeleteKeypair --help` 显示参数为 `--keypair_name` (下划线)
- 详见 `evidence-chain.md` P1 章节
