![sireg - regression testing for websites](/assets/sireg-repo-banner.png)

# sireg

sireg is a Node.js CLI and npm package for website regression checks. Give it a sitemap, a URL file, or a handful of URLs; it fetches the pages, follows redirects, and tells you whether the final responses are healthy.

It is built for the release moment where you need a quick answer: did this deployment break important pages, staging routes, or SEO redirects?

## Why sireg?

- Load URLs from sitemap files, hosted sitemaps, sitemap indexes, nested sitemap indexes, URL files, or direct CLI input.
- Rewrite production sitemap URLs to local dev, preview, or staging hosts.
- Check all URLs, the first N URLs, a deterministic random sample, or a percentage of a large site.
- Verify retired URLs that are no longer in the sitemap still return a 30x redirect and land on a 2xx page.
- Produce readable console output plus Markdown, JSON, and polished HTML reports for CI artifacts.
- Use it as `npx sireg` or import the typed TypeScript API in your own tooling.

## Quick Start

```bash
npx sireg check --sitemap https://example.com/sitemap.xml
```

Check a local build using the production sitemap:

```bash
npx sireg check \
  --sitemap https://example.com/sitemap.xml \
  --origin http://localhost:3000
```

Create build artifacts:

```bash
npx sireg check \
  --sitemap https://example.com/sitemap.xml \
  --origin http://localhost:3000 \
  --markdown reports/sireg.md \
  --html reports/sireg.html
```

sireg exits with `0` when every check passes and `1` when any URL or redirect expectation fails.

## Configuration

Commit a JSON config when you want local runs and CI to use the same routes and pass conditions. Save this as `sireg.config.json`, replace the sitemap URL, and start your local site on port 8000.

```json
{
  "$schema": "https://raw.githubusercontent.com/FaKleiser/sireg/v1.1.0/sireg.schema.json",
  "name": "Local website check",
  "sources": [{ "type": "sitemap", "url": "https://example.com/sitemap.xml" }],
  "transforms": [{ "origin": "http://127.0.0.1:8000" }],
  "reports": [
    { "type": "console" },
    { "type": "html", "path": "reports/sireg.html" }
  ]
}
```

```bash
npx sireg check --config sireg.config.json
```

Follow [Define a test suite](https://fakleiser.github.io/sireg/guides/define-a-test-suite/) to add sampling and set a pass condition. See the [configuration reference](docs/configuration.md) for every property.

## GitHub Actions

Check a hosted preview or build and serve your site inside Actions. The [CI/CD guides](https://fakleiser.github.io/sireg/ci-cd/) help you choose and provide seven downloadable workflows, including a manual check for WordPress staging.

## CLI

```bash
sireg check --sitemap <url-or-file> [options]
sireg check --config <path>
sireg test <config>
```

Useful options:

- `--sitemap <value>`: Load URLs from a sitemap or sitemap index.
- `--file <path>`: Load newline-delimited URLs from a file.
- `--url <url>`: Check one URL directly.
- `--origin <origin>`: Replace each discovered URL origin.
- `--replace <from=to>`: Replace text in each URL.
- `--strategy <all|first|random|percent>`: Choose URL selection strategy.
- `--limit <number|all>`: Limit selected URLs.
- `--expect-status <rule>`: Expected final status, such as `2xx`, `200`, or `200-204`.
- `--markdown <path>` and `--html <path>`: Write report artifacts.
- `--no-progress`: Disable the interactive spinner, progress bar, and live pass/fail stats.

When run in an interactive terminal, sireg shows live progress while it loads sources and checks URLs. CI and non-TTY environments keep deterministic output.

## Redirect Checks

Sitemaps usually contain current URLs, not retired ones. That means sitemap checks alone cannot prove old URLs still redirect correctly.

Add explicit redirect expectations:

```json
{
  "redirects": [
    {
      "from": "https://example.com/products/old-slug",
      "toPattern": "^https://example.com/products/new-slug/?$",
      "expectedStatus": "30x",
      "finalStatus": "2xx"
    }
  ]
}
```

sireg verifies the first response redirects, follows the chain, checks the final URL when requested, and confirms the final page is healthy.

## Programmatic API

```ts
import { runSireg } from 'sireg';

const report = await runSireg({
  name: 'Preview check',
  sources: [{ type: 'sitemap', url: 'https://example.com/sitemap.xml' }],
  transforms: [{ origin: 'http://localhost:3000' }],
});

console.log(report.summary.successRate);
```

## Development

```bash
npm install
npm test
```

The project is written in TypeScript, uses native Node.js APIs, and has no runtime dependencies.

See [releasing](docs/development/releasing.md) for the npm publish flow.

## Contributing

Issues and pull requests are welcome. Good contributions make sireg easier to trust in CI: clearer reports, stronger tests, better examples, and integrations with common website stacks.

## License

MIT
