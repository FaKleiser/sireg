# Releasing

sireg is published as an npm package with the `sireg` CLI entry.

## Prepare a release

1. Run `npm test`.
2. Run `npm pack --dry-run --ignore-scripts` and inspect the tarball contents.
3. Update `CHANGELOG.md`.
4. Bump the version with `npm version patch`, `npm version minor`, or `npm version major`.
5. Push the tag.

## Publish from GitHub

The release workflow publishes to npm when a GitHub release is published.

Repository setup:

- Add an npm automation token as `NPM_TOKEN`.
- Keep package provenance enabled by using the included workflow.

## Publish manually

```bash
npm test
npm publish --provenance --access public
```
