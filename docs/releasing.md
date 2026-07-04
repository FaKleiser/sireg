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

Pushing a `vX.Y.Z` tag starts the release workflow. The workflow validates that the tag matches `package.json`, extracts the matching `CHANGELOG.md` section, runs tests, builds the npm tarball, creates a GitHub Release with that tarball attached, then publishes the same tarball to npm through npm trusted publishing.

Repository setup:

- Configure npm trusted publishing for this package with:
  - owner or organization: `FaKleiser`
  - repository: `sireg`
  - workflow filename: `release.yml`
  - allowed action: `npm publish`
- Keep `permissions.id-token: write` enabled in the release workflow.
- Use GitHub-hosted runners and Node.js 22.14.0 or newer so npm can exchange the OIDC token.
- Ensure `package.json` `repository.url` matches the trusted GitHub repository.
- Ensure GitHub Actions has `contents: write` permission to create releases.

## Manual publishing

Manual npm publishing is discouraged. Use the tag-driven workflow so the GitHub Release and npm package stay in sync.
