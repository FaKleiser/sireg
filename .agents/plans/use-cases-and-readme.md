# Use cases and README plan

## What works in v1.0.1

| Use case | Available today | Behavior to account for |
| --- | --- | --- |
| Check a local build against production URLs | Yes | Fetch the hosted sitemap and its child sitemaps, then use `--origin http://127.0.0.1:8000` to send discovered paths and queries to the local server. The default expects a final `2xx`. Use `--expect-status 200` for an exact final status. |
| Run a quick randomized smoke test | Yes | Use `--strategy random --limit 25 --seed local-smoke`. The same seed and input order reproduce the sample. Use a commit SHA to vary it across commits. Sampling limits target requests. Sitemap discovery still loads the full sitemap tree. |
| Cover major sections such as `/blog/**`, `/industry/**`, and `/about/**` | Manual | Keep a small URL file with representative routes and check all of them. For guaranteed coverage plus a global random sample, run the URL file in a separate invocation. Combining both sources under one random selection can omit a section. |
| Gate every Hugo pull request | Yes | Build the site, serve the generated files, wait for the server, and run sireg. Failed checks return exit code 1. Upload the report even when the check fails. |
| Check old URLs during a migration | Yes | Explicit redirect entries can assert the first status, final status, and final destination. In a local run, write redirect expectations with local URLs. Source transforms only apply to discovered URLs. |

The source supplies the route list. It does not supply production status codes. A standard URL check evaluates the configured final status after following redirects, including redirects to other hosts. A server that serves the home page with status 200 for missing paths can also pass a status-only check.

The original README's GitHub Actions seed example puts a workflow expression inside a JSON config, where GitHub Actions cannot evaluate it. Pass the SHA as `--seed "$GITHUB_SHA"` in a direct CLI invocation. In v1.0.1, config mode accepts report overrides and takes the selection settings from the config.

The v1.0.1 npm launcher can silently skip execution on platforms where npm links the executable. The CLI and non-interactive progress fixes are committed for the next release. Until then, install v1.0.1 and use `node ./node_modules/sireg/dist/cli.js check --no-progress`. The docs site uses that invocation.

## Capability plan

1. **Sample by path.** Add a config-first selection strategy with named pathname globs, a count for each group, and a shared seed. Define segment-aware `*` and `**` matching on the transformed URL pathname, independent of the query string. Match `/about/**` against the section landing page and descendants, but not `/about-us/`. Deduplicate target requests globally and let a selected URL count toward every group it matches. Report matched and selected counts per group. Fail explicitly when a required quota cannot be met, including an empty match, so a missing section cannot quietly pass. Cover overlap, insufficient matches, reproducibility, normalization, and the CLI exit code. Update the public types, schema, and reports together.
2. **Keep preview checks on the preview.** Add an opt-in same-origin redirect policy for ordinary sitemap checks. Report the hop that would leave the target origin and stop before fetching it. Preserve the existing default for current configurations and cover absolute, relative, and cross-origin redirect chains in integration tests.
3. **Evaluate status overrides after real examples.** If users regularly need to check different final status rules in one run, add explicit pathname-based overrides with documented precedence. Keep live-vs-preview status comparison out of the first release. It would double target requests and turn transient production failures into the expected baseline.

Other workflows worth documenting now are full scheduled sweeps paired with small PR checks, explicit legacy redirect checks for migrations, and checks against preview deployment URLs before promotion. A future sitemap diff could catch URLs missing from the generated sitemap even when those URLs still return 200.

## README plan

1. Lead with the outcome: catch broken production routes before a website change ships. Follow it with the shortest production-sitemap-to-local command and explain how the sitemap host and request host differ.
2. Give readers a decision table for full sweeps, seeded smoke tests, curated critical routes, and redirect migrations. Link each row to a runnable guide and show grouped sampling only after release.
3. Replace the current Actions snippet with a Hugo workflow that builds, serves, waits, uses the commit SHA as a seed, and uploads the report on failure. Explain how to switch the same workflow to a full sweep.
4. Describe final status, cross-origin redirects, and status-only coverage where readers first choose checks. Link to configuration, reports, CLI help, and the package API for details.
5. Verify every snippet against the documented release. Add the public docs URL once Pages has deployed successfully.
