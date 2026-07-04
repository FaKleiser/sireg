# Configuration

sireg configuration is JSON so it can be checked into a repository and reused locally and in CI.

```json
{
  "$schema": "../sireg.schema.json",
  "name": "Production sitemap check",
  "sources": [
    { "type": "sitemap", "url": "https://example.com/sitemap.xml" }
  ],
  "transforms": [
    { "origin": "http://localhost:3000" }
  ],
  "select": {
    "strategy": "all"
  },
  "checks": {
    "expectedStatus": "2xx",
    "concurrency": 6,
    "timeout": 10000,
    "maxRedirects": 8
  },
  "redirects": [
    {
      "from": "https://example.com/old-page",
      "to": "https://example.com/new-page",
      "expectedStatus": "30x",
      "finalStatus": "2xx"
    }
  ],
  "reports": [
    { "type": "console" },
    { "type": "markdown", "path": "reports/sireg.md" },
    { "type": "html", "path": "reports/sireg.html" }
  ]
}
```

## Sources

Sources define where URLs come from.

- `sitemap`: Loads URLs from a sitemap URL or local sitemap file. Sitemap indexes are followed recursively, including nested sitemap indexes.
- `file`: Loads newline-delimited URLs from a file. Blank lines and lines starting with `#` are ignored.
- `url`: Adds a single URL directly.

## Transforms

Transforms rewrite loaded URLs before requests are made. They are applied in order.

- `{ "origin": "http://localhost:3000" }` keeps the path and query but swaps protocol, host, and port.
- `{ "from": "https://example.com", "to": "http://localhost:3000" }` replaces text globally.
- `{ "pattern": "^https://www\\.", "replacement": "https://preview." }` uses a regular expression.

## Selection

Large sites may have too many URLs for every pull request. Selection lets you choose the amount of coverage you want.

- `all`: Test every discovered URL.
- `first`: Test the first `limit` URLs.
- `random`: Test `limit` URLs using a stable `seed`.
- `percent`: Test a percentage of URLs using a stable `seed`.

Use a deterministic seed such as a release number or Git commit SHA when you want repeatable samples.

## Checks

The default check follows redirects and expects the final response to be `2xx`.

Status expectations support exact values (`200`), classes (`2xx`), redirect shorthand (`30x`), ranges (`200-204`), comma-separated strings (`2xx,404`), or arrays (`["2xx", 404]`).

## Redirects

Redirect expectations are for retired URLs that are no longer in the sitemap. A good SEO migration should return a redirect from the old URL and land on a healthy final page.

Each redirect check verifies:

- The first response matches `expectedStatus`, usually `30x`.
- The final URL matches `to` or `toPattern`, if provided.
- The final response matches `finalStatus`, usually `2xx`.
