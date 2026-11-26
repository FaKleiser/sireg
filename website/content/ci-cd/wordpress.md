+++
title = "WordPress staging"
description = "Check a shared staging site after the host refreshes or deploys it."
weight = 70
+++

Save the workflow as `.github/workflows/website-regression.yml`. Set `STAGING_SITEMAP` to the live sitemap served by the WordPress site or its SEO plugin. Use the staging sitemap when it carries the route inventory you want to check. To catch routes missing from staging, use the production sitemap as the inventory and keep `STAGING_ORIGIN` set to staging. WordPress core commonly serves `/wp-sitemap.xml` and SEO plugins may serve a sitemap index at `/sitemap_index.xml`. sireg follows its nested sitemaps.

Set `STAGING_ORIGIN` to the staging scheme and hostname, with a port if needed. Keep the same route paths on staging and in the sitemap. The example uses a staging site reachable from the GitHub runner.

After the workflow is on your default branch and the host finishes refreshing or deploying staging, open the workflow in GitHub Actions and click **Run workflow**. Shared staging can change between runs. It can only verify a specific PR if your host associates the staging deployment with that PR's commit.

{{< workflow "wordpress" >}}

See [coverage and committed suites]({{< relref "/ci-cd#choose-coverage-and-require-the-check" >}}) for full runs and artifact settings.
