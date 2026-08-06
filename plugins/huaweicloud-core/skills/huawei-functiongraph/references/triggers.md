# Triggers

## KooCLI event_data Format

**CRITICAL**: KooCLI uses **dotted key-value format**, NOT JSON strings.

```bash
# CORRECT
--event_data.name=my-api --event_data.auth=IAM --event_data.req_uri=/test

# WRONG — will fail
--event_data='{"name":"my-api","auth":"IAM","req_uri":"/test"}'
```

## CreateFunctionTrigger Skeleton

```bash
hcloud FunctionGraph CreateFunctionTrigger \
  --function_urn=<urn> \
  --trigger_type_code=<type> \
  --event_type_code=<event> \
  --trigger_status=ACTIVE \
  --event_data.<key>=<value> \
  --cli-region=<region> \
  --project_id=<project_id>
```

## APIG Trigger (HTTP)

```bash
hcloud FunctionGraph CreateFunctionTrigger \
  --function_urn=<urn> \
  --trigger_type_code=APIG \
  --event_type_code=APICreated \
  --trigger_status=ACTIVE \
  --event_data.name=<api-name> \
  --event_data.auth=IAM \
  --event_data.req_uri=/path \
  --event_data.match_mode=SWA \
  --event_data.type=1 \
  --event_data.request_protocol=HTTPS \
  --event_data.request_method=ANY \
  --event_data.func_info.timeout=5000 \
  --event_data.group_id=<api-group-id> \
  --event_data.env_name=RELEASE \
  --cli-region=<region> \
  --project_id=<project_id>
```

| event_data Field | Example | Description |
|------------------|---------|-------------|
| `name` | `my-api` | API name (required) |
| `auth` | `IAM` / `NONE` / `APP` | Auth type (required) |
| `req_uri` | `/my-backend` | Request path (required) |
| `match_mode` | `SWA` / `NORMAL` | Match mode (required) |
| `type` | `1` / `2` | 1=public, 2=private (required) |
| `request_protocol` | `HTTPS` / `HTTP` / `BOTH` | Protocol (required) |
| `request_method` | `GET` / `POST` / `ANY` | HTTP method (required) |
| `func_info.timeout` | `5000` | Backend timeout ms (required) |
| `group_id` | `<api-group-id>` | API group ID (required) |
| `env_name` | `RELEASE` | Environment name (required) |

APIG group/env prerequisites: use `huawei-apig` skill. Or use TIMER trigger for simpler testing.

## TIMER Trigger (Cron)

```bash
hcloud FunctionGraph CreateFunctionTrigger \
  --function_urn=<urn> \
  --trigger_type_code=TIMER \
  --event_type_code=MessageCreated \
  --trigger_status=ACTIVE \
  --event_data.name=<trigger-name> \
  --event_data.schedule_type=Rate \
  --event_data.schedule="1m" \
  --cli-region=<region> \
  --project_id=<project_id>
```

| event_data Field | Example | Description |
|------------------|---------|-------------|
| `name` | `my-timer` | Trigger name (required) |
| `schedule_type` | `Rate` or `Cron` | Schedule type (required) |
| `schedule` | `1m` or `0 */1 * * *` | Rate/Cron expression (required) |

## List / Delete Triggers

```bash
hcloud FunctionGraph ListFunctionTriggers \
  --function_urn=<urn> --cli-region=<r> --project_id=<p>

hcloud FunctionGraph DeleteFunctionTrigger \
  --function_urn=<urn> --trigger_type_code=<type> --trigger_id=<id> \
  --cli-region=<r> --project_id=<p>
```
