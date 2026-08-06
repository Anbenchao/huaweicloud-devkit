import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { runVersionCheck } from '../plugins/huaweicloud-core/src/tools.mjs';

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
  assert.match(result.output, /"version"/);
  assert.doesNotMatch(result.output, /--version/);
});
