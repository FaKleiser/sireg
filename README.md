![sireg - regression testing for websites](/assets/sireg-repo-banner.png)

[![Travis](https://img.shields.io/travis/FaKeller/sireg.svg)](https://travis-ci.org/FaKeller/sireg)
[![David](https://img.shields.io/david/FaKeller/sireg.svg)](https://david-dm.org/FaKeller/sireg)

This tool helps you regression test your website.
Never deploy a change to your website that breaks parts of it.
The tool performs HTTP requests to a given set of URLs and regression tests whether the status code is 200.
The tool supports rewriting the loaded URLs so that you can point the tool to a staging server in your build pipeline. 

**Features:**

- Load URLs from existing sitemaps or a text file.
- Easily specify a target server where all loaded URLs are rewritten to.
- Roll your own: the architecture of the tool makes it easy to adjust it to complex setups.
- Shipped as a single, self-contained executable for any OS.
- Easy to add to an existing build pipeline.
- JSON Schema support to setup regression test suites.


> **Under construction:** The tool is currently being developed, so anything may change anytime. 
> If you'd like to shape the future of the project, get in touch and open a PR :-)


## Table of Contents

- [Workflow](#workflow)
- [Getting Started](#getting-started)
- [sireg Test Suite](#sireg-test-suite)
- [sireg Test Suite Settings](#sireg-test-suite-settings)


## Workflow

The workflow of sireg is straight forward:

[Load URLS] :arrow_forward: [Filter URLs]* :arrow_forward: [Apply URL replacements] :arrow_forward: [Request URLs] :arrow_forward: [Report Results]

*yet to be implemented

- **Load URLs**: sireg loads a bunch of URLs you want to test. The URLs can be loaded from different locations.
- **Filter URLs**: Sometimes it is not necessary to test all URLs. Filters help to focus and reduce the testing time.
- **Apply URL replacements**: In case you want to target different URLs, use replacers to alter the loaded URLs before sireg issues the request.
- **Request URLs**: sireg requests all URLs and stores the HTTP result with all redirection steps for evaluation.
- **Report Results**: Different options to report the test results help you make use of the analysis result. 


## Getting Started

Download a [released binary](/releases) of sireg and store it in a location such that you can execute sireg from where you need it.

To get started with sireg, let's verify that all pages you list in your sitemap have a 200 status code:

```bash
$ sireg exec --loader-sitemap-sitemap "https://<DOMAIN>/sitemap.xml"
```

Now let's continue and see whether all the pages listed in your sitemap are present on your local development copy running on your computer:

```bash
$ sireg exec \
    --loader-sitemap-sitemap "https://<DOMAIN>/sitemap.xml" \
    --replacer-static-replace "https://<DOMAIN>/" \
    --replacer-static-with "http://localhost:8080/"
``` 

Start to explore sireg and see all available options with:

```bash
$ sireg exec --help
```


## sireg Test Suite

Tests executed with sireg can be defined in a test suite configuration file.
In fact, the JSON test suite file is more versatile than the `sireg exec` command.
Test suites are simple JSON files and can be executed with sireg as follows:

```bash
sireg test my-test-suite.json
```

You may find example test suite definitions in the [/examples directory](/examples).

sireg provides a [JSON schema](http://json-schema.org/) file to help you write valid test suites: [sireg-test-suite.schema.json](/sireg-test-suite.schema.json).
In case you are using IntelliJ, make sure to [setup IDE support for JSON schema](https://www.jetbrains.com/help/idea/json-schema.html).


## Loaders & Replacers

sireg currently supports the following loaders and replacers out of the box:

### Loaders

- **SitemapLoader**: Load URLs from a sitemap.
- **FileLoader**: Load URLs from a text file, line by line.

View the [documentation for all loaders](docs/loaders.md).

### Replacers

- **StaticReplacer**: Use Node's String.replace to replace parts of a URL. 

View the [documentation for all replacers](docs/replacers.md).


## sireg Test Suite Settings

The test suite may define settings which affect the execution of the tool.

```js
{
  "testSuite": "My test suite name",
  "settings": {
    // sireg settings here
  }
}
```  

- `concurrentRequests` [Default: 3] - The number of concurrent HTTP requests to execute. Make sure your server can handle the load, there is no throttling.
- `requestTimeout` [Default: 3000] - The number of milliseconds to wait for a server to send response headers (and start the response body) before aborting the request.


## Roadmap

sireg aims to support:

- [x] Testing that a bunch of URLs end up at a good status code.
- [x] Regression testing all URLs from an existing sitemap.
- [ ] Filters to limit the set of URLs that are being tested (based on heuristics, for example).
- [ ] Features to test redirect locations.
- [ ] More reporters (CSV, for example).
- [ ] Provide a crawler to make it easy to start testing existing sites.


## Contributing

Open a PR :-)


## [Change Log](CHANGELOG.md)

See all changes made to this project in the [change log](CHANGELOG.md). This project follows [semantic versioning](http://semver.org/).


## [License](LICENSE)

This project is licensed under the terms of the [MIT license](LICENSE).


---

Project created and maintained by [Fabian Keller](http://www.fabian-keller.de).
