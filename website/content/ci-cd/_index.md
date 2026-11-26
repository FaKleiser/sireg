+++
title = "CI/CD"
+++

Choose where to run sireg based on how your site is built and deployed.

| What you want to verify | Where to run sireg | Pick a workflow |
| --- | --- | --- |
| Each PR already gets a preview and you want to test routing and responses on the actual hosting platform | On the deployment-specific preview URL | [Netlify]({{< relref "/ci-cd/netlify" >}}) or [Vercel]({{< relref "/ci-cd/vercel" >}}) |
| Your site builds to static files, or you need a required check that can run on fork PRs without provider secrets | Build and serve the site inside GitHub Actions | [Hugo]({{< relref "/ci-cd/hugo" >}}), [Astro]({{< relref "/ci-cd/astro" >}}), [Jekyll]({{< relref "/ci-cd/jekyll" >}}), or [Next.js static export]({{< relref "/ci-cd/nextjs" >}}) |
| Your host refreshes or deploys a shared WordPress staging site | On staging after the host finishes the refresh | [WordPress staging]({{< relref "/ci-cd/wordpress" >}}) |

## Choose coverage and require the check

Each workflow uses sireg 1.1.0, samples up to 25 routes, and requires each selected route to return a direct HTTP `200`. This catches a preview that sends visitors back to production, even when the production page works. PR workflows seed the sample with the PR head SHA. Remove `--strategy random --limit 25 --seed ...` to check every route. The job prints a console summary and uploads the HTML report when checks fail. Find it under **Artifacts** on the workflow run.

Once the job has run, add its status check to your GitHub branch protection rule or ruleset. For repositories that accept fork PRs, use a runner-local workflow as the required check. Hosted workflows use provider secrets and run only for PRs from branches in the same repository.

## Run a committed test suite

Start with the [test suite guide]({{< relref "/guides/define-a-test-suite" >}}). In the config, set `"expectedStatus": 200` and `"maxRedirects": 0` under `checks` to keep the same page requirements. Include both console and HTML reports and match the artifact path to the generated report. Put the coverage you want under `select`, or omit it for a full run.

For a fixed target, set the origin in the config and replace the workflow's sireg command with:

~~~bash
npx --yes sireg@1.1.0 check --config sireg.config.json
~~~

For hosted previews, add an `actions/checkout@v4` step so the job has the committed config. In **Check preview routes**, replace the sireg command with the following block. It assumes the config has one origin transform and uses the workflow's `SITE_ORIGIN` and `PR_HEAD_SHA`. The temporary config lives beside the original so relative sources, `cwd`, and report paths resolve in the same place.

~~~bash
config=ci/sireg.config.json
preview_config="$(mktemp "$(dirname "$config")/.sireg-preview.XXXXXX.json")"
trap 'rm -f "$preview_config"' EXIT

node --input-type=commonjs - "$config" "$preview_config" <<'NODE'
const { readFileSync, writeFileSync } = require('node:fs');
const [source, target] = process.argv.slice(2);
const config = JSON.parse(readFileSync(source, 'utf8'));
const transform = config.transforms?.find((entry) => 'origin' in entry);
if (!transform) throw new Error('Add an origin transform to the test suite.');
transform.origin = process.env.SITE_ORIGIN;
if (config.select?.strategy === 'random') {
  config.select.seed = process.env.PR_HEAD_SHA;
}
writeFileSync(target, JSON.stringify(config, null, 2));
NODE

npx --yes sireg@1.1.0 check --config "$preview_config"
~~~

Explicit [redirect expectations]({{< relref "/reference/redirects" >}}) use their own URLs. Update their `from` and any `to` or `toPattern` values in the temporary config to match the preview. Set a positive `maxRedirects` on each redirect expectation that needs to follow a hop. For a fixed suite, put the target URLs directly in the committed config. Add checkout to the WordPress job if you use a committed suite there.
