# sireg - regression testing for websites

[![Travis](https://img.shields.io/travis/FaKeller/sitemap-regression.svg)](https://travis-ci.org/FaKeller/sitemap-regression)

Because your website deserves a regression test as well.

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

## Usage

Download a [released binary](/releases) and then use it as follows:

```bash
sireg test my-test-case.json
```

You may find example test case definitions in the [/examples directory](/examples).

sireg provides a [JSON schema](http://json-schema.org/) file to help you write valid test cases: [sireg-test-case.schema.json](/sireg-test-case.schema.json).
In case you are using IntelliJ, make sure to [setup IDE support for JSON schema](https://www.jetbrains.com/help/idea/json-schema.html).

## Contributing

Open a PR :-)


## [Change Log](CHANGELOG.md)

See all changes made to this project in the [change log](CHANGELOG.md). This project follows [semantic versioning](http://semver.org/).


## [License](LICENSE)

This project is licensed under the terms of the [MIT license](LICENSE).


---

Project created and maintained by [Fabian Keller](http://www.fabian-keller.de).
