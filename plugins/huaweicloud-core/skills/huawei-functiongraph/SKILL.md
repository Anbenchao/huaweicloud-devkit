---
name: huawei-functiongraph
description: "Use when creating, deploying, or managing serverless functions on FunctionGraph. Covers triggers (APIG/OBS/timer/SMN), cold start, reserved concurrency. Triggers: FunctionGraph, serverless, function, Lambda, trigger. NOT for: CCE containers (use huawei-cce)."
version: 1
---

# Huawei Cloud FunctionGraph

**STOP - Do not answer from general knowledge.** Follow the procedure below.

## Overview

Domain expertise for Huawei Cloud FunctionGraph. Covers function lifecycle, code deployment, trigger configuration, cold start management, and troubleshooting.

## Critical Warnings

| Trap | Why |
|------|-----|
| Cold start 100ms-2s | Reserve concurrency for latency-sensitive workloads |
| Max execution 900s | Timeout after 15 min. Use ECS/CCE for long tasks |
| Env vars plaintext | Use DEW for secrets |
| Service name is `FunctionGraph` | NOT `FGS`. KooCLI 7.x uses the full service name |
| CLI requires `project_id` | All FunctionGraph CLI ops need `--cli-region` and `--project_id` |

## Prerequisites

Before any FunctionGraph operation, verify:

```bash
hcloud configure list              # confirm a profile exists
hcloud FunctionGraph --help        # confirm service is available
```

## Runtimes

| Language | Versions |
|----------|----------|
| Python | 2.7, 3.6, 3.9, 3.10, 3.11 |
| Node.js | 6.10, 8.10, 10.16, 12.13, 14.18, 16.17, 18.15 |
| Java | 8, 11, 17 |
| Go | 1.x, 1.8 |
| C# (.NET Core) | 2.0, 2.1, 3.1, 6.0 |
| PHP | 7.3, 8.3 |
| Cangjie | 1.0 |
| Custom | Custom runtime with user-provided bootstrap |
| Custom Image | SWR container image (Custom-Image-Swr) |

Verify current supported runtimes with: `hcloud FunctionGraph ListRuntimes --cli-region=<region>`

## Common Workflows

| Task | Command |
|------|---------|
| List functions | `hcloud FunctionGraph ListFunctions --cli-region=<r> --project_id=<p>` |
| List runtimes | `hcloud FunctionGraph ListRuntimes --cli-region=<r> --project_id=<p>` |
| Show function detail | `hcloud FunctionGraph ShowFunctionConfig --function_urn=<urn> --cli-region=<r> --project_id=<p>` |
| Delete function | `hcloud FunctionGraph DeleteFunction --function_urn=<urn> --cli-region=<r> --project_id=<p>` |
| Invoke function | `hcloud FunctionGraph InvokeFunction --function_urn=<urn> --cli-region=<r> --project_id=<p>` |

## Create Function — Required Parameters

The minimal required parameters for `CreateFunction`:

```bash
hcloud FunctionGraph CreateFunction \
  --func_name=<name> \
  --runtime=Python3.10 \
  --handler=index.handler \
  --memory_size=128 \
  --package=default \
  --timeout=3 \
  --cli-region=<region> \
  --project_id=<project_id>
```

| Parameter | Required | Description |
|-----------|:--------:|-------------|
| `--func_name` | Yes | Function name, globally unique |
| `--runtime` | Yes | Runtime identifier (e.g. `Python3.10`, `Node.js18.15`) |
| `--handler` | Yes | Entry point: `<filename>.<method>` for Python/Node, `<package>.<class>::<method>` for Java |
| `--memory_size` | Yes | Memory in MB. Valid: 128, 256, 512, 768, 1024, 1280, 1536, 1792, 2048, 2560, 3072, 3584, 4096, 8192, 10240 |
| `--package` | Yes | Package type: `default` (FunctionGraph console) or `app` (custom app) |
| `--timeout` | Yes | Max execution time in seconds (3-900) |
| `--cli-region` | Yes | Region (e.g. `cn-north-4`) |
| `--project_id` | Yes | Huawei Cloud project ID |
| `--type` | No | `v1` (default) or `v2` (new function format) |
| `--description` | No | Function description |
| `--app_xrole` | No | Agency name for cross-service access |

