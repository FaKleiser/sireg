+++
title = "Netlify Deploy Previews"
description = "Wait for the Netlify Deploy Preview that matches the pull request’s head commit."
weight = 50
+++

Connect the GitHub repository to a Netlify site and enable Deploy Previews. This workflow covers same-repository PRs and requires the preview to be reachable from GitHub's runner. Protected previews need separate authentication for both the readiness probe and the sireg requests. Use a [runner-local workflow]({{< relref "/ci-cd" >}}) as the required check for fork PRs.

Save the workflow as `.github/workflows/website-regression.yml`. Set `PRODUCTION_SITEMAP` to your live sitemap and add these values under **Settings → Secrets and variables → Actions** in GitHub:

- Repository variable `NETLIFY_SITE_ID` with your Netlify Site ID.
- Repository secret `NETLIFY_TOKEN` with a Netlify API token that can list the site's deployments.

If the preview root redirects or isn't a page, set `PREVIEW_PROBE_PATH` to a canonical path such as `/docs/` that returns a direct `200`.

The job waits up to five minutes for a ready Deploy Preview matching both the PR number and its head SHA. It checks the deployment-specific HTTPS URL from `deploy_ssl_url`, which stays tied to that deploy when another commit is pushed. [Netlify deploy API](https://open-api.netlify.com/)

{{< workflow "netlify" >}}

See [coverage and committed suites]({{< relref "/ci-cd#choose-coverage-and-require-the-check" >}}) for full runs, artifact settings, and per-deployment config.
