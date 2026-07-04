# Agent Instructions

This repository is `sireg`, a TypeScript Node.js CLI and npm package for sitemap-driven website regression testing.

Before making changes, read [.agents/project-memory.md](.agents/project-memory.md). It captures the product goal, architecture, decisions, and verification expectations that should carry across sessions.

## Working Rules

- Preserve the goal: sireg should stay simple to use, robust in CI, and useful as both a CLI and typed npm package.
- Prefer typed, dependency-light Node.js code using native platform APIs where practical.
- Keep the architecture modular without adding ceremony: config, source loading, transforms, selection, HTTP checks, reports, and CLI should remain separable.
- Treat user experience as a product requirement. CLI output, docs, examples, and reports matter as much as internals.
- Always run relevant verification before finishing. For broad changes, run `npm test`.
- Always update `CHANGELOG.md` for user-visible changes.
- Always commit completed work unless the user explicitly asks not to commit.
- Commit messages must use useful gitmoji style, for example `✨ Add sitemap regression CLI` or `📝 Document GitHub Actions usage`.
- Do not publish to npm unless the user explicitly asks.
- To prepare a release, follow [.agents/commands/prepare-release.md](.agents/commands/prepare-release.md) and run `npm run release:prepare -- major|minor|patch`.

## Useful Commands

```bash
npm test
npm run build
npm --cache /private/tmp/sireg-npm-cache pack --dry-run --ignore-scripts
node dist/cli.js --help
npm run release:prepare -- patch
```

Local HTTP tests may need permission to bind `127.0.0.1`.
