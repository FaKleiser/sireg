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

Use the Hugo version pinned in the Pages workflow. Run `hugo server --source website` and open the local URL it prints. Before opening a pull request, build the site and verify the generated routes and internal links.

~~~bash
npm run build
hugo --source website --panicOnWarning --cleanDestinationDir
sh website/verify.sh
~~~

The verifier serves the site under `/sireg/`, the GitHub Pages project path. sireg checks the generated sitemap against that local server.
