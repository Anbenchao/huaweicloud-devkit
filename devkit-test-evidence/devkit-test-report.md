# HuaweiCloud DevKit 插件测试报告

## 1. 执行摘要

| 项目 | 内容 |
|------|------|
| 测试日期 | 2026-08-09 |
| 测试区域 | cn-north-4 (北京四) |
| 插件名称 | huaweicloud-devkit |
| 插件版本 | v0.1.0 |
| KooCLI 版本 | 7.2.12 |
| Node.js 版本 | v24.18.0 |
| 测试结果 | **通过** - ECS 创建、SSH 连通、资源清理全部成功 |
| 总耗时 | ~16 分钟 (18:05:39 - 18:21:17) |
| 资源前缀 | devkit-test |
| MCP 工具状态 | 未生效（需重启会话），使用 hcloud CLI 直接执行 |

## 2. 测试场景

> 在华为云上创建一台 ECS 服务器，最小规格，按量付费。先搭好网络环境，然后买 ECS。服务器能 SSH 上去即可。确认能连上后，清理所有资源。所有新建资源带 "devkit-test" 前缀，不碰账号已有资源。

## 3. 插件安装

### 3.1 安装命令
```bash
npx --yes huaweicloud-devkit install
```

### 3.2 安装结果
- 27 个技能安装到 `/home/zhangfajun/.config/opencode/skills/`
- MCP 服务器安装到 `/home/zhangfajun/.config/opencode/huaweicloud-plugins/src/`
- 安全策略安装到 `/home/zhangfajun/.config/opencode/huaweicloud-plugins/safety/`
- OpenCode MCP 配置更新: `/home/zhangfajun/.config/opencode/opencode.jsonc`

### 3.3 Doctor 自检结果
```
[PASS] Node.js >= 20
[PASS] MCP server installed
[PASS] MCP server can start
[PASS] Safety policy installed
[PASS] OpenCode MCP configured
[PASS] hcloud CLI installed (Version: 7.2.12)
[PASS] hcloud credentials configured
[PASS] Skills installed (27)
Results: 8 pass, 0 warn, 0 fail
```

### 3.4 MCP 工具可用性
MCP 工具需要重启 OpenCode 会话才能生效。本次测试在安装后的同一会话中执行，MCP 工具不可用。按照技能中的 "Without MCP (Fallback)" 指导，直接使用 hcloud CLI 执行，测试仍然成功完成。

## 4. 执行步骤与耗时

### 阶段一：前置条件检查

| 步骤 | 耗时 | 时间戳 | 结果 |
|------|------|--------|------|
| 检查 Node.js/npm/npx | <1s | 18:05:39 | Node.js v24.18.0, npm 11.16.0 |
| 检查 hcloud (KooCLI) | <1s | 18:05:39 | 在 ~/.local/bin/hcloud，不在 PATH 中 |
| 验证认证 (IAM KeystoneListAuthDomains) | 1s | 18:05:39 | 域名 hwstaff_blue_dev，认证正常 |

### 阶段二：插件安装与验证

| 步骤 | 耗时 | 时间戳 | 结果 |
|------|------|--------|------|
| npx huaweicloud-devkit install | 5s | 18:05:39-18:05:44 | 安装成功，27 技能 + MCP + 安全策略 |
| npx huaweicloud-devkit doctor | 2s | 18:05:58-18:06:00 | 8/8 检查通过 |
| 读取技能文件 (ECS/VPC/Getting-Started) | ~10s | 18:06-18:07 | 获取创建 ECS 的完整 SOP |

### 阶段三：网络环境搭建

