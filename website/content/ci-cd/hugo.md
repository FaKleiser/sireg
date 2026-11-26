+++
title = "Hugo"
description = "Build with Hugo Extended and check the generated site inside Actions."
weight = 10
aliases = ["/guides/github-actions/"]
+++

Save the workflow as `.github/workflows/website-regression.yml` and set `PRODUCTION_SITEMAP` to your live sitemap.

The workflow builds with Hugo Extended 0.131.0 on an x64 Ubuntu runner and serves `public/`. Match `HUGO_VERSION` to production. Add any theme or asset dependency installation your build needs before **Build the website**.

If production URLs begin with a path prefix such as `/docs/`, set `SITE_PREFIX` to `/docs` without the trailing slash. The workflow builds with that base path and serves the files at the same prefix. Keep `/` for a site served from the domain root.

{{< workflow "hugo" >}}

See [coverage and committed suites]({{< relref "/ci-cd#choose-coverage-and-require-the-check" >}}) for full runs, artifact settings, and required checks.
