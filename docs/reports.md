# Reports

sireg always produces a process exit code for automation:

- `0` means every selected URL and redirect expectation passed.
- `1` means at least one check failed or the run could not be completed.

## Console

Console output is compact and optimized for CI logs. It includes the pass count, success rate, discovered URL count, selected URL count, skipped URL count, redirect checks, and failures.

```json
{
  "reports": [{ "type": "console" }]
}
```

## Markdown

Markdown reports are useful for build summaries and pull request comments.

```json
{
  "reports": [{ "type": "markdown", "path": "reports/sireg.md" }]
}
```

## HTML

HTML reports are intended as build artifacts. They include summary metrics, failure reasons, final URLs, and redirect chains in a responsive table.

```json
{
  "reports": [{ "type": "html", "path": "reports/sireg.html" }]
}
```

## JSON

JSON reports expose the full result model for downstream tooling.

```json
{
  "reports": [{ "type": "json", "path": "reports/sireg.json" }]
}
```
