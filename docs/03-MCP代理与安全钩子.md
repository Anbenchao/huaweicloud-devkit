# Huawei Core — MCP 代理与安全钩子详细设计

## 一、mcp-proxy-for-huawei Python 包结构

```
mcp-proxy-for-huawei/
  pyproject.toml
  src/mcp_proxy_huawei/
    server.py          # MCP Server (FastMCP)
    auth.py            # AK/SK + Token
    executor.py        # KooCli executor
    tools/             # 17 service tools
      ecs.py obs.py vpc.py iam.py rds.py
      functiongraph.py cce.py modelarts.py
      smn_dms.py cloud_eye.py cts.py dew.py
      billing.py cbr.py waf_aad.py dds_dcs.py
      runner.py        # run_script sandbox
    utils/
      signature.py     # Huawei Cloud signing
      logging.py       # Audit logging
      sanitize.py      # Sensitive data sanitization
```

## 二、认证流程 (auth.py)

凭证读取优先级:
1. 环境变量 HUAWEICLOUD_AK / HUAWEICLOUD_SK
2. 配置文件 ~/.huaweicloud/credentials
3. hcloud configure get (读取已配置的 CLI 凭证)

与 aws-core --skip-auth 语义完全一致: 不要求额外的认证, 复用本地已有凭证。

## 三、Executor KooCliSandbox (executor.py)

核心机制 (模仿 mcp-proxy-for-aws):
- 所有 hcloud 命令在子进程隔离执行
- 输出自动截断和敏感信息脱敏
- 每次调用记录审计日志 (时间/用户/命令/结果)
- 支持 run_script: 在沙箱中运行 Python 脚本做确定性计算

## 四、MCP Tool 注册模式 (以 ECS 为例)

每个华为云服务对应一个 tools/<service>.py，注册为该服务的 MCP Tools:

- ecs_list_flavors(region, zone) -> hcloud ecs list-flavors
- ecs_create_instance(region, flavor, image, vpc_id, subnet_id, name) -> hcloud ecs create
- ecs_list_instances(region) -> hcloud ecs list
- ecs_start_instance / ecs_stop_instance / ecs_reboot_instance
- ecs_resize_instance / ecs_attach_disk / ecs_detach_disk


---

# Huawei Core - MCP Proxy 知识/发现工具 (修复)

> 修复审查报告 P0 问题: MCP proxy 缺少 search_documentation / retrieve_skill 等知识工具
> 对标 AWS MCP 的 5 个默认认证知识工具

---

## 修复前 vs 修复后

| 能力 | 修复前 (03文档) | 修复后 |
|------|---------------|--------|
| API 执行工具 | 17 个 service tools | 17 个 (不变) |
| 文档搜索 | 无 | + search_huawei_docs |
| 技能检索 | 无 | + retrieve_skill |
| 区域发现 | 无 | + list_regions |
| 服务可用性 | 无 | + get_regional_availability |
| 脚本执行 | runner.py | runner.py (不变) |

---

## 新增工具 1: search_huawei_docs

跨华为云文档 + 技能全文搜索，返回轻量结果列表。

```python
@mcp.tool()
def search_huawei_docs(
    query: str,
    topic: str = "all"  # all | ecs | obs | vpc | iam | rds | modelarts | ...
) -> list[dict]:
    """
    Search Huawei Cloud documentation and skills for information.
    
    Searches across:
    1. All SKILL.md description fields in plugins/huawei-core/skills/
    2. Local cached documentation index
    3. Knowledge cards in assets/
    
    Returns: List of {source, title, snippet, relevance} for top 10 results.
    
    Use when: Agent needs to discover which skill covers a topic,
    or when uncertain about API parameters, quotas, or limitations.
    """
    # 一期: 搜索本地 skills/ 目录下所有 SKILL.md 的 description 字段
    # 二期: 集成华为云文档 API
    pass
```

## 新增工具 2: retrieve_skill

按技能名返回完整 SKILL.md 内容 + references/ 文件列表。

```python
@mcp.tool()
def retrieve_skill(name: str) -> dict:
    """
    Retrieve a full SKILL.md by skill name.
    
    Returns: {
        "name": "huawei-ecs",
        "version": 1,
        "description": "...",
        "content": "<full SKILL.md markdown>",
        "references": ["flavors.md", "create-instance.md", ...]
    }
    
    Use when: The agent has identified which skill to use and
    needs the complete procedure and reference files.
    """
    pass
```

## 新增工具 3: list_regions

列出可用的华为云区域。

```python
@mcp.tool()
def list_regions() -> list[dict]:
    """
    List available Huawei Cloud regions.
    
    Returns: [{region_id, display_name, endpoint, availability_zones}]
    
    Use when: Agent needs to discover available regions before
    creating resources or checking regional availability.
    """
    pass
```

## 新增工具 4: get_regional_availability

查询特定服务在目标区域是否可用。

```python
@mcp.tool()
def get_regional_availability(
    service: str,  # ecs, obs, rds, gaussdb, cce, modelarts, ...
    region: str,   # cn-south-1, cn-north-4, ...
) -> dict:
    """
    Check if a service is available in a specific region.
    
    Returns: {service, region, available: bool, ga_status, endpoint}
    
    Use when: Agent needs to verify service availability before
    creating resources. Prevents spending time on operations that
    will fail due to regional unavailability.
    """
    pass
```

---

## 工具分类总览

| 类别 | 工具 | 需要认证? |
|------|------|----------|
| **知识/发现** | search_huawei_docs | 否 (--skip-auth 可用) |
| **知识/发现** | retrieve_skill | 否 |
| **知识/发现** | list_regions | 否 |
| **知识/发现** | get_regional_availability | 否 |
| **执行** | ecs_create_instance, ecs_list_flavors, ... | 是 (需要 AK/SK) |
| **执行** | obs_create_bucket, obs_put_object, ... | 是 |
| **执行** | ... (其余 15 个服务) | 是 |
| **执行** | run_script | 是 (沙箱限制) |

--skip-auth 语义: 只放行知识/发现工具。API 执行工具需要认证。
与 AWS MCP 的 --skip-auth 行为完全一致。