| 步骤 | 耗时 | 时间戳 | 结果 | 证据文件 |
|------|------|--------|------|----------|
| 查询现有 VPC (避免 CIDR 冲突) | <1s | 18:08:10 | 15 个现有 VPC，选择 10.250.0.0/16 | 01-list-vpcs.json |
| 创建 VPC devkit-test-vpc | 1s | 18:08:26-18:08:27 | ID: ba083c80-... | 02-create-vpc.json |
| 创建子网 devkit-test-subnet (含 DNS) | 3s | 18:08:50-18:08:53 | ID: c0a25492-... | 03-create-subnet.json |
| 查询可用区 (AZ) | <1s | 18:08:52 | 4 个 AZ: 4a/4b/4c/4g | 04-list-azs.json |
| 创建安全组 devkit-test-sg | <1s | 18:09:15 | ID: 8af6b396-... | 05-create-sg.json |
| 查询 ECS 规格 (ListFlavors) | 2s | 18:09:20-18:09:22 | 1000 个规格 | 06-list-flavors.json |
| 查询镜像 (ListImages) - 首次失败 | 1s | 18:09:24-18:09:25 | 参数名错误 --imagetype | - |
| 查询镜像 (ListImages) - 修正后 | <1s | 18:10:23 | 50 个公共镜像 | 07-list-images.json |
| 添加 SSH 安全组规则 (22端口) | <1s | 18:10:48 | 规则 ID: 8e7b63cf-... | 08-sg-rule-ssh.json |
| 创建密钥对 - 首次失败 | <1s | 18:10:50 | 参数名错误 --keypair_name | - |
| 创建密钥对 devkit-test-keypair | 1s | 18:11:13-18:11:14 | 指纹: SHA256:Mxgx... | 09-create-keypair.json |

### 阶段四：ECS 创建

| 步骤 | 耗时 | 时间戳 | 结果 | 证据文件 |
|------|------|--------|------|----------|
| 创建 ECS - 首次失败 | 2s | 18:12:36-18:12:38 | 规格 as7.medium.2 已废弃 (Ecs.0019) | - |
| 创建 ECS - 修正规格后 | 3s | 18:13:51-18:13:54 | Server ID: 1886cd55-... | 10-create-ecs.json |
| 等待 ECS 变为 ACTIVE | <1s | 18:14:11 | 首次轮询即 ACTIVE | - |
| 查询 ECS 详情 (获取 port_id) | <1s | 18:14:26 | 私网 IP: 10.250.0.99 | 11-ecs-details.json |
| 创建 EIP | 2s | 18:14:44-18:14:46 | 公网 IP: 114.116.244.186 | 12-create-eip.json |
| 绑定 EIP 到 ECS | 1s | 18:15:00-18:15:01 | 绑定成功 | 13-bind-eip.json |

### 阶段五：SSH 连通性验证

| 步骤 | 耗时 | 时间戳 | 结果 | 证据文件 |
|------|------|--------|------|----------|
| SSH 连接测试 | <1s | 18:15:14 | 连接成功，HCE 2.0 | 14-ssh-test.txt |

### 阶段六：资源清理

| 步骤 | 耗时 | 时间戳 | 结果 | 证据文件 |
|------|------|--------|------|----------|
| 删除 ECS (含 EIP+磁盘) | <1s | 18:16:31 | job_id 返回 | 15-delete-ecs.json |
| 等待 ECS 删除完成 | ~3min | 18:16:46-18:19:52 | 首次轮询即 DELETED | - |
| 删除密钥对 | 1s | 18:20:21-18:20:22 | 成功 | 16-delete-keypair.txt |
| 删除安全组 | <1s | 18:20:38 | 成功 | 18-delete-sg.txt |
| 删除子网 | 1s | 18:20:47-18:20:48 | 成功 | 19-delete-subnet.txt |
| 删除 VPC | 1s | 18:20:55-18:20:56 | 成功 | 20-delete-vpc.txt |
| 最终验证所有资源已删除 | 1s | 18:21:16-18:21:17 | 全部确认删除 | 17-check-eip.txt |

## 5. 耗时较久的步骤及原因

| 步骤 | 耗时 | 原因 |
|------|------|------|
| 等待 ECS 删除完成轮询 | ~3 分钟 | ECS 删除后状态显示 DELETED 但记录保留，轮询脚本持续检查 18 次（每次间隔 10s）。实际删除在首次轮询时已完成（<15s），轮询逻辑未在 DELETED 状态时提前退出，导致额外等待。这是测试脚本的逻辑问题，非插件问题。 |
| 查询 ECS 规格 (ListFlavors) | 2s | 返回 1000 条规格记录（2.4MB JSON），数据量大。后续需要客户端过滤 `cond:operation:status` 和 `cond:operation:az` 字段才能找到可用规格，增加了处理时间。 |
| 插件安装 | 5s | npx 需要下载 huaweicloud-devkit 包并执行安装脚本，复制 27 个技能文件和 MCP 服务器代码。耗时合理。 |

## 6. 创建的资源清单

