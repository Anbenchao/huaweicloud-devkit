import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

function baseHome() {
  return process.env.HUAWEICLOUD_HOME || homedir();
}

export function globalCredentialsPath() {
  return join(baseHome(), '.config', 'huaweicloud', 'credentials.json');
}

export function obsConfigPath() {
  return join(baseHome(), '.obsutilconfig');
}

export function readGlobalCredentials() {
  const path = globalCredentialsPath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

export function writeGlobalCredentials(credentials = {}) {
  const path = globalCredentialsPath();
  mkdirSync(dirname(path), { recursive: true });
  const payload = {
    ak: String(credentials.ak || ''),
    sk: String(credentials.sk || ''),
    securityToken: String(credentials.securityToken || ''),
    region: String(credentials.region || ''),
  };
  writeFileSync(path, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
  return path;
}

export function writeObsConfig(credentials = {}) {
  const region = String(credentials.region || '');
  const ak = String(credentials.ak || '');
  const sk = String(credentials.sk || '');
  const securityToken = String(credentials.securityToken || '');
  if (!region || !ak || !sk) {
    throw new Error('region, ak, and sk are required to write OBS config');
  }
  const path = obsConfigPath();
  const endpoint = credentials.endpoint || `https://obs.${region}.myhuaweicloud.com`;
  // Flat key=value format (no [default] section) as written by KooCLI 7.x `hcloud OBS config`.
  const content = `endpoint=${endpoint}\nak=${ak}\nsk=${sk}${securityToken ? `\ntoken=${securityToken}` : ''}\n`;
  writeFileSync(path, content, { encoding: 'utf8', mode: 0o600 });
  return { path, endpoint };
}

export function resolveCredentials(options = {}) {
  let ak = process.env.HW_ACCESS_KEY;
  let sk = process.env.HW_SECRET_KEY;
  let securityToken = process.env.HW_SECURITY_TOKEN;
  let region = process.env.HW_REGION || process.env.HUAWEICLOUD_REGION || '';

  const stored = readGlobalCredentials();
  if (stored) {
    if (!ak && stored.ak) ak = stored.ak;
    if (!sk && stored.sk) sk = stored.sk;
    if (!securityToken && stored.securityToken) securityToken = stored.securityToken;
    if (!region && stored.region) region = stored.region;
  }

  if (!ak || !sk) {
    if (options.allowMissing) return null;
    throw new Error('Huawei Cloud credentials are not configured. Run "npx huaweicloud-devkit auth init" or set HW_ACCESS_KEY/HW_SECRET_KEY.');
  }

  return { ak, sk, securityToken, region };
}
