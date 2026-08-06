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
  assert.ok(!Object.hasOwn(manifest, 'hooks'), 'Codex manifest keeps hooks out for schema compatibility');

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
    assert.ok(skillNames.includes(name), 'Missing meta-skill: ' + name);
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
