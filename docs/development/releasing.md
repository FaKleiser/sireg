+++
title = "Releasing"
description = "Prepare a version bump and publish the same build to GitHub and npm."
weight = 20
aliases = ["/reference/releasing/"]
+++

## Prepare a release

Create a release branch from the intended base and commit the release notes under `## [UNRELEASED]` in `CHANGELOG.md`. Choose the version increment based on the changes. Use `patch` for fixes, `minor` for backward-compatible additions, and `major` for breaking changes.

~~~bash
npm run release:prepare -- patch
~~~

The command requires a clean topic branch. It finalizes the changelog, bumps both npm manifests, runs the tests and a package dry run, and commits the version bump. It then creates an annotated version tag and pushes the branch followed by the tag. Run the command when the release is ready to publish, since the tag push starts publishing. Open a pull request to bring the release commit into the default branch.

## What the release workflow publishes

The [release workflow](https://github.com/FaKleiser/sireg/blob/master/.github/workflows/release.yml) checks that the `vX.Y.Z` tag matches `package.json` and uses the corresponding changelog section for release notes. It tests and packs the package, attaches the tarball to the GitHub Release, and publishes that same tarball to npm. Use the workflow for publication so the two artifacts stay in sync.

## Trusted publishing

The workflow uses a GitHub-hosted runner with Node.js 24. npm exchanges the workflow's OIDC identity for publish access. The npm trusted publisher must name owner `FaKleiser`, repository `sireg`, workflow `release.yml`, and the `npm publish` action. In GitHub Actions, `id-token: write` enables the OIDC exchange and `contents: write` allows creation of the GitHub Release.
