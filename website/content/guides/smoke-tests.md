+++
title = "Run a smoke test"
description = "Sample a large sitemap or check a curated set of routes from every important section."
weight = 20
+++

## Sample the sitemap

Use a limit and seed to get a repeatable sample from the same ordered URL list.

~~~bash
npx --yes sireg@1.1.0 check \
  --sitemap https://example.com/sitemap.xml \
  --origin http://127.0.0.1:8000 \
  --strategy random --limit 25 --seed local-smoke
~~~

sireg discovers the full sitemap tree before selecting its sample. Change the seed to vary coverage. In CI, a commit SHA changes the sample across commits and keeps it repeatable for retries with the same input.

## Cover critical sections every time

Commit a `critical-urls.txt` file with routes you always want to exercise.

~~~text
https://example.com/blog/
https://example.com/blog/your-most-read-post/
https://example.com/industry/
https://example.com/industry/healthcare/
https://example.com/about/
https://example.com/about/team/
~~~

~~~bash
npx --yes sireg@1.1.0 check --file critical-urls.txt \
  --origin http://127.0.0.1:8000 --expect-status 200
~~~

The file checks every listed URL. Run it separately from the random sample so a random draw cannot omit a critical route. The sample may revisit some of the curated URLs. Automatic quotas by pathname are planned.

Pair fast PR checks with a scheduled full sweep when the site is large. Omit the sampling flags for a full sweep.
