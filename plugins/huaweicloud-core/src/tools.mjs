import { planHcloudCommand, runHcloud } from './hcloud-cli.mjs';
import { classifyTextCommand, redactSecrets } from './safety-policy.mjs';

export const TOOL_DEFINITIONS = [
  {
    name: 'huaweicloud_check_cli',
    description: 'Check whether Huawei Cloud KooCLI hcloud is installed. Returns redacted output.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'huaweicloud_plan_cli_command',
    description: 'Classify and plan a Huawei Cloud hcloud command without executing it.',
    inputSchema: {
      type: 'object',
      required: ['args'],
      properties: {
        args: {
          type: 'array',
          items: { type: 'string' },
          description: 'hcloud arguments, excluding the hcloud executable.',
        },
        allowWrites: {
          type: 'boolean',
          description: 'Only true after explicit user approval for this exact operation.',
        },
      },
    },
  },
  {
    name: 'huaweicloud_run_readonly_command',
    description: 'Run a read-only hcloud command through the toolkit safety policy and redact output.',
    inputSchema: {
      type: 'object',
      required: ['args'],
      properties: {
        args: {
          type: 'array',
          items: { type: 'string' },
        },
        timeoutMs: {
          type: 'number',
          description: 'Optional timeout in milliseconds. Defaults to 60000.',
        },
        maxRetries: {
          type: 'number',
          description: 'Optional retry count for transient network errors. Defaults to 1.',
        },
      },
    },
  },
  {
    name: 'huaweicloud_list_operations',
    description: 'List KooCLI operations for a Huawei Cloud service by running local/read-only hcloud <Service> --help.',
    inputSchema: {
      type: 'object',
      required: ['service'],
      properties: {
        service: {
          type: 'string',
          description: 'KooCLI service name, such as ECS, VPC, IMS, OBS, RDS, or CDN.',
        },
        timeoutMs: {
          type: 'number',
          description: 'Optional timeout in milliseconds. Defaults to 60000.',
        },
      },
    },
  },
  {
    name: 'huaweicloud_run_approved_command',
    description: 'Run a write-capable hcloud command only after the exact command has been shown and explicitly approved by the user.',
    inputSchema: {
      type: 'object',
      required: ['args', 'approvedCommand', 'approvedByUser'],
      properties: {
        args: {
          type: 'array',
          items: { type: 'string' },
          description: 'hcloud arguments, excluding the hcloud executable.',
        },
        approvedCommand: {
          type: 'string',
          description: 'The exact command string previously shown to the user.',
        },
        approvedByUser: {
          type: 'boolean',
          description: 'Must be true only after the user explicitly approves this exact command.',
        },
        timeoutMs: {
          type: 'number',
          description: 'Optional timeout in milliseconds. Defaults to 60000.',
        },
        maxRetries: {
          type: 'number',
          description: 'Optional retry count for transient network errors. Defaults to 1.',
        },
      },
    },
  },
  {
    name: 'huaweicloud_show_profile_redacted',
    description: 'Inspect a KooCLI profile through hcloud configure show and return only redacted output.',
    inputSchema: {
      type: 'object',
      properties: {
        profile: {
          type: 'string',
          description: 'Optional KooCLI profile name.',
        },
      },
    },
  },
  {
    name: 'huaweicloud_service_catalog',
    description: 'Return the recommended capability sources for Huawei Cloud agent tasks.',
    inputSchema: {
      type: 'object',
      properties: {
        intent: {
          type: 'string',
          description: 'Developer intent to route, such as deploy app, use API, debug error, or inspect resources.',
        },
      },
    },
  },
  {
    name: 'huaweicloud_explain_error',
    description: 'Explain a Huawei Cloud CLI, API, SDK, or agent workflow error and suggest next diagnostic steps.',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string' },
        errorCode: { type: 'string' },
        message: { type: 'string' },
        requestId: { type: 'string' },
      },
    },
  },
];

