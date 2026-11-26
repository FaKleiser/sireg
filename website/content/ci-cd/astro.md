+++
title = "Astro"
description = "Install from the npm lockfile and check Astro’s static output inside Actions."
weight = 20
+++

Save the workflow as `.github/workflows/website-regression.yml` and set the `sitemap` input to your live sitemap. Commit `package-lock.json` and provide an npm `build` script that runs `astro build`. The workflow serves Astro's default static output, `dist/`. Change the artifact upload’s `path` if your project uses a different output directory.

If your Astro config sets a `base` such as `/docs/`, set `SITE_PREFIX` to `/docs` without the trailing slash. Keep `/` at the domain root. If your routes use directory URLs, use their canonical trailing slashes in the sitemap.

For server-rendered Astro projects, use a hosted preview on [Netlify]({{< relref "/ci-cd/netlify" >}}) or [Vercel]({{< relref "/ci-cd/vercel" >}}) so requests reach the deployed runtime.

{{< workflow "astro" >}}

See [coverage and committed suites]({{< relref "/ci-cd#choose-coverage-and-require-the-check" >}}) for full runs, artifact settings, and required checks.
