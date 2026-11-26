+++
title = "Local development"
description = "Build the CLI from source and verify changes before opening a pull request."
weight = 10
+++

## Build and test

With Node.js 20 or newer, install the locked dependencies and run the suite.

~~~bash
npm ci
npm test
node dist/cli.js --help
~~~

The tests build the distributable CLI in `dist/` and compile the test files to `dist-test/`. Use the CLI in `dist/` to verify a change from the same entry point the npm package ships.

## Preview the documentation

Install Hugo Extended at the version pinned in the Pages workflow, plus Python 3. From the repository root, use `hugo server --source website` for live editing. Build the site and run the same route and link checks used in CI with this command.

~~~bash
npm run docs:check
~~~

The command builds the CLI from this checkout, serves the generated site under the `/sireg/` project path, and runs sireg against its sitemap. It also checks internal links, anchors, and assets, then stops the temporary server.
