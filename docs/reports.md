+++
title = "Reports"
description = "Choose an output for terminal feedback, CI artifacts, or downstream tooling."
weight = 70
+++

`reports` is an array. Combine formats when the run needs both immediate feedback and a file someone can inspect later. Omitting the array or passing `[]` uses the console report.

## Report properties

| Field | Meaning |
| --- | --- |
| `type` | Required. Use `"console"`, `"markdown"`, `"html"`, or `"json"`. |
| `path` | File destination. Required for Markdown, HTML, and JSON. Console writes to stdout when omitted. Relative paths use the [config directory or `cwd`](configuration.md#path-resolution). Missing parent directories are created automatically. |
| `onlyFailures` | Defaults to `false`. Set `true` to keep only failed rows in Markdown or HTML. Summary totals still cover the full run. Console always lists failures, and JSON keeps all results. |

## Report formats

### Console

Keep the console report for local runs and CI logs. It gives the pass count, selection totals, and a short reason for each failure. Interactive progress is separate from the report. It appears in a terminal and can be suppressed with `--no-progress`.

### HTML

Upload an HTML report as a CI artifact when reviewers need to investigate a failed route without rerunning the job. It includes requested URLs, final URLs, observed and expected statuses, and redirect chains. The file opens directly in a browser.

### Markdown

Use Markdown for a CI job summary or a PR comment. On large runs, `"onlyFailures": true` keeps the summary readable while retaining the rows that need attention.

### JSON

Use JSON when a script consumes the run. It includes the run summary, selection, source sitemap locations, normalized configuration, and individual check results with failure details and redirect hops.

## Keep logs and a CI artifact

~~~json
{
  "reports": [
    { "type": "console" },
    { "type": "html", "path": "reports/sireg.html", "onlyFailures": true }
  ]
}
~~~

When you use `--report`, `--html`, or `--markdown` with `check --config`, the flags replace the configured report list. To keep stdout and add an HTML file for one run, use `--report console --html reports/sireg.html`.

## Exit codes

A completed run writes its reports before exiting. Exit code `0` means all selected checks passed. Exit code `1` means a check failed or the run could not complete. In CI, upload artifacts even after a failed step so reviewers can inspect reports that were written.
