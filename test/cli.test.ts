import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('runs the CLI through an npm-style executable symlink', { skip: process.platform === 'win32' }, async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'sireg bin '));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const entry = fileURLToPath(new URL('../../dist/cli.js', import.meta.url));
  const executable = path.join(directory, 'sireg');
  await symlink(entry, executable);

  const output = execFileSync(process.execPath, [executable, '--help'], { encoding: 'utf8' });
  assert.match(output, /sireg check --sitemap/);
});