export async function callTool(name, args = {}) {
  switch (name) {
    case 'huaweicloud_check_cli':
      return runVersionCheck();
    case 'huaweicloud_plan_cli_command':
      return planHcloudCommand(args.args || [], { allowWrites: args.allowWrites === true });
    case 'huaweicloud_run_readonly_command':
      return runHcloud(args.args || [], {
        timeoutMs: args.timeoutMs,
        maxRetries: args.maxRetries,
      });
    case 'huaweicloud_list_operations':
      return listOperations(args.service, { timeoutMs: args.timeoutMs });
    case 'huaweicloud_run_approved_command':
      return runApprovedCommand(args);
    case 'huaweicloud_show_profile_redacted':
      return showProfileRedacted(args.profile);
    case 'huaweicloud_service_catalog':
      return serviceCatalog(args.intent);
    case 'huaweicloud_explain_error':
      return explainError(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function runVersionCheck(options = {}) {
  const result = await runHcloud(['version'], {
    ...options,
    maxRetries: options.maxRetries ?? 0,
  });
  return {
    installed: result.ok,
    output: result.ok ? result.stdout : result.error || result.stderr,
    nextStep: result.ok
      ? 'Use huaweicloud_show_profile_redacted to inspect the active KooCLI profile safely.'
      : 'Install Huawei Cloud KooCLI from https://support.huaweicloud.com/qs-hcli/hcli_02_003.html. If hcloud is not on PATH, set HCLOUD_BIN to the hcloud executable path. Configure credentials outside the agent conversation.',
  };
}

async function showProfileRedacted(profile) {
  const args = ['configure', 'show'];
  if (profile) {
    args.push('--cli-profile', String(profile));
  }
  const result = await runHcloud(args, { allowWrites: false, allowCredentialRead: true }).catch((error) => ({
    ok: false,
    blocked: true,
    reason: error.message,
  }));
  if (result.blocked) {
    return {
      ok: false,
      blockedByPolicy: true,
      reason: result.reason,
      safeAlternative: 'Use huaweicloud_show_profile_redacted so profile output is returned through the redaction pipeline.',
    };
  }
  return {
    ok: result.ok,
    note: 'Profile information was returned through the toolkit redaction pipeline.',
    result: redactSecrets(result),
  };
}

async function listOperations(service, options = {}) {
  const serviceName = String(service || '').trim();
  if (!/^[A-Za-z][A-Za-z0-9-]{1,63}$/.test(serviceName)) {
    throw new Error('service must be a KooCLI service name such as ECS, VPC, IMS, OBS, RDS, or CDN.');
  }
  const result = await runHcloud([serviceName, '--help'], {
    timeoutMs: options.timeoutMs,
    maxRetries: 0,
  });
  return {
    service: serviceName,
    command: `hcloud ${serviceName} --help`,
    selectionRule: 'Use this help text to select the exact KooCLI operation name before planning any service command.',
    examples: {
      listEcsInstances: 'ECS ListServersDetails',
      createEcsInstance: 'ECS CreateServers',
      showImage: 'IMS GlanceShowImage',
    },
    result,
  };
}

async function runApprovedCommand(args = {}) {
  if (args.approvedByUser !== true) {
    throw new Error('approvedByUser must be true after explicit user approval for this exact command.');
  }
  const plan = planHcloudCommand(args.args || [], { allowWrites: true });
  if (String(args.approvedCommand || '') !== plan.command) {
    throw new Error('approvedCommand must exactly match the planned hcloud command.');
  }
  return runHcloud(args.args || [], {
    allowWrites: true,
    timeoutMs: args.timeoutMs,
    maxRetries: args.maxRetries,
  });
}

function serviceCatalog(intent = '') {
  return {
    intent,
    recommendedOrder: [
      'Huawei Cloud Skills for task-specific workflows and examples',
      'KooCLI hcloud for local authenticated operations and quick inspection',
      'Huawei Cloud API documentation for exact request and response contracts',
      'Huawei Cloud SDKs for application code integration',
      'Huawei Cloud MCP when an official or approved server is available',
      'Terraform Provider only when IaC reviewability and repeatability are important',
    ],
    ruleOfThumb: {
      skills: 'Start here when the user describes a scenario or wants a guided workflow.',
      cli: 'Use for local diagnostics, read-only inspection, and commands the user can review.',
      api: 'Use for exact service contract, region endpoint, project_id, pagination, and error codes.',
      sdk: 'Use when writing application code that calls Huawei Cloud services.',
      mcp: 'Prefer approved MCP tools when available because tools can carry structured schemas.',
      terraform: 'Keep low priority in V1; suggest it for reviewed infrastructure changes, not quick diagnosis.',
    },
  };
}

function explainError({ service = 'unknown', errorCode = '', message = '', requestId = '' } = {}) {
  const combined = `${errorCode} ${message}`.toLowerCase();
  const suggestions = [];

  if (/auth|token|credential|ak|sk|401|403|unauthorized|forbidden/i.test(combined)) {
    suggestions.push('Check KooCLI profile, region, project_id, and IAM permissions without printing secrets.');
  }
  if (/region|endpoint|project/i.test(combined)) {
    suggestions.push('Confirm the service endpoint, region, and project_id match the target resource.');
  }
  if (/quota|limit|insufficient/i.test(combined)) {
    suggestions.push('Check quota and resource limits before retrying a create or scale operation.');
  }
  if (/not.?found|404/i.test(combined)) {
    suggestions.push('List resources in the same region/project and verify the resource identifier.');
  }
  if (!suggestions.length) {
    suggestions.push('Collect service name, operation, region, project_id, request_id, and the full redacted error message.');
  }

  return {
    service,
    errorCode,
    requestId,
    suggestions,
  };
}

export function classifyRawCommand(command) {
  return classifyTextCommand(command);
}
