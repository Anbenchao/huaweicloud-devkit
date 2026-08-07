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
function opencodeConfigFile() { return join(configRoot('opencode'), 'opencode.json'); }

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
  return 'huaweicloud-agent-toolkit';
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
  if (target === 'opencode' || target === 'all') {
    console.log('OpenCode: restart the session and try @huaweicloud-core');
  }
  if (target === 'codex' || target === 'all') {
    console.log('Codex: start a new session and mention @huaweicloud-core');
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
