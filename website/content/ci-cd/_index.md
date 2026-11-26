+++
title = "CI/CD"
+++

Choose where to run sireg based on how your site is built and deployed.

| What you want to verify | Where to run sireg | Pick a workflow |
| --- | --- | --- |
| Each PR already gets a preview and you want to test routing and responses on the actual hosting platform | On the deployment-specific preview URL | [Netlify]({{< relref "/ci-cd/netlify" >}}) or [Vercel]({{< relref "/ci-cd/vercel" >}}) |
| Your site builds to static files, or you need a required check that can run on fork PRs without provider secrets | Build and serve the site inside GitHub Actions | [Hugo]({{< relref "/ci-cd/hugo" >}}), [Astro]({{< relref "/ci-cd/astro" >}}), [Jekyll]({{< relref "/ci-cd/jekyll" >}}), or [Next.js static export]({{< relref "/ci-cd/nextjs" >}}) |
| Your host refreshes or deploys a shared WordPress staging site | On staging after the host finishes the refresh | [WordPress staging]({{< relref "/ci-cd/wordpress" >}}) |

## Use the reusable workflows

The examples call workflows from the sireg repository. Copy the example for your platform and set its `sitemap` input. The example references `@master`. You can pin the workflow to a commit SHA for repeatable runs.

- Use `FaKleiser/sireg/.github/workflows/sireg.yml@master` for a site with a known `origin` or for a static build. For static builds, upload the output directory as an artifact from a build job in the same run, then pass its name as `site-artifact`. Set `site-prefix` to the deployment path, such as `/docs`, when the site lives below the domain root.
- Use `sireg-netlify.yml` or `sireg-vercel.yml` for same-repository PRs when the origin needs to be discovered. The reusable workflow waits for the deployment for the exact head commit and calls the shared route check. See the provider guide for inputs and API credentials.

## Choose coverage and require the check

Each workflow runs sireg 1.1.0 and expects a direct HTTP `200` for each selected route. By default, it samples up to 25 routes using the PR head SHA or the workflow run’s commit SHA. Set `limit: 0` under `with` to check the entire sitemap. The job prints a console summary and uploads an HTML report whenever one is generated, including after failed route checks. Find it under **Artifacts** on the workflow run.

Once the job has run, add its status check to your GitHub branch protection rule or ruleset. Use a runner-local workflow as the required check for repositories that accept fork PRs. Provider API credentials are available to the preview discovery job for PRs from the same repository.

## Run a committed test suite

Use a custom job for a [committed test suite]({{< relref "/guides/define-a-test-suite" >}}) with explicit redirects, route selection rules, or multiple sources. Check out the repository, set up Node.js, and run the suite against the target configured in the file.

~~~bash
npx --yes sireg@1.1.0 check --config sireg.config.json --report console --html reports/sireg.html
~~~

Use the [origin transform]({{< relref "/reference/transforms" >}}) to replay sitemap routes against that target. Explicit [redirect expectations]({{< relref "/reference/redirects" >}}) use their own URLs, so configure their `from` and destination values for the environment being tested.
