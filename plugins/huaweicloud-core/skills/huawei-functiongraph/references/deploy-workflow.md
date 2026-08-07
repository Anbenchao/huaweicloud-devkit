# End-to-End Deployment Workflow

```
1. Write code     → Create index.py with handler function
2. Package        → zip -r function.zip index.py
3. Create function → hcloud FunctionGraph CreateFunction (use --help for params)
4. Verify         → hcloud FunctionGraph InvokeFunction
5. Create trigger  → hcloud FunctionGraph CreateFunctionTrigger (use --help for params)
```

## Step-by-Step (Python)

```bash
# 1. Write code
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

# 3. Create function (discover params with --help first!)
hcloud FunctionGraph CreateFunction --help
# Required: --func_name, --runtime, --handler, --memory_size, --package, --timeout
# Code type: use --code_type=zip --code_filename=function.zip (cd to function.zip dir first!)

# 4. Verify (store URN from step 3 output)
hcloud FunctionGraph InvokeFunction --help
# Requires body param: --name=test-event

# 5. Create trigger (see references/triggers.md)
hcloud FunctionGraph CreateFunctionTrigger --help
# For simple testing: use --trigger_type_code=TIMER
# For HTTP: use --trigger_type_code=DEDICATEDGATEWAY
```
