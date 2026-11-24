+++
title = "Transformations"
description = "Turn a source URL into the target URL sireg requests."
weight = 30
+++

`transforms` is an ordered array of rules. Each rule receives the preceding rule's output. Transforms apply to discovered page URLs after source loading. For example, an origin swap leaves sitemap discovery on production and retargets the pages to your preview.

## Transformation strategies

### Replace the origin

Use `origin` when the two environments serve the same paths and queries on different hosts or ports. The rule replaces the protocol, hostname, and port. Put any path-prefix rewrite in a separate rule.

~~~json
{ "transforms": [{ "origin": "http://127.0.0.1:8000" }] }
~~~

With this rule, `https://example.com/docs/?lang=en` becomes `http://127.0.0.1:8000/docs/?lang=en`.

### Replace literal text

Use `from` and `to` for a fixed prefix or substring change. Both fields are required. The rule searches the entire URL string and replaces every occurrence by default. Set `once: true` to replace only the first occurrence.

~~~json
{
  "transforms": [
    { "from": "https://example.com/docs/", "to": "https://preview.example.com/handbook/", "once": true }
  ]
}
~~~

Including the origin in `from` narrows matches to that host string. Use a regex with an anchor when the match must occur at the start of the string.

### Replace a regular-expression match

Use `pattern` when the rewrite depends on variable path segments. Write the JavaScript regular expression without slash delimiters and double backslashes inside JSON strings. Use `replacement` for the substitution, including capture references such as `$1`. `to` is an alias used only when `replacement` is absent. If neither is provided, matching text is removed. Set `flags` to `"g"` for all matches or `"i"` for a case-insensitive match.

~~~json
{
  "transforms": [
    { "pattern": "/articles/(\\d+)/", "replacement": "/posts/$1/" }
  ]
}
~~~

## Order and scope

Apply an origin rule before a later rule that matches the new host. If transformations map distinct source URLs to the same target URL, sireg requests it once and keeps the first source URL for reporting. [Explicit redirect entries](redirects.md) use their configured origins and destinations.
