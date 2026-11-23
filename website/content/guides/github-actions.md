+++
title = "Gate a Hugo pull request"
description = "Build and serve each PR, check production routes against it, and keep the HTML report."
weight = 30
+++

Save this as `.github/workflows/website-regression.yml` in your Hugo project. Set `PRODUCTION_SITEMAP` to your live sitemap. This example uses Hugo 0.131.0 on a standard x64 Ubuntu runner. Use the Hugo version and build flags your project requires, and install any theme or asset dependencies before building.

~~~yaml
name: Website regression

on: [pull_request]

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: '0.131.0'
      PRODUCTION_SITEMAP: https://example.com/sitemap.xml
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Build the website
        run: |
          curl -fsSL "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" \
            | tar -xz -C "$RUNNER_TEMP" hugo
          "$RUNNER_TEMP/hugo" --destination public
      - name: Serve the build and check routes
        run: |
          python3 -m http.server 8000 --bind 127.0.0.1 --directory public > "$RUNNER_TEMP/site.log" 2>&1 &
          trap 'kill "$!"' EXIT
          curl --fail --silent --show-error --retry 10 --retry-delay 1 --retry-connrefused \
            http://127.0.0.1:8000/ > /dev/null
          npx --yes sireg@1.1.0 check \
            --sitemap "$PRODUCTION_SITEMAP" \
            --origin http://127.0.0.1:8000 \
            --strategy random --limit 25 --seed "$GITHUB_SHA" \
            --expect-status 200 \
            --report console --html reports/sireg.html
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: sireg-report
          path: reports/sireg.html
          if-no-files-found: ignore
~~~

Each PR run samples up to 25 routes and fails if any selected route fails its expected status. To check every route, remove the three sampling flags. To guarantee a few routes from each section, add a separate [curated route check]({{< relref "smoke-tests#cover-critical-sections-every-time" >}}).

The example assumes the generated site is served at the origin root. If production uses a path prefix such as `/docs/`, serve the build at that same prefix. To require the check before merge, add it to your branch protection or ruleset.
