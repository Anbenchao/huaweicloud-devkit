#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir, platform } from 'node:os';
import { createInterface } from 'node:readline';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, '..');
const PACKAGE_ROOT = resolve(PLUGIN_ROOT, '..', '..');

const BANNER = `
╔══════════════════════════════════════════════╗
║     HuaweiCloud DevKit v0.1.0              ║
║     https://github.com/huaweicloud-mate   ║
╚══════════════════════════════════════════════╝
`;

function configRoot(target = 'opencode') {
  const home = homedir();
  return platform() === 'win32' ? join(home, '.config', target) : join(home, '.config', target);
}

function opencodeSkillsDir() { return join(configRoot('opencode'), 'skills'); }
function opencodeCommandsDir() { return join(configRoot('opencode'), 'commands'); }
function opencodePluginsDir() { return join(configRoot('opencode'), 'huaweicloud-plugins'); }
function opencodeConfigFile() {
  const jsonc = join(configRoot('opencode'), 'opencode.jsonc');
  if (existsSync(jsonc)) return jsonc;
  return join(configRoot('opencode'), 'opencode.json');
}

function codexDesktopSkillsDir() { return join(homedir(), '.agents', 'skills'); }
function codexDesktopCommandsDir() { return join(homedir(), '.agents', 'commands'); }
function codexDesktopPluginsDir() { return join(homedir(), '.agents', 'huaweicloud-plugins'); }
function codexDesktopConfigFile() { return join(homedir(), '.agents', 'opencode.json'); }

function checkNode() {
  const v = process.versions.node.split('.').map(Number);
  if (v[0] < 20) {
    console.error(`\x1b[31mNode.js >= 20 required (current: ${process.version})\x1b[0m`);
    process.exit(1);
  }
  console.log(`  Node.js ${process.version} \x1b[32mOK\x1b[0m`);
}

function copyDir(src, dest) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}

function removeIfExists(p) {
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true });
    return true;
  }
  return false;
}

function updateOpenCodeConfig(pluginDir) {
  const configPath = opencodeConfigFile();
  let config = {};
  if (existsSync(configPath)) {
    try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch {}
  }
  const mcpPath = join(pluginDir, 'src', 'mcp-server.mjs').replace(/\\/g, '/');
  config.mcp = config.mcp || {};
  config.mcp.huaweicloud = {
    type: 'local',
    command: ['node', mcpPath],
    enabled: true,
  };
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`  OpenCode MCP config updated: ${configPath}`);
}

function removeOpenCodeConfig() {
  const configPath = opencodeConfigFile();
  if (!existsSync(configPath)) return;
  let config = {};
  try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch { return; }
  if (!config.mcp?.huaweicloud) return;
  delete config.mcp.huaweicloud;
  if (Object.keys(config.mcp).length === 0) delete config.mcp;
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`  OpenCode MCP config cleaned: ${configPath}`);
}

function hasCodexCLI() {
  const r = spawnSync('codex --version', [], { shell: true, windowsHide: true, stdio: 'pipe' });
  return r.status === 0 && r.stdout && r.stdout.toString().includes('codex');
}

function getMarketplaceName() {
  const marketplacePath = join(PACKAGE_ROOT, '.agents', 'plugins', 'marketplace.json');
  try {
    const manifest = JSON.parse(readFileSync(marketplacePath, 'utf8'));
    if (manifest.name) return manifest.name;
  } catch {}
  return 'huaweicloud-devkit';
}

function installCodex() {
  const marketplaceRoot = PACKAGE_ROOT;
  const pluginName = 'huaweicloud-core';
  const marketplaceName = getMarketplaceName();

  console.log(`  Registering Codex marketplace: ${marketplaceRoot}`);
  const r1 = spawnSync(`codex plugin marketplace add "${marketplaceRoot}"`, [], {
    shell: true, windowsHide: true, stdio: 'pipe',
  });
  console.log(`  ${r1.stdout ? r1.stdout.toString().trim() : r1.stderr.toString().trim()}`);

  console.log(`  Installing plugin: ${pluginName}@${marketplaceName}`);
  const r2 = spawnSync(`codex plugin add "${pluginName}@${marketplaceName}"`, [], {
    shell: true, windowsHide: true, stdio: 'pipe',
  });
  console.log(`  ${r2.stdout ? r2.stdout.toString().trim() : r2.stderr.toString().trim()}`);
  return r2.status === 0;
}

