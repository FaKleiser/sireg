+++
title = "Check a local build"
description = "Replay every route from your production sitemap against the code on your machine."
weight = 10
+++

Start the site locally so it serves the same paths as production. For a Hugo project with Python 3 installed, build and serve the static output in one terminal.

~~~bash
hugo --destination public
python3 -m http.server 8000 --bind 127.0.0.1 --directory public
~~~

In another terminal, use Node.js 20 or newer. Replace the example sitemap URL with your own.

~~~bash
npx --yes sireg@1.1.0 check \
  --sitemap https://example.com/sitemap.xml \
  --origin http://127.0.0.1:8000 \
  --expect-status 200
~~~

For example, a sitemap entry of `https://example.com/blog/hello/` is requested as `http://127.0.0.1:8000/blog/hello/`. The origin swap preserves the path and query. Child sitemaps are loaded from the original sitemap's locations.

sireg follows redirects and checks the final status against your rule. Redirects can lead to production or another host, so inspect the redirect chain if you're verifying where a page is served. Serve the static output without an app-shell fallback if you want a missing route to return 404. A status check cannot distinguish a fallback page that returns 200 from the intended page.

Use [a smoke test]({{< relref "smoke-tests" >}}) to check fewer URLs while iterating. For a deployed preview, set `--origin` to the preview's origin.


## Run with npx

Node.js 20 or newer with npm provides `npx`. `npx sireg check` runs the published package without a global install. Use `npx --yes sireg@1.1.0 check` to pin the release and skip the install prompt.

The homepage preview runs in your browser and can read only sitemaps that allow its origin through CORS. It previews up to six same-origin child files for an index. The CLI fetches sitemaps from Node.js and does not have the browser's CORS restriction.
