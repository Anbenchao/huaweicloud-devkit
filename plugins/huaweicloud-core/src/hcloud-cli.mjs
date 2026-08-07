import { spawn } from 'node:child_process';
import { classifyHcloudArgs, redactSecrets, assertAllowed } from './safety-policy.mjs';

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_FORCE_KILL_AFTER_MS = 2_000;
const DEFAULT_MAX_RETRIES = 1;

export function planHcloudCommand(args, options = {}) {
  const normalizedArgs = Array.isArray(args) ? args.map(String) : [];
  const classification = classifyHcloudArgs(normalizedArgs, options);
  const command = ['hcloud', ...normalizedArgs].map(quoteShellArg).join(' ');
  const warnings = planningWarnings(normalizedArgs);
  return {
    executable: 'hcloud',
    args: redactSecrets(normalizedArgs),
    command: redactOutput(command),
    executableBlock: redactOutput(command),
    warnings,
    classification,
    safeToRun: classification.decision === 'allow',
  };
}

export async function runHcloud(args, options = {}) {
  const normalizedArgs = Array.isArray(args) ? args.map(String) : [];
  const plan = {
    ...planHcloudCommand(normalizedArgs, options),
    rawArgs: normalizedArgs,
  };
  assertAllowed(plan.classification);

  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const result = await runHcloudOnce(plan, options);
    if (result.ok || attempt >= maxRetries || !isRetryableNetworkError(result)) {
      return {
        ...result,
        retries: attempt,
        attempts: attempt + 1,
      };
    }
    await wait((options.retryBaseDelayMs ?? 500) * (2 ** attempt));
  }
  throw new Error('Unreachable retry state.');
}

function runHcloudOnce(plan, options) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const forceKillAfterMs = options.forceKillAfterMs ?? DEFAULT_FORCE_KILL_AFTER_MS;
  const executable = options.executable || options.env?.HCLOUD_BIN || process.env.HCLOUD_BIN || 'hcloud';
  const executableArgs = Array.isArray(options.executableArgs) ? options.executableArgs.map(String) : [];
  const cwd = options.cwd || undefined;

  return new Promise((resolve) => {
    const child = spawn(executable, [...executableArgs, ...plan.rawArgs], {
      shell: false,
      windowsHide: true,
      cwd,
      env: {
        ...process.env,
        ...options.env,
      },
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;
    let forceTimer;
    let settleTimer;

    function finish(result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(forceTimer);
      clearTimeout(settleTimer);
      resolve(result);
    }

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      forceTimer = setTimeout(() => child.kill('SIGKILL'), forceKillAfterMs);
      settleTimer = setTimeout(() => {
        finish({
          ok: false,
          code: 'TIMEOUT',
          error: `hcloud command timed out after ${timeoutMs} ms.`,
          stdout: redactOutput(stdout),
          stderr: redactOutput(stderr),
          plan,
        });
      }, forceKillAfterMs + 500);
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', (error) => {
      finish({
        ok: false,
        code: 'SPAWN_ERROR',
        error: error.message,
        plan,
      });
    });
    child.on('close', (code, signal) => {
      if (timedOut) {
        finish({
          ok: false,
          code: 'TIMEOUT',
          error: `hcloud command timed out after ${timeoutMs} ms.`,
          exitCode: code,
          signal,
          stdout: redactOutput(stdout),
          stderr: redactOutput(stderr),
          plan,
        });
        return;
      }
      const apiError = extractApiError(stdout);
      if (apiError) {
        finish({
          ok: false,
          exitCode: code,
          signal,
          errorCode: apiError.errorCode,
          errorMessage: apiError.errorMessage,
          stdout: redactOutput(stdout),
          stderr: redactOutput(stderr),
          plan,
        });
        return;
      }
      finish({
        ok: code === 0,
        exitCode: code,
        signal,
        stdout: redactOutput(stdout),
        stderr: redactOutput(stderr),
        plan,
      });
    });
  });
}

function isRetryableNetworkError(result) {
  if (result.code === 'TIMEOUT') return false;
  const text = `${result.error || ''}\n${result.stdout || ''}\n${result.stderr || ''}`;
  return /\[NETWORK_ERROR\]|connection timed out|ECONNRESET|ETIMEDOUT|temporary failure|TLS handshake timeout/i.test(text);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function quoteShellArg(value) {
  const text = String(value);
  if (!text) return '""';
  if (/^[A-Za-z0-9_./:=@-]+$/.test(text)) return text;
  return `"${text.replace(/(["\\])/g, '\\$1')}"`;
}

function planningWarnings(args) {
  const joined = args.join(' ');
  const warnings = [];
  if (/adminPass|password|passwd|secret|token/i.test(joined)) {
    warnings.push(
      'This command appears to contain a password or secret field. Do not leave plaintext secrets in shell history; prefer local-only input or a runtime injection pattern.',
    );
  }
  return warnings;
}

function extractApiError(stdout) {
  const text = String(stdout || '');
  try {
    const parsed = JSON.parse(text);
    if (parsed.error_code || parsed.errorCode) {
      return {
        errorCode: parsed.error_code || parsed.errorCode || 'UNKNOWN',
        errorMessage: parsed.error_msg || parsed.errorMsg || parsed.message || '',
      };
    }
    if (parsed.error && typeof parsed.error === 'object') {
      return {
        errorCode: parsed.error.code || parsed.error.error_code || 'UNKNOWN',
        errorMessage: parsed.error.message || parsed.error.error_msg || '',
      };
    }
  } catch {}
  const ecMatch = text.match(/"error_code"\s*:\s*"([^"]+)"/);
  const emMatch = text.match(/"error_msg"\s*:\s*"([^"]+)"/);
  if (ecMatch) {
    return { errorCode: ecMatch[1], errorMessage: emMatch ? emMatch[1] : '' };
  }
  return null;
}

export function redactOutput(output) {
  const text = String(output || '');
  try {
    return JSON.stringify(redactSecrets(JSON.parse(text)), null, 2);
  } catch {
    return redactSecrets(text);
  }
}
