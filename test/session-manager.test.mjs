import assert from 'node:assert/strict';
import test from 'node:test';
import { WS_EXEC_INDEX_URL } from '../plugins/huaweicloud-core/src/sandbox/session-manager.mjs';

test('ws-exec dynamic import uses file:// URL (Windows-safe)', async () => {
  assert.ok(
    WS_EXEC_INDEX_URL.startsWith('file://'),
    `expected file:// URL, got: ${WS_EXEC_INDEX_URL}`
  );
  const mod = await import(WS_EXEC_INDEX_URL);
  assert.equal(typeof mod.connectHwlinkTerminalSession, 'function');
  assert.equal(typeof mod.executeHwlinkCommand, 'function');
});
