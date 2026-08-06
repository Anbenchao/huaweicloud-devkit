import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pluginRoot = join(root, 'plugins', 'huaweicloud-core');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assertExists(path) {
  assert.ok(existsSync(path), `Missing required file: ${path}`);
}

assertExists(join(root, '.agents', 'plugins', 'marketplace.json'));
assertExists(join(pluginRoot, '.codex-plugin', 'plugin.json'));
assertExists(join(pluginRoot, '.mcp.json'));
assertExists(join(pluginRoot, 'hooks', 'hooks.json'));
assertExists(join(pluginRoot, 'hooks', 'huaweicloud-safety.py'));
assertExists(join(pluginRoot, 'safety', 'policy.json'));
assertExists(join(root, 'integrations', 'opencode', 'opencode.json'));

const manifest = readJson(join(pluginRoot, '.codex-plugin', 'plugin.json'));
assert.equal(manifest.name, 'huaweicloud-core');
assert.equal(manifest.skills, './skills/');
assert.equal(manifest.mcpServers, './.mcp.json');
assert.ok(!Object.hasOwn(manifest, 'hooks'), 'Codex manifest should not include hooks until supported by validator');

const pkg = readJson(join(root, 'package.json'));
const pluginManifests = [
  join(pluginRoot, '.codex-plugin', 'plugin.json'),
  join(pluginRoot, '.claude-plugin', 'plugin.json'),
  join(pluginRoot, '.cursor-plugin', 'plugin.json'),
];
for (const path of pluginManifests) {
  const manifest = readJson(path);
  assert.equal(
    pkg.version,
    manifest.version,
    `package.json version must match ${path}`,
  );
}

const skills = readdirSync(join(pluginRoot, 'skills')).filter((name) =>
  existsSync(join(pluginRoot, 'skills', name, 'SKILL.md')),
);
assert.ok(skills.length >= 5, 'Expected compact meta-skills');

for (const name of skills) {
  const skill = readFileSync(join(pluginRoot, 'skills', name, 'SKILL.md'), 'utf8');
  assert.match(skill, /^---\r?\nname: [a-z0-9-]+/);
  assert.match(skill, /\ndescription: /);
  assert.doesNotMatch(skill, /TODO|\[TODO/i);
}

console.log(`Validated HuaweiCloud Devkit with ${skills.length} skills.`);
