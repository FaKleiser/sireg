# Prepare Release Command

Use this command when the user asks to prepare a major, minor, or patch release.

## Inputs

- Release type: `major`, `minor`, or `patch`.

## Steps

1. Confirm the worktree is clean before starting release preparation.
2. Inspect commits since the previous `v*` tag and decide the correct changelog entries.
3. Ensure `CHANGELOG.md` has committed release notes under `## [UNRELEASED]` using Keep a Changelog-style sections such as `Added`, `Changed`, `Fixed`, or `Removed`. If you need to edit the changelog, commit that changelog update before release preparation.
4. Run:

```bash
npm run release:prepare -- <major|minor|patch>
```

5. Confirm the command commits `🚀 Release vX.Y.Z`, creates annotated tag `vX.Y.Z`, and pushes both the branch and tag.
6. Do not publish npm manually. The pushed tag triggers GitHub Actions to create the GitHub Release, attach the tarball, and publish to npm with provenance.

## Notes

- If `CHANGELOG.md` has an empty `## [UNRELEASED]` section, the release command must fail.
- If tests or the pack dry run fail, fix the issue before retrying.
- If the repository is in detached HEAD state, do not release from that state.
