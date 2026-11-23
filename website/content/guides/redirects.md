+++
title = "Verify legacy redirects"
description = "Catch lost redirects after a migration and confirm old links land on the intended page."
weight = 40
+++

Use the [sireg installation from the local guide]({{< relref "local" >}}).

Keep retired URLs in a config alongside the new site. For a preview check, use preview or local URLs in the redirect expectations. Transforms for discovered sitemap URLs leave these entries as written.

~~~json
{
  "redirects": [
    {
      "from": "http://127.0.0.1:8000/old-products/",
      "to": "http://127.0.0.1:8000/products/",
      "expectedStatus": 301,
      "finalStatus": 200
    }
  ]
}
~~~

~~~bash
node ./node_modules/sireg/dist/cli.js check --no-progress --config sireg.redirects.json
~~~

sireg checks the first redirect status, follows the chain, and checks the final URL and status. Run this against a server that applies the redirect rules used in production. A static file server cannot exercise redirects configured only at the CDN.

See the [configuration reference]({{< relref "/reference/configuration#redirects" >}}) for redirect patterns and status rules.
