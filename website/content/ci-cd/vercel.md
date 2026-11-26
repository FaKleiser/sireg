+++
title = "Vercel Preview Deployments"
description = "Wait for the Vercel Preview Deployment that matches the pull request’s head commit."
weight = 60
+++

Connect the GitHub repository to a Vercel project with Preview Deployments enabled. This workflow covers same-repository PRs and requires the preview to be reachable from GitHub's runner. Protected previews need separate authentication for both the readiness probe and the sireg requests. Use a [runner-local workflow]({{< relref "/ci-cd" >}}) as the required check for fork PRs.

Save the workflow as `.github/workflows/website-regression.yml`. Set the `sitemap` input to your live sitemap and add these values under **Settings → Secrets and variables → Actions** in GitHub:

- Repository variable `VERCEL_PROJECT_ID` with your Vercel Project ID.
- Repository secret `VERCEL_TOKEN` with a Vercel API token that can list the project's deployments.
- Repository variable `VERCEL_TEAM_ID` with the Team ID for a team-owned project. Leave it unset for a personal project.

If the preview root redirects or isn't a page, add the `probe-path` input and set it to a canonical path such as `/docs/` that returns a direct `200`.

The job waits up to five minutes for a ready deployment in the project's default Preview environment with the exact GitHub head SHA. It uses the deployment hostname from the API's `url` field, which stays tied to that deployment. [Vercel deployments API](https://vercel.com/docs/rest-api/reference/endpoints/deployments/list-deployments)

{{< workflow "vercel" >}}

See [coverage and committed suites]({{< relref "/ci-cd#choose-coverage-and-require-the-check" >}}) for full runs, reports, and required checks.
