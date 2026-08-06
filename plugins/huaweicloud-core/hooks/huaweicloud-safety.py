#!/usr/bin/env python3
"""PreToolUse hook for Huawei Cloud agent safety.

Blocks the highest-risk leakage paths before an agent tool runs:
- reading local Huawei Cloud credential files
- dumping cloud credential environment variables
- directly retrieving cloud secret values
- running unapproved write operations through hcloud

The MCP server carries the same policy in Node for platforms that do not support
plugin hooks.
"""

import json
import re
import sys

DENY_PREFIX = "Huawei Cloud safety hook blocked this action: "

CONFIG_FILE_RE = re.compile(r"(\.hcloud|\.huaweicloud|hcloud[/\\](config|credentials)|huaweicloud[/\\](config|credentials))", re.I)
ENV_DUMP_RE = re.compile(r"(env|printenv|Get-ChildItem\s+Env:|gci\s+Env:|dir\s+Env:).*(HUAWEICLOUD|HWC_|HCLOUD|OS_)", re.I)
SECRET_READ_RE = re.compile(r"(ShowSecretVersion|GetSecretValue|secret_string|secret_binary)", re.I)
HCLOUD_RE = re.compile(r"(^|\s)hcloud(\.exe)?\s+", re.I)
WRITE_OPERATION_RE = re.compile(
    r"\b(BatchCreate|BatchDelete|Create|Delete|Update|Modify|Resize|Reboot|Stop|Start|Restart|Authorize|Revoke|Add|Remove|Associate|Disassociate|Attach|Detach|Enable|Disable)\w*",
    re.I,
)
READ_OPERATION_RE = re.compile(r"\b(List|Show|Get|Describe|NovaList|NovaShow)\w*", re.I)


def deny(reason):
    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": DENY_PREFIX + reason,
            }
        },
        sys.stdout,
    )
    sys.exit(0)


def allow():
    sys.exit(0)


def command_text(tool_input):
    if isinstance(tool_input, str):
        return tool_input
    if isinstance(tool_input, dict):
        values = []
        for key in ("command", "cmd", "script", "args", "arguments"):
            value = tool_input.get(key)
            if isinstance(value, list):
                values.append(" ".join(str(item) for item in value))
            elif value is not None:
                values.append(str(value))
        if values:
            return "\n".join(values)
        return json.dumps(tool_input)
    return json.dumps(tool_input)


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        allow()

    tool_name = data.get("tool_name", "")
    text = command_text(data.get("tool_input", {}))

    if CONFIG_FILE_RE.search(text):
        deny("reading Huawei Cloud credential/profile files can expose AK/SK or tokens. Use redacted toolkit tools.")
    if ENV_DUMP_RE.search(text):
        deny("dumping cloud credential environment variables is not allowed.")
    if SECRET_READ_RE.search(text):
        deny("direct secret value retrieval would put plaintext secrets into the agent context.")
    if tool_name == "Bash" and HCLOUD_RE.search(text) and WRITE_OPERATION_RE.search(text) and not READ_OPERATION_RE.search(text):
        deny("unapproved Huawei Cloud write operations must be planned first and explicitly approved by the user.")

    allow()


if __name__ == "__main__":
    main()
