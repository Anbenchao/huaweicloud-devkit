# CreateFunction

**Always run `hcloud FunctionGraph CreateFunction --help` first** for exact parameter names and requirements.

## Code Types (`--code_type`)

| Type | Use Case | Key Param |
|------|----------|-----------|
| `inline` | Small demos (<10KB) | `--func_code.file` = base64 code |
| `zip` | Local package | `--code_filename` = filename only, **no path**. `cd` to zip directory first |
| `obs` | Large packages | `--code_url` = OBS object URL |
| `jar` | Java JARs | `--code_filename` = filename only |
| `Custom-Image-Swr` | Container images | `--code_url` = SWR image URI |

## Gotchas

- `--code_filename` is **filename only**, not a path. If the zip is at `/tmp/function.zip`, you must `cd /tmp` first, then use `--code_filename=function.zip`.
- Inline code must be base64-encoded and < 10KB.
- `--package` must be `default` for FunctionGraph-console-managed functions.

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
