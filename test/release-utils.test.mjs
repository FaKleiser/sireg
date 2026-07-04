import { strict as assert } from 'node:assert';
import test from 'node:test';
import {
  assertCleanWorktree,
  assertNonEmptyUnreleased,
  bumpVersion,
  extractReleaseNotes,
  finalizeChangelog,
  validateTagMatchesPackageVersion,
} from '../scripts/release-utils.mjs';

test('bumps semantic versions for major, minor, and patch releases', () => {
  assert.equal(bumpVersion('1.2.3', 'major'), '2.0.0');
  assert.equal(bumpVersion('1.2.3', 'minor'), '1.3.0');
  assert.equal(bumpVersion('1.2.3', 'patch'), '1.2.4');
  assert.throws(() => bumpVersion('1.2.3', 'beta'), /major, minor, patch/);
});

test('rejects empty unreleased changelog sections', () => {
  const changelog = `# Change Log

## [UNRELEASED]


## v1.0.0 - 2026-07-01

### Added
- Initial release.
`;

  assert.throws(() => assertNonEmptyUnreleased(changelog), /must contain release notes/);
});

test('finalizes unreleased changelog notes into a dated version section', () => {
  const changelog = `# Change Log

## [UNRELEASED]

### Added
- Improve release automation.

## v1.0.0 - 2026-07-01

### Added
- Initial release.
`;

  const finalized = finalizeChangelog(changelog, '1.1.0', '2026-07-04');

  assert.match(finalized, /## \[UNRELEASED\]\n\n\n## v1\.1\.0 - 2026-07-04/);
  assert.match(finalized, /### Added\n- Improve release automation\./);
  assert.match(finalized, /## v1\.0\.0 - 2026-07-01/);
});

test('extracts release notes for the matching version', () => {
  const changelog = `# Change Log

## [UNRELEASED]


## v1.1.0 - 2026-07-04

### Added
- Improve release automation.

## v1.0.0 - 2026-07-01

### Added
- Initial release.
`;

  assert.equal(extractReleaseNotes(changelog, '1.1.0'), '### Added\n- Improve release automation.\n');
});

test('validates release tags against package versions', () => {
  assert.doesNotThrow(() => validateTagMatchesPackageVersion('v1.2.3', '1.2.3'));
  assert.throws(() => validateTagMatchesPackageVersion('v1.2.4', '1.2.3'), /does not match package version/);
});

test('detects dirty git worktrees for release preparation', () => {
  assert.doesNotThrow(() => assertCleanWorktree(''));
  assert.throws(() => assertCleanWorktree(' M package.json\n'), /clean git worktree/);
});