| 资源类型 | 名称 | ID | 状态 |
|----------|------|----|----|
| VPC | devkit-test-vpc | ba083c80-276c-4669-baec-c233a60b7852 | 已删除 |
| 子网 | devkit-test-subnet | c0a25492-3e76-4473-ad30-c44e873c0a12 | 已删除 |
| 安全组 | devkit-test-sg | 8af6b396-2d4b-4d30-897e-aeb098858f99 | 已删除 |
| 安全组规则 | SSH ingress 22 | 8e7b63cf-aa12-4b14-b686-e7345517eff1 | 已删除(随SG) |
| 密钥对 | devkit-test-keypair | - | 已删除 |
| ECS | devkit-test-ecs | 1886cd55-c3b2-45bc-a7c6-9a769a6d0c09 | 已删除 |
| 系统盘 | GPSSD 40GB | - | 已删除(随ECS) |
| EIP | 114.116.244.186 | c53e17a0-845f-42f5-9337-e8cb8d698920 | 已删除(随ECS) |
| 带宽 | devkit-test-bw | 077da9a7-2dd6-4ad5-a491-d21ffeafd2b1 | 已删除(随EIP) |

## 7. 插件测试发现与问题

### 7.1 问题 P1: 密钥对参数名不一致 (文档 Bug)

**严重程度:** 中  
**位置:** `skills/huawei-ecs/references/create-instance.md` 第 33 行

技能参考文档中 `NovaCreateKeypair` 的参数写为 `--keypair_name=<name>`，但 KooCLI 7.x 实际参数为 `--keypair.name=<name>`（点号嵌套格式）。而 `NovaDeleteKeypair` 却使用 `--keypair_name`（下划线格式）。同一服务下创建和删除的参数命名风格不一致，且文档与实际不符。

- 文档写的: `hcloud ECS NovaCreateKeypair --keypair_name=<name>`
- 实际应为: `hcloud ECS NovaCreateKeypair --keypair.name=<name>`
- NovaDeleteKeypair 实际参数: `--keypair_name` (下划线，与文档一致但与 Create 不一致)

### 7.2 问题 P2: ListFlavors 返回废弃规格无过滤指引

**严重程度:** 中  
**位置:** `skills/huawei-ecs/references/flavors.md`

技能正确提醒 "不要硬编码规格名" 和 "始终先 ListFlavors"，但未说明如何从返回结果中过滤出可用规格。ListFlavors 返回 1000 条记录中，绝大多数规格的 `os_extra_specs.cond:operation:status` 为 `abandon`。技能未提及此关键字段，也未提及 `cond:operation:az` 字段（规格在不同 AZ 的可用性不同）。

本次测试中，首次使用 `as7.medium.2` 创建 ECS 失败（Ecs.0019 Flavor abandoned），后通过分析 `cond:operation:status=normal` 和 `cond:operation:az` 字段才找到可用规格 `at7.large.1`（仅在 cn-north-4g 可用）。

建议在 `flavors.md` 中补充：
- 如何读取 `os_extra_specs.cond:operation:status` 字段过滤可用规格
- 如何读取 `os_extra_specs.cond:operation:az` 字段确认 AZ 可用性
- 示例过滤命令

### 7.3 问题 P3: MCP 工具需重启会话才能生效

**严重程度:** 低  
**位置:** README.md

安装后 MCP 工具需要重启 OpenCode 会话才能生效。对于在安装后立即执行任务的场景，MCP 的安全脱敏和写操作审批功能不可用。技能中有 "Without MCP (Fallback)" 指导，但 fallback 模式下 hcloud 命令会出现在 shell 历史中，存在安全风险。

### 7.4 优点: 技能提供的有效指导

以下技能指导在本次测试中被验证为有效且关键：

1. **VPC 参数嵌套前缀** - `--vpc.name` 而非 `--name`，避免了参数错误
2. **子网 DNS 必填** - 设置 primary_dns/secondary_dns 避免了 cloud-init DNS 解析失败
3. **安全组不需要 vpc_id** - 避免了 `vpc_id` 参数错误
4. **删除时 delete_publicip 和 delete_volume 默认 false** - 明确设置为 true 避免了资源泄漏
5. **SSH 安全组规则不应开放 0.0.0.0/0** - 正确将 SSH 规则限定为客户端公网 IP /32
6. **先查现有 VPC 避免 CIDR 冲突** - 成功选择了不冲突的 10.250.0.0/16
7. **规格不硬编码，先 ListFlavors** - 虽然首次失败，但流程正确

