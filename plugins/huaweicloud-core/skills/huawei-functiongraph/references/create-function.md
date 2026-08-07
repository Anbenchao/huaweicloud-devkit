# CreateFunction

## Required Parameters

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
| `--handler` | Yes | Entry point: `<filename>.<method>` (Python/Node) or `<package>.<class>::<method>` (Java) |
| `--memory_size` | Yes | Memory in MB: 128, 256, 512, 768, 1024, 1280, 1536, 1792, 2048, 2560, 3072, 3584, 4096, 8192, 10240 |
| `--package` | Yes | `default` (FunctionGraph console) or `app` (custom app) |
| `--timeout` | Yes | Max execution seconds (3-900) |
| `--cli-region` | Yes | Region (e.g. `cn-north-4`) |
| `--project_id` | Yes | Huawei Cloud project ID |
| `--type` | No | `v1` (default) or `v2` |
| `--description` | No | Function description |
| `--app_xrole` | No | Agency name for cross-service access |

## Code Types (`--code_type`)

| Type | Use Case | Additional Params |
|------|----------|-------------------|
| `inline` | Small demos (<10KB) | `--func_code.file` = base64-encoded code |
| `zip` | Local package | `--code_filename` = zip file name (filename only, no path; must run from file's directory) |
| `obs` | Large packages | `--code_url` = OBS object URL |
| `jar` | Java JARs | `--code_filename` = jar file name |
| `Custom-Image-Swr` | Container images | `--code_url` = SWR image URI |

### Inline Example

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

### Zip Example

```bash
zip -r function.zip index.py

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

### OBS Example

```bash
hcloud FunctionGraph CreateFunction \
  --code_type=obs \
  --code_url="https://<bucket>.obs.<region>.myhuaweicloud.com/function.zip" \
  ...other params...
```

## Function Code Templates

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
