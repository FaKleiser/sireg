#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import {
  assertCleanWorktree,
  assertReleaseType,
  bumpVersion,
  finalizeChangelog,
  todayIsoDate,
} from './release-utils.mjs';

const releaseType = process.argv[2];

try {
  assertReleaseType(releaseType);
  assertCleanWorktree(capture('git', ['status', '--porcelain']));

  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const nextVersion = bumpVersion(packageJson.version, releaseType);
  const tagName = `v${nextVersion}`;

  const changelog = readFileSync('CHANGELOG.md', 'utf8');
  const finalizedChangelog = finalizeChangelog(changelog, nextVersion, todayIsoDate());

  run('npm', ['version', releaseType, '--no-git-tag-version']);
  writeFileSync('CHANGELOG.md', finalizedChangelog, 'utf8');
  run('npm', ['test']);
  run('npm', ['pack', '--dry-run', '--ignore-scripts']);

  run('git', ['add', 'CHANGELOG.md', 'package.json', 'package-lock.json']);
  run('git', ['commit', '-m', `🚀 Release ${tagName}`]);
  run('git', ['tag', '-a', tagName, '-m', `Release ${tagName}`]);

  const branch = capture('git', ['rev-parse', '--abbrev-ref', 'HEAD']).trim();
  if (!branch || branch === 'HEAD') {
    throw new Error('Cannot push release from a detached HEAD.');
  }

  run('git', ['push', 'origin', branch]);
  run('git', ['push', 'origin', tagName]);
  console.log(`Prepared and pushed ${tagName}. GitHub Actions will create the release and publish to npm.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`release preparation failed: ${message}`);
  process.exitCode = 1;
}

function run(command, args) {
  execFileSync(command, args, { stdio: 'inherit' });
}

function capture(command, args) {
  return execFileSync(command, args, { encoding: 'utf8' });
}
