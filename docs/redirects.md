+++
title = "Redirects"
description = "Verify that legacy routes still redirect and land on the intended destination."
weight = 60
+++

Use `redirects` for legacy URLs that visitors and search engines still request after a route is renamed or removed. A current sitemap usually omits those URLs, so list them explicitly. A redirect expectation runs independently of source discovery and sampling.

## Redirect properties

| Field | Default | Meaning |
| --- | --- | --- |
| `from` | Required | Full URL of the legacy route. Use the origin of the environment you want to test. |
| `expectedStatus` | `"30x"` | Required status of the first redirect response. Use `301` to require a permanent redirect. |
| `to` | Optional | Exact final URL, including origin, path, trailing slash, and query. |
| `toPattern` | Optional | JavaScript regular expression matched against the final URL. Use anchors when the entire URL must match. |
| `finalStatus` | `"2xx"` | Required status at the end of the chain. |
| `maxRedirects` | `checks.maxRedirects` | Hop limit for this expectation. Set `1` when the legacy URL must redirect directly to the destination. |

Both destination rules must match if you set `to` and `toPattern` together. The [status-rule syntax](checks.md#status-rules) applies to `expectedStatus` and `finalStatus`. The origin transforms used for discovered pages do not apply to these fields.

## Verify a permanent redirect

~~~json
{
  "redirects": [
    {
      "from": "http://127.0.0.1:8000/old-products/",
      "to": "http://127.0.0.1:8000/products/",
      "expectedStatus": 301,
      "finalStatus": 200,
      "maxRedirects": 1
    }
  ]
}
~~~

This suite can run on its own. Use a server that applies the redirect rules you intend to ship. If a CDN handles them, test the CDN-backed deployment. A missing first redirect, a mismatched destination, or an unhealthy final response fails the check.
