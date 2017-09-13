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
- JSON Schema support to setup regression test cases.


> **Under construction:** The tool is currently being developed, so anything may change anytime. 
> If you'd like to shape the future of the project, get in touch and open a PR :-)

## Table of Contents

- [Workflow](#workflow)
- [Usage](#usage)
- [Available Loaders](#available-loaders)
- [Available Replacers](#available-replacers)
- [sireg Test Case Settings](#sireg-test-case-settings)

## Workflow

The workflow of the tool is straight forward:

:arrow_forward: Load URLS :arrow_forward: Filter URLs* :arrow_forward: Apply URL replacements :arrow_forward: Request URLs :arrow_forward: Report Results

*yet to be implemented


## Usage

Download a [released binary](/releases) and then use it as follows:

```bash
sireg test my-test-case.json
```

You may find example test case definitions in the [/examples directory](/examples).

sireg provides a [JSON schema](http://json-schema.org/) file to help you write valid test cases: [sireg-test-case.schema.json](/sireg-test-case.schema.json).
In case you are using IntelliJ, make sure to [setup IDE support for JSON schema](https://www.jetbrains.com/help/idea/json-schema.html).


## Available Loaders

Loaders are used to setup your test.
They provide a collection of URLs to examine.

### Sitemap Loader

The sitemap loader loads all URLs from the supplied sitemap.

```json
{
  "loaders": [
    {
      "loader": "sitemap",
      "options": {
        "sitemap": "http://<DOMAIN>/sitemap.xml"
      }
    }
  ]
}
```

### File Loader

The file loader loads a set of URLs to analyze from a file.
Each line of the given file must be a valid URL.

```json
{
  "loaders": [
    {
      "loader": "file",
      "options": {
        "filePath": "path/to/urls.txt"
      }
    }
  ]
}
```


## Available Replacers

Replacers are used to modify the URLs loaded by any loader.
By modifying the URL you have the option to change the target of the HTTP requests being fired.

### Static Replacer

The static replacer replaces the exact string with the replacement provided.
This is very useful in combination with the sitemap loader!

```json
{
  "replacers": [
    {
      "replacer": "static",
      "options": {
        "replace": "http://<DOMAIN>/",
        "with": "http://localhost:8080/"
      }
    }
  ]
}
```


## sireg Test Case Settings

The test case may define settings which affect the execution of the tool.

```js
{
  "testCase": "My test case name",
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