## Code Deployment

### Code Type Guide (`--code_type`)

| Type | Use Case | Additional Params |
|------|----------|-------------------|
| `inline` | Small functions, demos | `--func_code.file` with base64-encoded code |
| `zip` | Local zip package upload | `--code_filename` = zip file name |
| `obs` | Large packages from OBS | `--code_url` = OBS object URL |
| `jar` | Java JAR packages | `--code_filename` = jar file name |
| `Custom-Image-Swr` | Container images | `--code_url` = SWR image URI |

### Inline Code Example (Python)

```bash
hcloud FunctionGraph CreateFunction \
  --func_name=hello-world \
  --runtime=Python3.10 \
  --handler=index.handler \
  --memory_size=128 \
  --package=default \
  --timeout=3 \
  --code_type=inline \
  --func_code.file="ZGVmIGhhbmRsZXIoZXZlbnQsIGNvbnRleHQpOgogICAgcmV0dXJuIHsnc3RhdHVzQ29kZSc6IDIwMCwgJ2JvZHknOiAnSGVsbG8gRnVuY3Rpb25HcmFwaCEnfQ==" \
  --cli-region=<region> \
  --project_id=<project_id>
```

### Zip Package Example

```bash
# 1. Package code
zip -r function.zip index.py

# 2. Create function with zip
hcloud FunctionGraph CreateFunction \
  --func_name=hello-world \
  --runtime=Python3.10 \
  --handler=index.handler \
  --memory_size=128 \
  --package=default \
  --timeout=3 \
  --code_type=zip \
  --code_filename=function.zip \
  --cli-region=<region> \
  --project_id=<project_id>
```

### OBS Code Example

```bash
hcloud FunctionGraph CreateFunction \
  --func_name=hello-world \
  --runtime=Python3.10 \
  --handler=index.handler \
  --memory_size=128 \
  --package=default \
  --timeout=3 \
  --code_type=obs \
  --code_url="https://<bucket>.obs.<region>.myhuaweicloud.com/function.zip" \
  --cli-region=<region> \
  --project_id=<project_id>
```

### Function Code Templates

**Python (index.py):**
```python
def handler(event, context):
    return {
        "statusCode": 200,
        "body": "Hello FunctionGraph!"
    }
```

**Node.js (index.js):**
```js
exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        body: "Hello FunctionGraph!"
    };
};
```

## Triggers

### Create Function Trigger

```bash
hcloud FunctionGraph CreateFunctionTrigger \
  --function_urn=<urn> \
  --trigger_type_code=<type> \
  --event_type_code=<event> \
  --trigger_status=ACTIVE \
  --event_data=<json> \
  --cli-region=<region> \
  --project_id=<project_id>
```

| Trigger Type | `--trigger_type_code` | Typical `--event_type_code` |
|--------------|----------------------|-----------------------------|
| APIG | `APIG` | `APICreated` |
| OBS | `OBS` | `ObjectCreated` |
| Timer | `TIMER` | `MessageCreated` |
| SMN | `SMN` | `MessageCreated` |
| DIS | `DIS` | `MessageCreated` |
| LTS | `LTS` | `MessageCreated` |
| CTS | `CTS` | `MessageCreated` |
| DDS | `DDS` | `MessageCreated` |
| Kafka | `KAFKA` | `MessageCreated` |

### List Triggers

```bash
hcloud FunctionGraph ListFunctionTriggers \
  --function_urn=<urn> \
  --cli-region=<region> \
  --project_id=<project_id>
```

### Delete Trigger

```bash
hcloud FunctionGraph DeleteFunctionTrigger \
  --function_urn=<urn> \
  --trigger_type_code=<type> \
  --trigger_id=<id> \
  --cli-region=<region> \
  --project_id=<project_id>
```

