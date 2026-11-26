+++
title = "Jekyll"
description = "Build with Bundler and check the generated Jekyll site inside Actions."
weight = 30
+++

Save the workflow as `.github/workflows/website-regression.yml` and set `PRODUCTION_SITEMAP` to your live sitemap. Commit `Gemfile` and `Gemfile.lock`. The Ruby setup step installs locked gems with Bundler before `bundle exec jekyll build` generates `_site/`. Set `ruby-version` to your production Ruby version if it differs from 3.3.

Jekyll's `baseurl` affects the public paths of the generated site. For example, if production uses `baseurl: "/blog"`, set `SITE_PREFIX` to `/blog` without the trailing slash. The workflow passes that value to Jekyll and serves `_site/` at `/blog/`, so a production route like `/blog/about/` maps to the matching local route. Keep `/` for an empty `baseurl`.

{{< workflow "jekyll" >}}

See [coverage and committed suites]({{< relref "/ci-cd#choose-coverage-and-require-the-check" >}}) for full runs, artifact settings, and required checks.
