+++
title = "Selection"
description = "Trade runtime for coverage with a repeatable sampling strategy."
weight = 40
+++

`select` chooses which unique target URLs to check after source loading and transformation. It reduces requests to the target site. The CLI still loads the source sitemap tree first, and [explicit redirect checks](redirects.md) always run.

## Selection strategies

| Strategy | Behavior | When to use it |
| --- | --- | --- |
| `all` | Keeps URLs in discovery order. Applies `limit` if set. | Use a full pass for small sites, releases, or scheduled sweeps. |
| `first` | Keeps the first `limit` URLs in discovery order. | Use when input order reflects priority, such as a hand-ordered URL file. |
| `random` | Shuffles with `seed` and keeps up to `limit` URLs. | Use for pull requests where a fixed request budget matters. |
| `percent` | Shuffles with `seed` and keeps the specified share, rounded up. Ignores `limit`. | Use when the sample should grow as the site grows. |

## Properties

- `strategy` defaults to `"all"`.
- `limit` is a non-negative integer or `"all"`. Omit it to keep the complete set for `all`, `first`, and `random`. A limit above the number discovered uses every available URL.
- `percent` is a number from `0` to `100` and defaults to `100` when the strategy is `percent`. Fractional values are accepted. For example, `10` percent of 23 URLs selects three.
- `seed` defaults to `"sireg"`. With identical ordered input and a fixed seed, `random` and `percent` repeat the same selection. Changing the seed rotates coverage.

## Fixed-size smoke test

~~~json
{
  "select": { "strategy": "random", "limit": 25, "seed": "pull-request" }
}
~~~

A zero count or percentage skips ordinary page checks. If no redirect expectations are configured and discovery succeeds, the run can pass without probing a page. To guarantee coverage of particular routes, keep them in a separate [URL-file suite](sources.md#url-file) with full selection.