## End-to-End Deployment Workflow

To deploy a backend service on FunctionGraph:

```
1. Write code        → Create index.py / index.js with handler
2. Package code      → zip -r function.zip index.py
3. Create function   → hcloud FunctionGraph CreateFunction ... (with code_type=zip)
4. Verify deployment → hcloud FunctionGraph InvokeFunction
5. Create trigger    → hcloud FunctionGraph CreateFunctionTrigger (APIG for HTTP)
6. Publish API       → Use huawei-apig skill for API Gateway publication
```

### Step-by-Step Example (Python backend):

```bash
# 1. Write function code
cat > index.py << 'EOF'
import json

def handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Hello from FunctionGraph!"}),
        "headers": {"Content-Type": "application/json"}
    }
EOF

# 2. Package
zip -r function.zip index.py

# 3. Create function
hcloud FunctionGraph CreateFunction \
  --func_name=my-backend \
  --runtime=Python3.10 \
  --handler=index.handler \
  --memory_size=256 \
  --package=default \
  --timeout=30 \
  --code_type=zip \
  --code_filename=function.zip \
  --cli-region=cn-north-4 \
  --project_id=<your-project-id>

# 4. Verify (store URN from step 3)
hcloud FunctionGraph InvokeFunction \
  --function_urn=<urn-from-step-3> \
  --cli-region=cn-north-4 \
  --project_id=<your-project-id>

# 5. Create APIG trigger for HTTP access
hcloud FunctionGraph CreateFunctionTrigger \
  --function_urn=<urn> \
  --trigger_type_code=APIG \
  --event_type_code=APICreated \
  --trigger_status=ACTIVE \
  --event_data='{"group_id":"<api-group-id>","env_name":"RELEASE","env_id":"<env-id>"}' \
  --cli-region=cn-north-4 \
  --project_id=<your-project-id>
```

## Troubleshooting

| Error | Root Cause -> Fix |
|-------|------------------|
| `不支持的服务名称:FGS` | Wrong service name -> Use `FunctionGraph`, not `FGS` |
| `不支持的operation:CreateTrigger` | Wrong operation name -> Use `CreateFunctionTrigger` |
| `缺少必填参数` | Missing required params -> Ensure `--memory_size`, `--package`, `--timeout`, `--cli-region`, `--project_id` |
| Function times out | Exceeded `--timeout` -> Increase timeout or optimize code |
| Memory exceeded | `--memory_size` too low -> Increase to next tier |
| Code too large | Inline limited to 10KB -> Use zip/obs code type |
| Cold start slow | No reserved concurrency -> Set reserved instances for critical functions |
| Auth failure | Expired/invalid AK/SK -> Run `hcloud configure init` |

## Security Considerations

- MUST use DEW for secrets, never hardcode in environment variables
- MUST use `--app_xrole` (agency) for cross-service access
- SHOULD enable CTS audit logging for function invocations
- MUST NOT expose AK/SK in function code
- SHOULD use VPC configuration for functions accessing internal services

## MCP Tools

- `huaweicloud_list_operations` service=FunctionGraph
- `huaweicloud_run_readonly_command` for discovery
- `huaweicloud_run_approved_command` for writes

## Without MCP

Fall back to hcloud CLI. State: "MCP unavailable, using local hcloud CLI."

## Cross-Skill References

- **APIG trigger setup**: See `huawei-apig` for API group creation and publishing
- **OBS trigger setup**: See `huawei-obs` for bucket and object event configuration
- **DEW secrets**: See `huawei-dew` for managing function secrets
- **SMN notifications**: See `huawei-smn-dms` for notification topics
- **VPC configuration**: See `huawei-vpc` for network settings

## References

- FunctionGraph Docs: https://support.huaweicloud.com/functiongraph/
- API Reference: https://support.huaweicloud.com/api-functiongraph/functiongraph_06_0100.html
