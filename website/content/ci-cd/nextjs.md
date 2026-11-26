+++
title = "Next.js static export"
description = "Build a static export and check the generated Next.js site inside Actions."
weight = 40
+++

Save the workflow as `.github/workflows/website-regression.yml` and set `PRODUCTION_SITEMAP` to your live sitemap. Commit `package-lock.json` and provide an npm `build` script that runs `next build`. In `next.config.mjs`, enable the static export and directory-style URLs:

~~~js
export default {
  output: 'export',
  trailingSlash: true,
};
~~~

The workflow serves `out/`. With `trailingSlash: true`, Next.js writes files such as `out/about/index.html`, and the sitemap should list the canonical `/about/` URL. If your Next.js config sets a `basePath` such as `/docs`, set `SITE_PREFIX` to that same path without a trailing slash. Keep `/` at the domain root.

For apps that need a server at request time, use a [Vercel Preview Deployment]({{< relref "/ci-cd/vercel" >}}).

{{< workflow "nextjs" >}}

See [coverage and committed suites]({{< relref "/ci-cd#choose-coverage-and-require-the-check" >}}) for full runs, artifact settings, and required checks.
