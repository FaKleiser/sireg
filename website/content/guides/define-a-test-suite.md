+++
title = "Define a test suite"
description = "Turn a one-off command into a JSON config you can run locally and in CI."
weight = 15
+++

A config file gives everyone on the team the same route list, pass conditions, and reports. Keep the file with the site so it can evolve alongside the routes you check.

## Choose the source and target

Use the live sitemap as the source when you want to catch pages a new build has dropped. Set an origin transform for the local build. For example, a source entry for `https://example.com/blog/post/` becomes a request to `http://127.0.0.1:8000/blog/post/`.

Create `sireg.config.json` in your site repository. Replace the example sitemap with your live sitemap and change the origin to the address where your build is served.

~~~json
{
  "$schema": "https://raw.githubusercontent.com/FaKleiser/sireg/v1.1.0/sireg.schema.json",
  "name": "Preview smoke test",
  "sources": [
    { "type": "sitemap", "url": "https://example.com/sitemap.xml" }
  ],
  "transforms": [{ "origin": "http://127.0.0.1:8000" }],
  "select": { "strategy": "random", "limit": 25, "seed": "preview" },
  "checks": { "expectedStatus": 200 },
  "reports": [
    { "type": "console" },
    { "type": "html", "path": "reports/sireg.html" }
  ]
}
~~~

## Set the coverage and pass condition

The suite samples up to 25 unique targets. The seed repeats the same draw when the ordered sitemap input stays the same. Remove the `select` block to check every route, or use a separate [curated URL file]({{< relref "/reference/sources#url-file" >}}) when important routes must pass on every PR.

This suite requires an exact final `200`. Use `"2xx"` if other success statuses are acceptable. To check how a legacy URL redirects, add a [redirect expectation]({{< relref "/reference/redirects" >}}) with the legacy URL and its expected destination.

## Run and read the results

[Start your local build]({{< relref "/guides/local" >}}) on the configured origin, then run the suite from a terminal with Node.js 20 or newer.

~~~bash
npx --yes sireg@1.1.0 check --config sireg.config.json
~~~

The console gives you the result immediately. Open `reports/sireg.html` beside the config to inspect the target URLs, statuses, and redirect chains. Add the same command after your build and server readiness steps in [GitHub Actions]({{< relref "/ci-cd" >}}). A failed check returns exit code `1`, which fails the job.

Use the [configuration reference]({{< relref "/reference/configuration" >}}) when you need to change how paths resolve, tune request settings, or choose another report format.
