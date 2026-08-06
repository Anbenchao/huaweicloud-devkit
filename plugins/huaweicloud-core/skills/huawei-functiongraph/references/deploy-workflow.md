# End-to-End Deployment Workflow

```
1. Write code        → Create index.py with handler function
2. Package           → zip -r function.zip index.py
3. Create function   → hcloud FunctionGraph CreateFunction ... (with code_type=zip)
4. Verify            → hcloud FunctionGraph InvokeFunction
5. Create trigger    → hcloud FunctionGraph CreateFunctionTrigger (APIG for HTTP)
6. Publish API       → Use huawei-apig skill
```

## Step-by-Step Example (Python)

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

# 4. Verify (store URN from step 3 output)
hcloud FunctionGraph InvokeFunction \
  --function_urn=<urn-from-step-3> \
  --name=test-event \
  --cli-region=cn-north-4 \
  --project_id=<your-project-id>

# 5. Create APIG trigger (see references/triggers.md)
hcloud FunctionGraph CreateFunctionTrigger \
  --function_urn=<urn> \
  --trigger_type_code=APIG \
  --event_type_code=APICreated \
  --trigger_status=ACTIVE \
  --event_data.name=<api-name> \
  --event_data.auth=IAM \
  --event_data.req_uri=/my-backend \
  --event_data.match_mode=SWA \
  --event_data.type=1 \
  --event_data.request_protocol=HTTPS \
  --event_data.request_method=ANY \
  --event_data.func_info.timeout=5000 \
  --event_data.group_id=<api-group-id> \
  --event_data.env_name=RELEASE \
  --cli-region=cn-north-4 \
  --project_id=<your-project-id>
```