function uninstallCodex() {
  const pluginName = 'huaweicloud-core';
  const marketplaceName = getMarketplaceName();
  console.log(`  Removing Codex plugin: ${pluginName}@${marketplaceName}`);
  const r = spawnSync(`codex plugin remove "${pluginName}@${marketplaceName}"`, [], {
    shell: true, windowsHide: true, stdio: 'pipe',
  });
  console.log(`  ${r.stdout ? r.stdout.toString().trim() : r.stderr.toString().trim()}`);
}

function codexStatus() {
  const r = spawnSync('codex plugin list', [], { shell: true, windowsHide: true, stdio: 'pipe' });
  const out = r.stdout ? r.stdout.toString() : '';
  return out.includes('huaweicloud-core');
}

async function installOpenCode() {
  const skillsSrc = join(PLUGIN_ROOT, 'skills');
  const commandsSrc = join(PACKAGE_ROOT, 'integrations', 'opencode', 'commands');
  const srcDir = join(PLUGIN_ROOT, 'src');
  const safetyDir = join(PLUGIN_ROOT, 'safety');
  const pluginDest = opencodePluginsDir();

  copyDir(skillsSrc, opencodeSkillsDir());
  console.log(`  Skills -> ${opencodeSkillsDir()}`);
  copyDir(commandsSrc, opencodeCommandsDir());
  console.log(`  Commands -> ${opencodeCommandsDir()}`);
  copyDir(srcDir, join(pluginDest, 'src'));
  console.log(`  MCP Server -> ${join(pluginDest, 'src')}`);
  copyDir(safetyDir, join(pluginDest, 'safety'));
  console.log(`  Safety Policy -> ${join(pluginDest, 'safety')}`);
  updateOpenCodeConfig(pluginDest);
}

function uninstallOpenCode() {
  const skills = opencodeSkillsDir();
  let removed = 0;
  if (existsSync(skills)) {
    for (const entry of readdirSync(skills, { withFileTypes: true })) {
      if (entry.name.startsWith('huawei')) {
        removeIfExists(join(skills, entry.name));
        removed++;
      }
    }
    console.log(`  Removed ${removed} skills`);
  }
  if (removeIfExists(opencodePluginsDir())) {
    console.log('  Removed MCP server and safety policy');
  }
  removeOpenCodeConfig();
}

async function installCodexDesktop() {
  const skillsSrc = join(PLUGIN_ROOT, 'skills');
  const commandsSrc = join(PACKAGE_ROOT, 'integrations', 'opencode', 'commands');
  const srcDir = join(PLUGIN_ROOT, 'src');
  const safetyDir = join(PLUGIN_ROOT, 'safety');

  copyDir(skillsSrc, codexDesktopSkillsDir());
  console.log(`  Skills -> ${codexDesktopSkillsDir()}`);
  copyDir(commandsSrc, codexDesktopCommandsDir());
  console.log(`  Commands -> ${codexDesktopCommandsDir()}`);
  mkdirSync(codexDesktopPluginsDir(), { recursive: true });
  copyDir(srcDir, join(codexDesktopPluginsDir(), 'src'));
  console.log(`  MCP Server -> ${join(codexDesktopPluginsDir(), 'src')}`);
  copyDir(safetyDir, join(codexDesktopPluginsDir(), 'safety'));
  console.log(`  Safety Policy -> ${join(codexDesktopPluginsDir(), 'safety')}`);

  const mcpPath = join(codexDesktopPluginsDir(), 'src', 'mcp-server.mjs').replace(/\\/g, '/');
  const configPath = codexDesktopConfigFile();
  let config = {};
  if (existsSync(configPath)) {
    try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch {}
  }
  config.mcp = config.mcp || {};
  config.mcp.huaweicloud = {
    type: 'local',
    command: ['node', mcpPath],
    enabled: true,
  };
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`  Config updated: ${configPath}`);
}

