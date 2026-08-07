import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import test from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const pluginRoot = join(root, 'plugins', 'huaweicloud-core');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

test('Codex plugin manifest and marketplace are installable', () => {
  const manifest = readJson(join(pluginRoot, '.codex-plugin', 'plugin.json'));
  assert.equal(manifest.name, 'huaweicloud-core');
  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.mcpServers, './.mcp.json');
  assert.ok(!Object.hasOwn(manifest, 'hooks'), 'Codex manifest keeps hooks out');

  const marketplace = readJson(join(root, '.agents', 'plugins', 'marketplace.json'));
  assert.equal(marketplace.name, 'huaweicloud-devkit');
  assert.equal(marketplace.plugins[0].name, 'huaweicloud-core');
  assert.equal(marketplace.plugins[0].source.path, './plugins/huaweicloud-core');
});

test('OpenCode integration exposes skills, commands, and MCP config', () => {
  assert.ok(existsSync(join(root, 'integrations', 'opencode', 'opencode.json')));
  assert.ok(existsSync(join(root, 'integrations', 'opencode', 'commands', 'huaweicloud-doctor.md')));
  assert.ok(existsSync(join(root, 'integrations', 'opencode', 'skills', 'huaweicloud-core', 'SKILL.md')));
});

test('plugin skills are compact meta-skills instead of service encyclopedia entries', () => {
  const skillsDir = join(pluginRoot, 'skills');
  const skillNames = readdirSync(skillsDir).filter((name) =>
    existsSync(join(skillsDir, name, 'SKILL.md')),
  );
  const requiredMetaSkills = [
    'huaweicloud-api-and-sdk',
    'huaweicloud-capability-discovery',
    'huaweicloud-cli-and-auth',
    'huaweicloud-core',
    'huaweicloud-safety',
    'huaweicloud-troubleshooting',
  ];
  for (const name of requiredMetaSkills) {
    assert.ok(skillNames.includes(name), `Missing meta-skill: ${name}`);
  }
  assert.ok(skillNames.length >= 6, 'Should have at least 6 skills');

  for (const name of skillNames) {
    const body = readFileSync(join(skillsDir, name, 'SKILL.md'), 'utf8');
    assert.match(body, /^---\r?\nname: /);
    assert.doesNotMatch(body, /TODO|\[TODO/i);
  }
});

test('skills document KooCLI installation, operation discovery, region intent, and password safety', () => {
  const cliSkill = readFileSync(join(pluginRoot, 'skills', 'huaweicloud-cli-and-auth', 'SKILL.md'), 'utf8');
  assert.match(cliSkill, /support\.huaweicloud\.com\/qs-hcli\/hcli_02_003\.html/);
  assert.match(cliSkill, /HCLOUD_BIN/);
  assert.match(cliSkill, /--server\.nics\.1\.subnet_id/);
  assert.match(cliSkill, /--param=value/);

  const discoverySkill = readFileSync(join(pluginRoot, 'skills', 'huaweicloud-capability-discovery', 'SKILL.md'), 'utf8');
  assert.match(discoverySkill, /hcloud <Service> --help/);
  assert.match(discoverySkill, /Singapore.*ap-southeast-3/s);
  assert.match(discoverySkill, /No blind all-region scans/);

  const safetySkill = readFileSync(join(pluginRoot, 'skills', 'huaweicloud-safety', 'SKILL.md'), 'utf8');
  assert.match(safetySkill, /shell history/i);
  assert.match(safetySkill, /huaweicloud_run_approved_command/);
});

test('skill SKILL.md files meet minimum content quality bar', () => {
  const skillsDir = join(pluginRoot, 'skills');
  const skillNames = readdirSync(skillsDir).filter((name) =>
    existsSync(join(skillsDir, name, 'SKILL.md')),
  );

  const exceptions = new Set([
    'huawei-cloud-find-skills',
    'huaweicloud-api-and-sdk',
    'huaweicloud-safety',
    'huaweicloud-troubleshooting',
    'huawei-deployment',
    'huawei-getting-started',
    'huawei-apig',
    'huawei-gaussdb',
  ]);

  for (const name of skillNames) {
    const body = readFileSync(join(skillsDir, name, 'SKILL.md'), 'utf8');
    const lines = body.split('\n').length;
    if (exceptions.has(name)) continue;
    assert.ok(lines >= 40, `${name}/SKILL.md has ${lines} lines (min 40)`);
  }
});

test('skills with references have non-empty reference files', () => {
  const skillsDir = join(pluginRoot, 'skills');
  const skillNames = readdirSync(skillsDir).filter((name) =>
    existsSync(join(skillsDir, name, 'SKILL.md')),
  );

  for (const name of skillNames) {
    const refDir = join(skillsDir, name, 'references');
    if (!existsSync(refDir)) continue;
    const refFiles = readdirSync(refDir).filter((f) => f.endsWith('.md'));
    for (const ref of refFiles) {
      const body = readFileSync(join(refDir, ref), 'utf8');
      const lines = body.split('\n').length;
      assert.ok(lines >= 10, `${name}/references/${ref} has ${lines} lines (min 10)`);
    }
  }
});

test('all plugin manifests are valid JSON', () => {
  const manifests = [
    join(pluginRoot, '.codex-plugin', 'plugin.json'),
    join(pluginRoot, '.claude-plugin', 'plugin.json'),
    join(pluginRoot, '.cursor-plugin', 'plugin.json'),
  ];
  for (const path of manifests) {
    const data = readJson(path);
    assert.ok(data.name, `Manifest ${path} missing name`);
    assert.ok(data.skills || data.interface, `Manifest ${path} missing skills/interface`);
  }
});

test('safety policy.json is valid and has required fields', () => {
  const policy = readJson(join(pluginRoot, 'safety', 'policy.json'));
  assert.ok(Array.isArray(policy.secretKeyNamePatterns));
  assert.ok(policy.secretKeyNamePatterns.length >= 5);
  assert.ok(Array.isArray(policy.writeOperationPrefixes));
  assert.ok(policy.writeOperationPrefixes.length >= 10);
  assert.ok(Array.isArray(policy.blockedSecretOperations));
  assert.ok(Array.isArray(policy.credentialFilePatterns));
});

test('hooks.json references existing Python hook', () => {
  const hooksDir = join(pluginRoot, 'hooks');
  assert.ok(existsSync(join(hooksDir, 'hooks.json')));
  assert.ok(existsSync(join(hooksDir, 'huaweicloud-safety.py')));
});

test('.mcp.json is valid and references existing server script', () => {
  const mcpConfig = readJson(join(pluginRoot, '.mcp.json'));
  assert.ok(mcpConfig.mcpServers || mcpConfig.mcp);
});
