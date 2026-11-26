# sireg Project Memory

## Project Goal

sireg should become a successful open source project for testing websites for regressions. Users provide a sitemap, nested sitemap index, local sitemap file, URL file, or direct URL list. sireg transforms those URLs when needed, fetches the target pages, follows redirects, and reports whether the final status codes match expectations.

The tool should be easy to adopt in local development, preview environments, staging checks, and GitHub Actions pipelines.

## User-Facing Requirements

- Load URLs from hosted sitemaps, local sitemap files, nested sitemap indexes, `.xml.gz` sitemaps, URL files, and direct CLI URLs.
- Transform URLs so a production sitemap can be checked against local dev, preview, or staging hosts.
- Support full checks and bounded checks for large sites: `all`, `first`, deterministic `random`, and `percent`.
- Check status expectations such as `2xx`, `30x`, exact status codes, ranges, comma-separated lists, and arrays.
- Test retired URLs that are no longer present in sitemaps by defining explicit redirect expectations.
- Redirect checks should verify the first response is a redirect and the final destination returns a healthy status, usually `2xx`.
- Produce interactive CLI progress for terminals plus concise non-TTY output, Markdown, JSON, and polished HTML reports suitable as CI artifacts.
- Exit `0` when all checks pass and `1` when any check fails.
- Provide a typed programmatic API for custom tooling.

## Architecture

The current implementation is TypeScript ESM on modern Node.js.

- `src/cli.ts`: CLI argument parsing and command entry.
- `src/index.ts`: public typed npm API exports.
- `src/run.ts`: orchestration for loading, transforming, selecting, checking, summarizing, and reporting.
- `src/types.ts`: public and internal shared types.
- `src/core/config.ts`: defaults, config normalization, CLI option conversion, validation.
- `src/core/sources.ts`: source loading dispatch for sitemap, file, and URL inputs.
- `src/core/sitemap.ts`: sitemap and sitemap-index traversal.
- `src/core/transforms.ts`: origin, string, and regex URL transforms.
- `src/core/select.ts`: de-duplication and deterministic URL selection.
- `src/core/http.ts`: manual redirect-following HTTP checks.
- `src/core/pool.ts`: bounded concurrency helper.
- `src/reporters/*`: console, Markdown, HTML, JSON report rendering.
- `src/reporters/live-console.ts`: TTY-only spinner, progress bar, and live pass/fail stats.

The design intent is modular and properly typed, but not over-engineered. Avoid reintroducing DI containers, RxJS, or old request-stack abstractions unless there is a strong reason.

## Important Decisions

- Runtime dependencies should stay at zero unless a dependency clearly improves user value and maintenance.
- Node engine is `>=20` to rely on native `fetch`, `node:test`, ESM, and modern TypeScript output.
- Package output is compiled to `dist/`; tests compile separately to `dist-test/` and must not be published.
- `sireg.schema.json` is the user-facing config schema.
- The configuration reference in `docs/` should stay in sync with the schema, code defaults, and guide examples.
- GitHub Actions are included for CI and npm release publishing through npm trusted publishing. Do not publish without explicit user approval.
- Releases are tag-driven: `npm run release:prepare -- major|minor|patch` finalizes `CHANGELOG.md`, bumps the package version, commits, tags, and pushes; the pushed `vX.Y.Z` tag creates the GitHub Release and publishes the npm package through OIDC trusted publishing.
- The npm trusted publisher must match `.github/workflows/release.yml` and the package `repository.url`; do not reintroduce `NPM_TOKEN` publishing unless the user explicitly changes the release strategy.
- `CHANGELOG.md` must be updated under `## [UNRELEASED]` before preparing a release.
- The old Node 8 stack, TSLint, Travis config, Yarn lockfile, Inversify/RxJS/request code, and legacy schema were intentionally removed.

## Documentation Site

- The capability assessment and README plan live in [plans/use-cases-and-readme.md](plans/use-cases-and-readme.md). Update the plan when CLI capabilities ship or the documented behavior changes.
- The Hugo site lives in `website/`. General guides live in `website/content/guides/`. CI/CD guides live in `website/content/ci-cd/` and embed their downloadable examples from `website/static/workflows/`. Hugo mounts the shared configuration reference from `docs/` and the maintainer pages from `docs/development/`.
- Preview with `hugo server --source website`. Use Hugo 0.131.0 to match CI. The [Pages workflow](../.github/workflows/pages.yml) builds and verifies pull requests and deploys verified builds from `master`.
- Run `npm run docs:check` for a local build and route check. The downloadable CI/CD examples call reusable workflows in `.github/workflows/`. Keep their inputs and the guide text in sync.
- Enable **GitHub Actions** under the repository's **Settings → Pages → Build and deployment → Source** when publishing the site for the first time. Merge site changes through a pull request. If deployment returns 404, confirm the Pages source is set to GitHub Actions and rerun the Documentation workflow on `master`.
- The public project path is `/sireg/`. The verification script serves the generated site at that path, runs the built sireg CLI against its sitemap, checks for an HTML report, and validates internal links, anchors, and assets. Keep deployment and preview paths in sync.

## Verification Expectations

For meaningful code changes, run:

```bash
npm test
```

For package/release changes, also run:

```bash
npm --cache /private/tmp/sireg-npm-cache pack --dry-run --ignore-scripts
```

For releases, use:

```bash
npm run release:prepare -- patch
```

Swap `patch` for `minor` or `major` according to semantic versioning.

The test suite should cover:

- status expectation matching;
- deterministic sampling;
- nested sitemap traversal;
- URL transforms;
- redirect expectations;
- report rendering;
- local URL file loading.

## Commit Convention

Always commit completed work unless the user explicitly says not to. Use gitmoji style commit messages that describe the user-visible intent:

- `✨ Add sitemap regression CLI`
- `📝 Improve reporting documentation`
- `✅ Cover redirect checks`
- `♻️ Simplify config normalization`
- `🚀 Prepare npm release workflow`

Push topic branches and open pull requests. Never push directly to `main` or `master`. Keep commits focused when possible. If a task spans a complete product slice, one well-described commit is acceptable.

Release commits are created by `npm run release:prepare -- major|minor|patch` and use `🚀 Release vX.Y.Z`.
