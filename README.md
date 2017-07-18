# sitemap regression

[![npm](https://img.shields.io/npm/v/sitemap-regression.svg)](https://www.npmjs.com/package/sitemap-regression)
[![Travis](https://img.shields.io/travis/FaKeller/sitemap-regression.svg)](https://travis-ci.org/FaKeller/sitemap-regression)
[![npm](https://img.shields.io/npm/l/sitemap-regression.svg)](https://www.npmjs.com/package/sitemap-regression)

Because your sitemap deserves a regression test as well.

This tool helps you regression test your website based on your sitemap.
Never deploy a change to your website that breaks parts of it.
The tool reads all URLs from a sitemap and regression tests whether the URLs defined exist on another target (e.g., a staging version of your website).

**Features:**

- Load URLs from existing sitemaps or a CSV file.
- Easily specify a target server where all loaded URLs are rewritten to.
- Roll your own: the architecture of the tool makes it easy to adjust it to complex setups.
- Shipped as a single, self-contained executable for any OS.
- Easy to add to an existing build pipeline.


> **Under construction:** The tool is currently being developed, so anything may change anytime. 
> If you'd like to shape the future of the project, get in touch and open a PR :-)

## Usage

Either download a released binary or install the tool via npm with `npm install --save sitemap-regression` or `yarn add sitemap-regression`.

Then, use it as follows:

```bash
./sitemap-regression --load-sitemap "http://<PROJECT>/sitemap.xml" --target "<TARGET>"
```


## Options

TBD.


## Contributing

Open a PR :-)


## [Change Log](CHANGELOG.md)

See all changes made to this project in the [change log](CHANGELOG.md). This project follows [semantic versioning](http://semver.org/).


## [License](LICENSE)

This project is licensed under the terms of the [MIT license](LICENSE).


---

Project created and maintained by [Fabian Keller](http://www.fabian-keller.de).
