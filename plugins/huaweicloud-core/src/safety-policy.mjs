import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const policyPath = join(__dirname, '..', 'safety', 'policy.json');

export function loadPolicy() {
  return JSON.parse(readFileSync(policyPath, 'utf8'));
}

const DEFAULT_POLICY = loadPolicy();

function regexFrom(pattern) {
  return new RegExp(pattern, 'i');
}

function isSecretKeyName(key, policy = DEFAULT_POLICY) {
  const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (
    /access.*key|secret.*key|security.*token|xauth.*token|authorization|password|passwd|adminpass|credential|private.*key/.test(normalized)
  ) {
    return true;
  }
  return policy.secretKeyNamePatterns.some((pattern) => regexFrom(`^(${pattern})$`).test(key));
}

function redactString(text) {
  return String(text)
    .replace(/((?:access[_-]?key|secret[_-]?key|security[_-]?token|x[_-]?auth[_-]?token|authorization|password|passwd|adminPass|credential)\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1<redacted>')
    .replace(/(AK|SK)\s*[:=]\s*("[^"]*"|'[^']*'|[^\s,;]+)/g, '$1=<redacted>');
}

export function redactSecrets(value, policy = DEFAULT_POLICY) {
  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item, policy));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        isSecretKeyName(key, policy) ? '<redacted>' : redactSecrets(val, policy),
      ]),
    );
  }
  if (typeof value === 'string') {
    return redactString(value);
  }
  return value;
}

function stripExecutable(args) {
  if (!args.length) return [];
  const first = String(args[0]).toLowerCase();
  if (first === 'hcloud' || first.endsWith('/hcloud') || first.endsWith('\\hcloud') || first === 'hcloud.exe') {
    return args.slice(1);
  }
  return args;
}

function commandOperation(args) {
  const stripped = stripExecutable(args).map(String).filter(Boolean);
  if (stripped[0]?.toLowerCase() === 'configure') {
    return { service: 'configure', operation: stripped[1] || '', args: stripped };
  }
  const nonFlags = stripped.filter((arg) => !arg.startsWith('-'));
  return {
    service: nonFlags[0] || '',
    operation: nonFlags[1] || nonFlags[0] || '',
    args: stripped,
  };
}

function matchesAny(value, patterns) {
  return patterns.some((pattern) => regexFrom(pattern).test(value));
}

function hasWritePrefix(operation, policy) {
  const normalized = String(operation);
  return policy.writeOperationPrefixes.some((prefix) =>
    new RegExp(`(^|[A-Za-z0-9])${prefix}`, 'i').test(normalized),
  );
}

function hasReadPrefix(operation, policy) {
  return policy.readOperationPrefixes.some((prefix) =>
    new RegExp(`^${prefix}`, 'i').test(operation),
  );
}

function isLocalMetadataCommand(args) {
  return args.some((arg) => /^(--help|-h|help|version|--version)$/i.test(String(arg)));
}

export function classifyHcloudArgs(args, options = {}) {
  const policy = options.policy || DEFAULT_POLICY;
  const { service, operation, args: normalizedArgs } = commandOperation(args);
  const joined = normalizedArgs.join(' ');

  if (!normalizedArgs.length) {
    return {
      decision: 'deny',
      risk: 'invalid',
      reason: 'Empty hcloud command arguments are not executable.',
    };
  }

  if (isLocalMetadataCommand(normalizedArgs)) {
    return {
      decision: 'allow',
      risk: 'local_metadata',
      reason: 'KooCLI local help and version commands are read-only and do not call Huawei Cloud resource APIs.',
      service,
      operation,
      args: normalizedArgs,
    };
  }

  if (service.toLowerCase() === 'configure') {
    const subcommand = operation.toLowerCase();
    if (
      policy.blockedConfigureSubcommands.map((cmd) => cmd.toLowerCase()).includes(subcommand)
      && options.allowCredentialRead !== true
    ) {
      return {
        decision: 'deny',
        risk: 'credential',
        reason: 'Direct hcloud configure inspection may expose profile credentials. Use the redacted toolkit tools instead.',
      };
    }
  }

  if (policy.blockedSecretOperations.some((op) => op.toLowerCase() === operation.toLowerCase())) {
    return {
      decision: 'deny',
      risk: 'secret',
      reason: 'Direct secret value reads are blocked so plaintext secrets do not enter the agent context.',
    };
  }

  if (/secret[_-]?string|secret[_-]?binary|showsecretversion|getsecretvalue/i.test(joined)) {
    return {
      decision: 'deny',
      risk: 'secret',
      reason: 'The command appears to retrieve a secret value. Use a runtime secret reference pattern instead.',
    };
  }

  const readOnly = hasReadPrefix(operation, policy);
  if (!readOnly && hasWritePrefix(operation, policy) && !options.allowWrites) {
    return {
      decision: 'deny',
      risk: 'write',
      reason: 'Huawei Cloud write operation blocked until the agent presents a plan and receives explicit user approval.',
    };
  }

  return {
    decision: 'allow',
    risk: readOnly ? 'read_only' : 'unknown_read',
    reason: readOnly
      ? 'Command appears to be a read-only Huawei Cloud operation.'
      : 'Command does not match a known write or secret operation; treat output as untrusted and redact it.',
    service,
    operation,
    args: normalizedArgs,
  };
}

function splitSimpleCommand(command) {
  return String(command)
    .match(/"[^"]*"|'[^']*'|\S+/g)
    ?.map((part) => part.replace(/^['"]|['"]$/g, '')) || [];
}

export function classifyTextCommand(command, options = {}) {
  const policy = options.policy || DEFAULT_POLICY;
  const text = String(command || '');

  if (matchesAny(text, policy.credentialFilePatterns)) {
    return {
      decision: 'deny',
      risk: 'credential',
      reason: 'Reading Huawei Cloud credential or profile files is blocked. Use redacted profile inspection tools instead.',
    };
  }

  if (/(^|\s)(env|printenv|Get-ChildItem\s+Env:|gci\s+Env:|dir\s+Env:)/i.test(text) && /HUAWEICLOUD|HWC_|HCLOUD|OS_/i.test(text)) {
    return {
      decision: 'deny',
      risk: 'credential',
      reason: 'Dumping cloud credential environment variables is blocked.',
    };
  }

  if (/(^|\s)hcloud(\.exe)?\s+/i.test(text)) {
    return classifyHcloudArgs(splitSimpleCommand(text), options);
  }

  if (/ShowSecretVersion|GetSecretValue|secret_string|secret_binary/i.test(text)) {
    return {
      decision: 'deny',
      risk: 'secret',
      reason: 'Direct secret value retrieval patterns are blocked.',
    };
  }

  return {
    decision: 'allow',
    risk: 'not_huaweicloud',
    reason: 'No Huawei Cloud safety rule matched.',
  };
}

export function assertAllowed(result) {
  if (result.decision === 'deny') {
    const error = new Error(result.reason);
    error.policy = result;
    throw error;
  }
  return result;
}