## 8. 华为云开放能力总结

### 8.1 涉及的云服务

| 服务 | 服务名 | 用途 |
|------|--------|------|
| IAM | Identity and Access Management | 身份认证验证 |
| VPC | Virtual Private Cloud | VPC/子网/安全组/安全组规则 |
| EIP | Elastic IP | 公网 IP 创建与绑定 |
| ECS | Elastic Cloud Server | 云服务器创建/查询/删除/密钥对 |
| IMS | Image Management Service | 公共镜像查询 |
| EVS | Elastic Volume Service | 系统盘 (随 ECS 创建/删除) |

### 8.2 使用的 API / KooCLI 命令

| 序号 | 服务 | API 操作 | KooCLI 命令 | 方法 | 用途 |
|------|------|----------|-------------|------|------|
| 1 | IAM | KeystoneListAuthDomains | `hcloud IAM KeystoneListAuthDomains` | GET | 验证认证有效性 |
| 2 | VPC | ListVpcs | `hcloud VPC ListVpcs --cli-region=cn-north-4` | GET | 查询现有 VPC (避免 CIDR 冲突) |
| 3 | VPC | CreateVpc | `hcloud VPC CreateVpc --vpc.name=devkit-test-vpc --vpc.cidr=10.250.0.0/16` | POST | 创建 VPC |
| 4 | VPC | CreateSubnet | `hcloud VPC CreateSubnet --subnet.name=... --subnet.vpc_id=... --subnet.cidr=... --subnet.gateway_ip=... --subnet.primary_dns=... --subnet.secondary_dns=...` | POST | 创建子网 (含 DNS) |
| 5 | ECS | NovaListAvailabilityZones | `hcloud ECS NovaListAvailabilityZones --cli-region=cn-north-4` | GET | 查询可用区 |
| 6 | VPC | CreateSecurityGroup | `hcloud VPC CreateSecurityGroup --security_group.name=devkit-test-sg` | POST | 创建安全组 |
| 7 | ECS | ListFlavors | `hcloud ECS ListFlavors --cli-region=cn-north-4` | GET | 查询 ECS 规格 |
| 8 | IMS | ListImages | `hcloud IMS ListImages --__imagetype=gold --__isregistered=true --__os_type=Linux --architecture=x86` | GET | 查询公共镜像 |
| 9 | VPC | CreateSecurityGroupRule | `hcloud VPC CreateSecurityGroupRule --security_group_rule.security_group_id=... --security_group_rule.direction=ingress --security_group_rule.protocol=tcp --security_group_rule.multiport=22 --security_group_rule.remote_ip_prefix=1.92.82.218/32` | POST | 添加 SSH 安全组规则 |
| 10 | ECS | NovaCreateKeypair | `hcloud ECS NovaCreateKeypair --keypair.name=devkit-test-keypair` | POST | 创建 SSH 密钥对 |
| 11 | ECS | CreateServers | `hcloud ECS CreateServers --server.name=... --server.flavorRef=at7.large.1 --server.imageRef=... --server.nics.1.subnet_id=... --server.root_volume.volumetype=GPSSD --server.root_volume.size=40 --server.vpcid=... --server.availability_zone=cn-north-4g --server.key_name=... --server.security_groups.1.id=... --server.extendparam.chargingMode=postPaid` | POST | 创建 ECS (按量付费) |
| 12 | ECS | ListServersDetails | `hcloud ECS ListServersDetails --server_id=...` | GET | 查询 ECS 状态和详情 |
| 13 | EIP | CreatePublicip | `hcloud EIP CreatePublicip --publicip.type=5_bgp --bandwidth.size=1 --bandwidth.share_type=PER --bandwidth.name=devkit-test-bw` | POST | 创建公网 EIP |
| 14 | EIP | AssociatePublicips | `hcloud EIP AssociatePublicips --publicip_id=... --publicip.associate_instance_id=<port_id> --publicip.associate_instance_type=PORT` | POST | 绑定 EIP 到 ECS |
| 15 | ECS | DeleteServers | `hcloud ECS DeleteServers --servers.1.id=... --delete_publicip=true --delete_volume=true` | DELETE | 删除 ECS (含 EIP 和磁盘) |
| 16 | ECS | NovaDeleteKeypair | `hcloud ECS NovaDeleteKeypair --keypair_name=devkit-test-keypair` | DELETE | 删除密钥对 |
| 17 | VPC | DeleteSecurityGroup | `hcloud VPC DeleteSecurityGroup --security_group_id=...` | DELETE | 删除安全组 |
| 18 | VPC | DeleteSubnet | `hcloud VPC DeleteSubnet --vpc_id=... --subnet_id=...` | DELETE | 删除子网 |
| 19 | VPC | DeleteVpc | `hcloud VPC DeleteVpc --vpc_id=...` | DELETE | 删除 VPC |
| 20 | EIP | ShowPublicip | `hcloud EIP ShowPublicip --publicip_id=...` | GET | 验证 EIP 已删除 |
| 21 | VPC | ShowVpc | `hcloud VPC ShowVpc --vpc_id=...` | GET | 验证 VPC 已删除 |
| 22 | VPC | ShowSecurityGroup | `hcloud VPC ShowSecurityGroup --security_group_id=...` | GET | 验证安全组已删除 |
| 23 | ECS | NovaShowKeypair | `hcloud ECS NovaShowKeypair --keypair_name=...` | GET | 验证密钥对已删除 |

