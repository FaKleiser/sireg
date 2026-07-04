const RELEASE_TYPES = new Set(['major', 'minor', 'patch']);

export function assertReleaseType(type) {
  if (!RELEASE_TYPES.has(type)) {
    throw new Error('Release type must be one of: major, minor, patch.');
  }
}

export function bumpVersion(version, type) {
  assertReleaseType(type);
  const parsed = parseVersion(version);

  if (type === 'major') {
    return `${parsed.major + 1}.0.0`;
  }

  if (type === 'minor') {
    return `${parsed.major}.${parsed.minor + 1}.0`;
  }

  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
}

export function parseVersion(version) {
  const match = String(version).match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Expected semantic version X.Y.Z, received "${version}".`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function validateTagMatchesPackageVersion(tag, packageVersion) {
  const expectedTag = `v${packageVersion}`;
  if (tag !== expectedTag) {
    throw new Error(`Release tag ${tag} does not match package version ${packageVersion}. Expected ${expectedTag}.`);
  }
}

export function extractUnreleasedSection(changelog) {
  const match = String(changelog).match(/^## \[UNRELEASED\]\s*\n([\s\S]*?)(?=^##\s+)/m);
  if (!match) {
    throw new Error('CHANGELOG.md must contain a ## [UNRELEASED] section before release preparation.');
  }

  return match[1];
}

export function assertNonEmptyUnreleased(changelog) {
  const unreleased = extractUnreleasedSection(changelog);
  if (!hasMeaningfulContent(unreleased)) {
    throw new Error('CHANGELOG.md ## [UNRELEASED] must contain release notes before preparing a release.');
  }
}

export function finalizeChangelog(changelog, version, date) {
  parseVersion(version);
  assertNonEmptyUnreleased(changelog);

  const normalized = String(changelog).replace(/\r\n/g, '\n');
  return normalized.replace(/^## \[UNRELEASED\]\s*\n([\s\S]*?)(?=^##\s+)/m, (_match, notes) => {
    const trimmedNotes = String(notes).trim();
    return `## [UNRELEASED]\n\n\n## v${version} - ${date}\n\n${trimmedNotes}\n\n\n`;
  });
}

export function extractReleaseNotes(changelog, version) {
  parseVersion(version);
  const normalized = String(changelog).replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const startIndex = lines.findIndex((line) => line.startsWith(`## v${version} - `));

  if (startIndex === -1) {
    throw new Error(`CHANGELOG.md must contain a release section for v${version}.`);
  }

  const nextSectionIndex = lines.findIndex((line, index) => index > startIndex && line.startsWith('## '));
  const endIndex = nextSectionIndex === -1 ? lines.length : nextSectionIndex;
  const notes = lines.slice(startIndex + 1, endIndex).join('\n').trim();
  if (!hasMeaningfulContent(notes)) {
    throw new Error(`CHANGELOG.md release section for v${version} must not be empty.`);
  }

  return `${notes}\n`;
}

export function assertCleanWorktree(gitStatusPorcelain) {
  if (String(gitStatusPorcelain).trim()) {
    throw new Error('Release preparation requires a clean git worktree.');
  }
}

export function todayIsoDate(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function hasMeaningfulContent(markdown) {
  return String(markdown)
    .split('\n')
    .map((line) => line.trim())
    .some((line) => line && !line.startsWith('<!--') && !line.startsWith('-->'));
}
