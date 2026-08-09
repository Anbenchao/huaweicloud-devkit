import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, existsSync as fsExists, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  runVersionCheck,
  TOOL_DEFINITIONS,
} from '../plugins/huaweicloud-core/src/tools.mjs';

test('runVersionCheck uses hcloud version instead of --version', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'huaweicloud-toolkit-version-'));
  const script = join(dir, 'fake-hcloud.mjs');
  writeFileSync(
    script,
    'console.log(JSON.stringify({ version: "7.0.0", args: process.argv.slice(2) }));',
    'utf8',
  );

  const result = await runVersionCheck({
    executable: process.execPath,
    executableArgs: [script],
  });

  assert.equal(result.installed, true);
  assert.match(result.output, /"version": "7.0.0"/);
  assert.doesNotMatch(result.output, /--version/);
});

test('runVersionCheck returns installed:false and errorCode on ENOENT', async () => {
  const result = await runVersionCheck({
    executable: 'nonexistent-hcloud-xyz',
    maxRetries: 0,
  });
  assert.equal(result.installed, false);
  assert.equal(result.errorCode, 'HCLOUD_NOT_FOUND');
  assert.match(result.nextStep, /HCLOUD_BIN/);
});

test('TOOL_DEFINITIONS includes all 13 required tools', () => {
  const names = TOOL_DEFINITIONS.map((t) => t.name);
  const required = [
    'huaweicloud_check_cli',
    'huaweicloud_plan_cli_command',
    'huaweicloud_run_readonly_command',
    'huaweicloud_list_operations',
    'huaweicloud_run_approved_command',
    'huaweicloud_show_profile_redacted',
    'huaweicloud_service_catalog',
    'huaweicloud_explain_error',
    'huaweicloud_search_docs',
    'huaweicloud_retrieve_skill',
    'huaweicloud_list_regions',
    'huaweicloud_get_regional_availability',
    'huaweicloud_search_marketplace',
    'huaweicloud_setup_obs_config',
  ];
  for (const name of required) {
    assert.ok(names.includes(name), `Missing tool: ${name}`);
  }
  assert.ok(names.length >= 12);
  assert.ok(names.includes('huaweicloud_search_marketplace'), 'Should have marketplace search tool');
});

test('TOOL_DEFINITIONS expose cwd parameter on run tools', () => {
  const readonlyTool = TOOL_DEFINITIONS.find((t) => t.name === 'huaweicloud_run_readonly_command');
  assert.ok(Object.hasOwn(readonlyTool.inputSchema.properties, 'cwd'),
    'run_readonly_command should have cwd param');

  const approvedTool = TOOL_DEFINITIONS.find((t) => t.name === 'huaweicloud_run_approved_command');
  assert.ok(Object.hasOwn(approvedTool.inputSchema.properties, 'cwd'),
    'run_approved_command should have cwd param');
});