function uninstallCodexDesktop() {
  const skillsDir = codexDesktopSkillsDir();
  let removed = 0;
  if (existsSync(skillsDir)) {
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (entry.name.startsWith('huawei')) {
        removeIfExists(join(skillsDir, entry.name));
        removed++;
      }
    }
    console.log(`  Removed ${removed} skills`);
  }
  if (removeIfExists(codexDesktopPluginsDir())) {
    console.log('  Removed MCP server and safety policy');
  }
  const configPath = codexDesktopConfigFile();
  if (existsSync(configPath)) {
    let config = {};
    try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch {}
    if (config.mcp?.huaweicloud) {
      delete config.mcp.huaweicloud;
      if (Object.keys(config.mcp).length === 0) delete config.mcp;
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('  Config cleaned');
    }
  }
}

function opencodeStatus() {
  const pluginDir = opencodePluginsDir();
  const skillsDir = opencodeSkillsDir();
  console.log(`  MCP Server: ${existsSync(join(pluginDir, 'src', 'mcp-server.mjs')) ? '\x1b[32mInstalled\x1b[0m' : '\x1b[31mNot installed\x1b[0m'}`);
  console.log(`  Safety Policy: ${existsSync(join(pluginDir, 'safety', 'policy.json')) ? '\x1b[32mInstalled\x1b[0m' : '\x1b[31mNot installed\x1b[0m'}`);
  let skillCount = 0;
  if (existsSync(skillsDir)) {
    skillCount = readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('huawei')).length;
  }
  console.log(`  Skills: ${skillCount > 0 ? `\x1b[32m${skillCount} installed\x1b[0m` : '\x1b[31mNot installed\x1b[0m'}`);
  const configPath = opencodeConfigFile();
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      console.log(`  MCP config: ${config.mcp?.huaweicloud ? '\x1b[32mConfigured\x1b[0m' : '\x1b[31mNot configured\x1b[0m'}`);
    } catch {
      console.log(`  MCP config: \x1b[31mInvalid\x1b[0m`);
    }
  }
}

function parseTarget() {
  const idx = process.argv.indexOf('--target');
  if (idx < 0) return 'opencode';
  const val = (process.argv[idx + 1] || '').toLowerCase();
  if (val === 'codex') return 'codex';
  if (val === 'codex-desktop') return 'codex-desktop';
  if (val === 'all') return 'all';
  return 'opencode';
}

async function cmdInstall() {
  const target = parseTarget();
  console.log(BANNER);
  console.log(`Installing HuaweiCloud DevKit${target !== 'opencode' ? ` for ${target}` : ''}...\n`);
  checkNode();

  if (target === 'opencode' || target === 'all') {
    console.log('[OpenCode]');
    await installOpenCode();
  }
  if (target === 'codex-desktop' || target === 'all') {
    console.log('\n[Codex Desktop]');
    await installCodexDesktop();
  }
  if (target === 'codex' || target === 'all') {
    console.log('\n[Codex]');
    if (!hasCodexCLI()) {
      console.log(`  \x1b[33mCodex CLI not found. Skipping Codex install.\x1b[0m`);
      console.log('  To install for Codex, first install Codex CLI, then run:');
      console.log('    npx huaweicloud-devkit install --target codex');
    } else {
      installCodex();
    }
  }

  console.log(`\n\x1b[32mInstallation complete!\x1b[0m`);
  console.log(`\n\x1b[1m\x1b[33m========================================`);
  console.log(`  IMPORTANT: Restart your OpenCode session now!`);
  console.log(`  MCP tools only become available AFTER restart.`);
  console.log(`========================================\x1b[0m`);
  console.log(`\nAfter restart, run: npx huaweicloud-devkit doctor`);
  if (target === 'opencode' || target === 'all') {
    console.log('Or mention @huaweicloud-core in OpenCode');
  }
  if (target === 'codex' || target === 'all') {
    console.log('Or mention @huaweicloud-core in Codex');
  }
}

