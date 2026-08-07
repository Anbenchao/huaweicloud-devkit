# Triggers

**Always run `hcloud FunctionGraph CreateFunctionTrigger --help` first** for exact parameter names and requirements.

## KooCLI event_data Format (CRITICAL)

KooCLI uses **dotted key-value format**, NOT JSON strings:

```bash
# CORRECT
--event_data.name=my-api --event_data.auth=IAM --event_data.path=/test

# WRONG — will fail
--event_data='{"name":"my-api","auth":"IAM","path":"/test"}'
```

## Trigger Types

| Type | `--trigger_type_code` | Notes |
|------|----------------------|-------|
| APIG Dedicated | `DEDICATEDGATEWAY` | Use this, not `APIG` (deprecated). Requires APIG instance. |
| Timer / Cron | `TIMER` | Simplest trigger for testing. No APIG dependency. |
| OBS | `OBS` | Event when objects created/deleted in bucket |
| SMN | `SMN` | Message notification trigger |

## TIMER Trigger (Simple Testing)

The TIMER trigger is the easiest path for verifying a function works — no APIG instance needed:

```bash
hcloud FunctionGraph CreateFunctionTrigger \
  --function_urn=<urn> \
  --trigger_type_code=TIMER \
  --event_type_code=MessageCreated \
  --trigger_status=ACTIVE \
  --event_data.name=<trigger-name> \
  --event_data.schedule_type=Rate \
  --event_data.schedule="1m"
```

## DEDICATEDGATEWAY Trigger (HTTP Access)

`trigger_type_code=APIG` is **deprecated**. Use `DEDICATEDGATEWAY` for KooCLI 7.x. Requires an APIG dedicated instance — discover required params with `--help`:

```bash
hcloud FunctionGraph CreateFunctionTrigger --help
# Look for: trigger_type_code, event_data.instance_id, event_data.env_id, etc.
```

## List / Delete Triggers

```bash
hcloud FunctionGraph ListFunctionTriggers --function_urn=<urn>
hcloud FunctionGraph DeleteFunctionTrigger --function_urn=<urn> --trigger_type_code=<type> --trigger_id=<id>
```
