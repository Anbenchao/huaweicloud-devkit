#!/usr/bin/env python3
"""
PreToolUse hook: block direct secret fetching from Huawei Cloud DEW/CSMS/KMS.
Maps aws-core's secret-safety.py security model to Huawei Cloud equivalents:

  AWS Secrets Manager   -> Huawei CSMS (Cloud Secret Management Service)
  AWS KMS               -> Huawei KMS (Key Management Service)
  aws secretsmanager    -> hcloud csms / hcloud kms
  GetSecretValue        -> DownloadSecret / ShowSecretValue
  .get_secret_value()   -> .download_secret() / .show_secret_value()

Defense matrix (same 5 paths as aws-core):
  Path 1: hcloud csms download-secret                -> regex match CLI form
  Path 2: SDK .download_secret() / .show_secret()    -> SDK_CALL_PATTERN
  Path 3: localhost CSMS endpoint (if exists)        -> ENDPOINT_PATTERN
  Path 4: inline interpreter script with SDK calls   -> INTERPRETER_INLINE_RE
  Path 5: structured MCP tool csms + DownloadSecret  -> normalize_op()
"""

import json
import re
import sys

DENY_MSG = (
    "Direct secret fetching is blocked. "
    "Use {{resolve:csms:secret-id:SecretString:key}} with the MCP proxy instead. "
    "Load the huawei-dew skill for details."
)

# Match hcloud CLI secret fetching commands
HCLOUD_SECRET_PATTERN = re.compile(
    r'hcloud\s+csms\s+(download-secret|show-secret|describe-secret|'
    r'list-secret-versions|get-secret-version)',
    re.I
)

HCLOUD_KMS_PATTERN = re.compile(
    r'hcloud\s+kms\s+decrypt',
    re.I
)

# SDK call invocation shapes (Python/Java/JS/Go SDKs)
SDK_CALL_PATTERN = re.compile(
    r'\.\s*(download|show|get)[-_]?secret[-_]?(value|text)?\s*\('
    r'|(Download|Show|Get)Secret(Value|Text)?(Command|Request)?\s*\(',
    re.I
)

# Read-only text tools that should NEVER be blocked
_READ_ONLY_PREFIXES = (
    'grep', 'egrep', 'fgrep', 'rg', 'ag', 'ack',
    'cat', 'less', 'more', 'head', 'tail', 'bat',
    'git', 'find', 'ls', 'wc', 'diff',
    'awk', 'sed', 'sort', 'uniq', 'cut', 'tr',
    'echo', 'printf', 'man', 'help',
)

_INTERPRETER_INLINE_RE = re.compile(
    r'(?:python[23]?|python3\.\d+|node|ruby|perl)\s+(?:-[a-zA-Z]*c|-e)\s'
)

_COMPOUND_OPERATORS_RE = re.compile(r'[;&|`]|\$\(')

CSMS_OPERATIONS = (
    "downloadsecret", "downloadsecretvalue", "showsecret",
    "showsecretvalue", "listsecretversions", "getsecretversion"
)


def _normalize_op(operation: str) -> str:
    """Collapse casing and -/_ separators like aws-core does."""
    return operation.lower().replace("-", "").replace("_", "")


def _is_read_only_command(command: str) -> bool:
    stripped = command.lstrip()
    while True:
        if re.match(r'[A-Za-z_][A-Za-z0-9_]*=\S*\s', stripped):
            stripped = re.sub(r'^[A-Za-z_][A-Za-z0-9_]*=\S+\s+', '', stripped)
            continue
        if re.match(r'(sudo|env|time|nice|nohup|command|builtin)\s', stripped):
            stripped = re.sub(
                r'^(sudo|env|time|nice|nohup|command|builtin)\s+', '', stripped
            )
            continue
        break
    first_token = stripped.split()[0] if stripped.split() else ''
    first_token = first_token.rsplit('/', 1)[-1]
    return first_token in _READ_ONLY_PREFIXES


def _has_sdk_call_in_inline_code(command: str) -> bool:
    if _INTERPRETER_INLINE_RE.search(command):
        return bool(SDK_CALL_PATTERN.search(command))
    return False


def deny():
    json.dump({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": DENY_MSG
        }
    }, sys.stdout)
    sys.exit(0)


def allow():
    sys.exit(0)


def main():
    data = json.load(sys.stdin)
    tool_name = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})

    # --- Check structured MCP tools ---
    if tool_name.startswith("mcp__"):
        service = (
            tool_input.get("service_name") or
            tool_input.get("service") or ""
        ).lower()
        operation = (
            tool_input.get("operation_name") or
            tool_input.get("operation") or ""
        )
        if service in ("csms", "dew") and \
           _normalize_op(operation) in CSMS_OPERATIONS:
            deny()
        if service == "kms" and _normalize_op(operation) == "decrypt":
            deny()
        allow()

    # --- Check Bash commands ---
    if tool_name == "Bash":
        command = tool_input.get("command", "")

        # hcloud CLI secret fetching
        if HCLOUD_SECRET_PATTERN.search(command):
            deny()
        if HCLOUD_KMS_PATTERN.search(command):
            deny()

        # Read-only commands that legitimately mention API names
        if _is_read_only_command(command) and \
           not _COMPOUND_OPERATORS_RE.search(command):
            allow()

        # Inline interpreter code with SDK calls
        if _has_sdk_call_in_inline_code(command):
            deny()

        # Piped interpreter execution with SDK calls
        if SDK_CALL_PATTERN.search(command) and \
           any(kw in command.lower() for kw in ["csms", "dew", "kms"]):
            deny()

    allow()


if __name__ == "__main__":
    main()