### 8.3 插件技能使用情况

| 技能名称 | 用途 | 是否有效 |
|----------|------|----------|
| huawei-getting-started | KooCLI 安装和认证指导 | 有效 (已预装) |
| huawei-vpc | VPC/子网/安全组/EIP 创建指导 | 有效 |
| huawei-ecs | ECS 创建/规格选择/密钥对/删除指导 | 有效 (有文档 Bug) |
| huaweicloud-core | 核心路由和安全策略 | 有效 |

## 9. 证据链文件

所有证据文件保存在 `/home/zhangfajun/devkit-test-evidence/` 目录下：

| 文件 | 描述 | 大小 |
|------|------|------|
| 01-list-vpcs.json | 查询现有 VPC 列表 (15 个) | 11KB |
| 02-create-vpc.json | 创建 VPC 返回结果 | 415B |
| 03-create-subnet.json | 创建子网返回结果 (含 DNS) | 882B |
| 04-list-azs.json | 查询可用区 (4 个 AZ) | 523B |
| 05-create-sg.json | 创建安全组返回结果 | 3.1KB |
| 06-list-flavors.json | 查询 ECS 规格 (1000 条) | 2.4MB |
| 07-list-images.json | 查询公共镜像 (50 条) | 93KB |
| 08-sg-rule-ssh.json | 添加 SSH 安全组规则 | 807B |
| 09-create-keypair.json | 创建密钥对 (含公私钥) | 3.3KB |
| 10-create-ecs.json | 创建 ECS 返回结果 | 116B |
| 11-ecs-details.json | ECS 详情 (含 port_id) | 4.2KB |
| 12-create-eip.json | 创建 EIP 返回结果 | 471B |
| 13-bind-eip.json | 绑定 EIP 返回结果 | 1.7KB |
| 14-ssh-test.txt | SSH 连接测试输出 | 296B |
| 15-delete-ecs.json | 删除 ECS 返回结果 | 51B |
| 16-delete-keypair.txt | 删除密钥对输出 | 0B (成功无输出) |
| 17-check-eip.txt | 验证 EIP 已删除 | 434B |
| 18-delete-sg.txt | 删除安全组输出 | 167B |
| 19-delete-subnet.txt | 删除子网输出 | 0B (成功无输出) |
| 20-delete-vpc.txt | 删除 VPC 输出 | 0B (成功无输出) |
| devkit-test-keypair.pem | SSH 私钥 (已用完，可删除) | 2.5KB |

## 10. 结论

huaweicloud-devkit 插件 (v0.1.0) 在本次 ECS 创建+SSH 验证+清理测试场景中**整体表现良好**：

- **技能指导有效**: VPC/ECS 技能提供了关键的安全提醒和操作 SOP，避免了多个常见陷阱（CIDR 冲突、DNS 缺失、安全组 vpc_id 误用、删除时资源泄漏）
- **存在文档 Bug**: 密钥对参数名不一致 (P1)、规格过滤指引缺失 (P2) 需要修复
- **MCP 限制**: 需重启会话才能生效 (P3)，但 fallback 模式可完成测试
- **安全护栏**: 安全组规则限定为客户端 IP /32 而非 0.0.0.0/0，体现了插件安全意识

建议提交 3 个 GitHub Issue 分别对应 P1、P2、P3。
