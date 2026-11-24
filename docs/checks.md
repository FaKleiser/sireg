+++
title = "HTTP checks"
description = "Set the expected HTTP result and control request concurrency, timeouts, and redirect hops."
weight = 50
+++

sireg sends a GET request to each selected target, follows redirects, and compares the final HTTP status with `checks.expectedStatus`. It checks the response status without inspecting the body. For sites that serve an application shell with `200` for unknown routes, use a server that returns `404` for missing pages to make this check meaningful.

## Request settings

| Field | Default | When to change it |
| --- | --- | --- |
| `expectedStatus` | `"2xx"` | Use `200` when each route must serve a page with that exact response. Use `"2xx"` when other success statuses are acceptable. |
| `concurrency` | `6` | Limit the number of checks in flight. Lower it when testing a resource-limited dev server or a rate-limited deployment. Use an integer of at least 1. |
| `timeout` | `10000` | Milliseconds allowed for each HTTP request, including each hop of a redirect chain. Increase it for slow previews. Source discovery has separate request handling. |
| `maxRedirects` | `8` | Maximum hops to follow. Set it lower when unexpected chains should fail early. `0` allows a direct response and fails if following a redirect is required. |
| `userAgent` | `"sireg/1.0"` | User-Agent sent to page, redirect, and hosted source requests. Set a recognizable value if you need to identify the checks in server logs. |

~~~json
{
  "checks": { "expectedStatus": 200, "concurrency": 4, "timeout": 15000 }
}
~~~

## Status rules

| Syntax | Examples | Matches |
| --- | --- | --- |
| Exact value | `200` or `"200"` | That status only |
| Status class | `"2xx"` | `200` through `299` |
| First ten in a class | `"30x"` | `300` through `309` |
| Inclusive range | `"200-204"` | `200` through `204` |
| Alternatives | `"2xx,404"` or `["2xx", 404]` | Any listed rule |

`ok` and `success` mean `2xx`. `redirect` and `redirects` mean `30x`. The same rule syntax is available for first-hop and final status in [redirect expectations](redirects.md).

## Redirect behavior

Ordinary page checks follow redirects across origins. A local route that redirects to a live production page can pass if the final status matches. Use an explicit redirect expectation when the first status or final URL matters.