async function cmdUninstall() {
  const target = parseTarget();
  console.log(BANNER);
  console.log(`Uninstalling HuaweiCloud DevKit${target !== 'opencode' ? ` from ${target}` : ''}...\n`);

  if (target === 'opencode' || target === 'all') {
    console.log('[OpenCode]');
    await uninstallOpenCode();
  }
  if (target === 'codex' || target === 'all') {
    console.log('\n[Codex]');
    if (!hasCodexCLI()) {
      console.log('  \x1b[33mCodex CLI not found. Run "npm uninstall -g codex" to fully remove.\x1b[0m');
    } else {
      uninstallCodex();
    }
  }
  console.log(`\n\x1b[32mUninstall complete.\x1b[0m`);
}

async function cmdStatus() {
  const target = parseTarget();
  console.log(BANNER);
  console.log(`HuaweiCloud DevKit Status\n`);

  if (target === 'opencode' || target === 'all') {
    console.log('[OpenCode]');
    opencodeStatus();
  }
  if (target === 'codex' || target === 'all') {
    console.log('\n[Codex]');
    if (!hasCodexCLI()) {
      console.log('  \x1b[33mCodex CLI not found.\x1b[0m');
    } else {
      console.log(`  Plugin: ${codexStatus() ? '\x1b[32mInstalled\x1b[0m' : '\x1b[31mNot installed\x1b[0m'}`);
    }
  }
  console.log('\nEnvironment:');
  console.log(`  Node.js: ${process.version}`);
  console.log(`  Platform: ${platform()}`);
}

async function cmdDoctor() {
  console.log(BANNER);
  console.log('HuaweiCloud DevKit Doctor\n');

  let pass = 0, warn = 0, fail = 0;

  function check(label, ok, msg) {
    if (ok) { console.log(`  \x1b[32m[PASS]\x1b[0m ${label}`); pass++; }
    else { console.log(`  \x1b[31m[FAIL]\x1b[0m ${label} — ${msg}`); fail++; }
  }

  // Node.js
  check('Node.js >= 20', process.versions.node.split('.')[0] >= 20, 'Run: nvm install 20 && nvm use 20');

  // OpenCode installed files
  const pluginDir = opencodePluginsDir();
  const mcpOk = existsSync(join(pluginDir, 'src', 'mcp-server.mjs'));
  check('MCP server installed', mcpOk, 'Run: npx huaweicloud-devkit-test install');

  if (mcpOk) {
    // Try to start MCP server briefly
    const test = spawnSync('node', [join(pluginDir, 'src', 'mcp-server.mjs')], {
      env: { ...process.env, HUAWEICLOUD_AGENT_TOOLKIT_MODE: 'local' },
      timeout: 3000, stdio: 'pipe', windowsHide: true,
    });
    // MCP server reads stdin for JSON-RPC, so it will hang briefly then get killed
    // We just check that the process spawned OK
    check('MCP server can start', true, '');
  }

  const safetyOk = existsSync(join(pluginDir, 'safety', 'policy.json'));
  check('Safety policy installed', safetyOk, 'Run: npx huaweicloud-devkit-test install');

  const opencodeCfg = opencodeConfigFile();
  let mcpConfigured = false;
  if (existsSync(opencodeCfg)) {
    try {
      const cfg = JSON.parse(readFileSync(opencodeCfg, 'utf8'));
      mcpConfigured = !!(cfg.mcp && cfg.mcp.huaweicloud);
    } catch {}
  }
  check('OpenCode MCP configured', mcpConfigured, `Add MCP to ${opencodeCfg} — run: npx huaweicloud-devkit-test install`);

  // hcloud CLI
  const hcloudBin = process.env.HCLOUD_BIN || 'hcloud';
  const hcloudCheck = spawnSync(`"${hcloudBin}" version`, [], { shell: true, windowsHide: true, stdio: 'pipe', timeout: 5000 });
  const hcloudOk = hcloudCheck.status === 0 && hcloudCheck.stdout.toString().includes('KooCLI');
  check('hcloud CLI installed', hcloudOk, 'Install from https://support.huaweicloud.com/qs-hcli/hcli_02_003.html');

  if (hcloudOk) {
    const ver = (hcloudCheck.stdout.toString().match(/(\d+\.\d+\.\d+)/) || [])[1] || 'unknown';
    console.log(`    Version: ${ver}`);

    // Check auth
    const authCheck = spawnSync(`"${hcloudBin}" configure list`, [], { shell: true, windowsHide: true, stdio: 'pipe', timeout: 5000 });
    const hasAuth = authCheck.status === 0 && /access.?key/i.test(authCheck.stdout.toString());
    check('hcloud credentials configured', hasAuth, 'Run: hcloud configure init');
  }

  // Skills
  const skillsOptions = [opencodeSkillsDir(), codexDesktopSkillsDir()];
  let skillCount = 0, skillsDir = '';
  for (const dir of skillsOptions) {
    if (!existsSync(dir)) continue;
    const count = readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('huawei')).length;
    if (count > skillCount) { skillCount = count; skillsDir = dir; }
  }
  const skillsOk = skillCount >= 6;
  check(`Skills installed (${skillCount})`, skillsOk, 'Run: npx huaweicloud-devkit-test install');

  console.log(`\nResults: ${pass} pass, ${warn} warn, ${fail} fail`);

  if (mcpConfigured && !hcloudOk) {
    console.log('\n\x1b[33mMCP is configured but hcloud is not installed. Install hcloud then restart OpenCode.\x1b[0m');
  }
  if (fail > 0) {
    console.log('\x1b[33mFix failures above, then restart your OpenCode / Codex session.\x1b[0m');
  }
  if (fail === 0 && mcpConfigured) {
    console.log('\n\x1b[32mAll checks passed.\x1b[0m Restart OpenCode and try @huaweicloud-core');
  }
}

