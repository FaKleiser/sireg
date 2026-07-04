# Releasing

sireg is published as an npm package with the `sireg` CLI entry.

## Prepare a release

1. Inspect commits since the previous release tag.
2. Ensure proper release notes are committed under `## [UNRELEASED]` in `CHANGELOG.md`.
3. Run one of:

```bash
npm run release:prepare -- patch
npm run release:prepare -- minor
npm run release:prepare -- major
```

The command requires a clean worktree, finalizes the already-committed changelog notes, bumps `package.json` and `package-lock.json`, runs `npm test`, runs the npm pack dry run, commits with `🚀 Release vX.Y.Z`, creates an annotated `vX.Y.Z` tag, and pushes the branch and tag to GitHub.

## Publish from GitHub

Pushing a `vX.Y.Z` tag starts the release workflow. The workflow validates that the tag matches `package.json`, extracts the matching `CHANGELOG.md` section, runs tests, builds the npm tarball, creates a GitHub Release with that tarball attached, then publishes the same tarball to npm with provenance.

Repository setup:

- Add an npm automation token as `NPM_TOKEN`.
- Keep package provenance enabled by using the included workflow.
- Ensure GitHub Actions has permission to create releases.

## Manual publishing

Manual npm publishing is discouraged. Use the tag-driven workflow so the GitHub Release and npm package stay in sync.
