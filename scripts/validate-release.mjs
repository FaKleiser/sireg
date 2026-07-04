#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { extractReleaseNotes, validateTagMatchesPackageVersion } from './release-utils.mjs';

const tagName = process.argv[2] || process.env.GITHUB_REF_NAME;
const notesPath = process.argv[3] || 'release-notes.md';

try {
  if (!tagName) {
    throw new Error('Expected release tag as the first argument or GITHUB_REF_NAME.');
  }

  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  validateTagMatchesPackageVersion(tagName, packageJson.version);

  const notes = extractReleaseNotes(readFileSync('CHANGELOG.md', 'utf8'), packageJson.version);
  writeFileSync(notesPath, notes, 'utf8');
  console.log(`Validated ${tagName} and wrote release notes to ${notesPath}.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`release validation failed: ${message}`);
  process.exitCode = 1;
}
