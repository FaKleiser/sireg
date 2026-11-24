+++
title = "Configuration"
description = "Find every top-level property, what it controls, and where it is used in a run."
weight = 10
+++

## Properties at a glance

| Property | Use it to | Default |
| --- | --- | --- |
| [`sources`](sources.md) | Load sitemap entries, a URL list, or individual URLs | None |
| [`transforms`](transforms.md) | Rewrite source URLs for the environment you want to test | None |
| [`select`](selection.md) | Check every target or sample the set to fit a run budget | All targets |
| [`checks`](checks.md) | Set the expected final status and control how requests run | Final `2xx`, six concurrent checks |
| [`redirects`](redirects.md) | Verify old URLs and where they land | None |
| [`reports`](reports.md) | Choose console, JSON, Markdown, or HTML output | Console |
| [`name`](#suite-name) | Identify the suite in reports and CI logs | `sireg website regression` |
| [`cwd`](#path-resolution) | Resolve local inputs and outputs from a directory you choose | Directory containing the config |
| [`$schema`](#editor-validation) | Enable JSON editor suggestions and validation | None |

## How properties work together

sireg loads `sources`, applies `transforms` in order, and removes duplicate target URLs before `select` chooses which ones to request. It runs explicit `redirects` alongside the selected page checks. Redirect entries use their own URLs and run on every invocation, even when page selection is limited. `reports` controls how the results are written.

## Run a suite

Save the configuration as a JSON file and pass its path explicitly. The filename can be anything.

~~~bash
npx --yes sireg@1.1.0 check --config sireg.config.json
~~~

A suite needs at least one source or explicit redirect expectation. A minimal source-based suite fetches every discovered URL and expects a final `2xx` response.

~~~json
{
  "sources": [{ "type": "url", "url": "https://example.com/" }]
}
~~~

## Suite name

Set `name` to a short label such as `Preview smoke test` so reports identify which suite produced them. A name helps distinguish a pull request sample from a scheduled full run.

## Path resolution

Local input paths and report output paths are relative to the config file's directory. For example, with `--config ci/sireg.json`, a report at `reports/sireg.html` lands at `ci/reports/sireg.html`. Set `"cwd": ".."` in that config to resolve both inputs and outputs from the repository root. An absolute `cwd` selects that directory directly. When using CLI flags without a config, relative paths start in the shell's working directory.

## Editor validation

Set `$schema` to a local copy of `sireg.schema.json` or the [repository schema](https://raw.githubusercontent.com/FaKleiser/sireg/master/sireg.schema.json). JSON editors can use it for completion and validation. The v1.1.0 bundled schema omits `cwd` and requires sources in a redirect-only suite, even though the CLI supports both cases.

## CLI overrides

With `check --config`, configure sources, transforms, selection, and checks in the file. Use `--no-progress` to disable interactive progress. Report flags replace the report list for that run, so include `--report console` if you also want a terminal summary.