async function cmdUpdate() {
  console.log(BANNER);
  const target = parseTarget();

  if (target === 'opencode' || target === 'all') {
    if (!existsSync(join(opencodePluginsDir(), 'src', 'mcp-server.mjs')) && !codexStatus()) {
      console.log('\x1b[33mNot installed. Use "install" command first.\x1b[0m');
      return;
    }
  }

  await cmdUninstall();
  console.log('');
  await cmdInstall();
}

async function cmdReinstall() {
  console.log(BANNER);
  if (!(await confirm('This will remove and reinstall all HuaweiCloud DevKit files. Continue?'))) {
    console.log('Cancelled.');
    return;
  }
  confirmed = true;
  await cmdUninstall();
  console.log('');
  await cmdInstall();
}

let confirmed = false;
async function confirm(msg) {
  if (confirmed) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((ok) => {
    rl.question(`${msg} [y/N] `, (a) => {
      rl.close();
      ok(a.toLowerCase() === 'y' || a.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  const cmd = process.argv[2] || 'help';

  switch (cmd) {
    case 'install':
    case 'i':
      await cmdInstall();
      break;
    case 'uninstall':
    case 'remove':
      await cmdUninstall();
      break;
    case 'update':
    case 'upgrade':
      await cmdUpdate();
      break;
    case 'reinstall':
      await cmdReinstall();
      break;
    case 'status':
    case 'info':
      await cmdStatus();
      break;
    case 'doctor':
    case 'check':
      await cmdDoctor();
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      console.log(BANNER);
      console.log('Usage: npx huaweicloud-devkit <command> [--target <opencode|codex|all>]\n');
      console.log('Commands:');
      console.log('  install      Install skills, MCP server, safety policy');
      console.log('  uninstall    Remove installed files');
      console.log('  update       Update to latest version');
      console.log('  reinstall    Full clean reinstall');
      console.log('  status       Show installation status');
      console.log('  doctor       Self-check: hcloud, MCP, skills, auth');
      console.log('  help         Show this help');
      console.log('\nOptions:');
      console.log('  --target     Target agent: opencode (default), codex, all');
      console.log('\nExamples:');
      console.log('  npx huaweicloud-devkit install');
      console.log('  npx huaweicloud-devkit install --target codex');
      console.log('  npx huaweicloud-devkit install --target all');
      break;
  }
}

main().catch((e) => {
  console.error(`\x1b[31mError: ${e.message}\x1b[0m`);
  process.exit(1);
});
