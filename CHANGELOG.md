# Change Log

This file keeps track of all changes to this project. This project follows [semantic versioning](http://semver.org/) and [keeps a change log](http://keepachangelog.com/).

> Please [view this change log on the master branch](https://github.com/FaKeller/sireg/blob/master/CHANGELOG.md), as otherwise it is probably outdated.


## [UNRELEASED]


## v1.0.0 - 2026-07-04

### Added
- Add a modern `sireg check` CLI for sitemap-driven website regression testing.
- Add hosted sitemap, local sitemap file, nested sitemap index, `.xml.gz`, URL file, and direct URL inputs.
- Add URL transforms so production sitemap URLs can be checked against local, preview, or staging hosts.
- Add full, first, deterministic random, and percent-based URL selection for large sites.
- Add status expectations for `2xx`, `30x`, exact codes, ranges, comma-separated lists, and arrays.
- Add redirect expectation checks for retired URLs, including validation that the final target is healthy.
- Add CLI, JSON, Markdown, and polished HTML reports suitable for CI artifacts.
- Add interactive CLI progress with a spinner, progress bar, elapsed time, and live pass/fail stats.
- Add a typed npm package API with progress events for custom integrations.
- Add GitHub Actions CI, tag-driven GitHub Releases, npm publishing with provenance, and release validation.
- Add `npm run release:prepare -- major|minor|patch` to finalize changelog entries, bump versions, commit, tag, and push releases.
- Add project memory and an agent release command so future agents consistently preserve the project goals and release process.

### Changed
- Rewrite the legacy Node 8 TypeScript implementation as a modern TypeScript ESM package for Node.js 20 and newer.
- Replace the old dependency-heavy request, RxJS, Inversify, TSLint, Travis, and Yarn stack with native platform APIs, `node:test`, GitHub Actions, and npm lockfiles.
- Redesign the public configuration around `sireg.schema.json`, focused docs, and examples for local development, preview environments, staging checks, and GitHub Actions.


## v0.3.1 - 2017-11-11

### Feature
- Improve project setup to be able to install sireg with npm: `npm install sireg` or `yarn add sireg`.


## v0.3.0 - 2017-10-28

### Feature
- sireg can now be invoked with `sireg exec [--opts]` by specifying all relevant test suite config settings as CLI options.

### Changed
- Refactoring: all internal classes have been completely refactored to improve the overall architecture.
- BC: config setting `testCase` is renamed to `testSuite`.
- BC: renamed `filePath` properties for CSVLoader and FileLoader to `path`. 


## v0.2.2 - 2017-09-13

Maintenance Release - updating deployment pipeline.


## v0.2.1 - 2017-09-13

Maintenance Release - updating deployment pipeline.


## v0.2.0 - 2017-08-28

### Added
- CSV loader
- Beta: redirect tests by setting expected urls and status code  


## v0.1.1 - 2017-08-11

### Added
- Added `Reporter`s that are capable of reporting the result of a regression test case.
- Added `settings` in test case configuration to customize tool parameters


## v0.1.0 - 2017-08-10

### Added
- Big architecture refactoring opening extension points through a DI container. It is now possible to add custom strategies to the tool by defining them in the DI container.

### Changed
- BC: `replacements` are now called `replacers` to be consistent with the other names.
- BC: CLI changed from `sireg <config>` to `sireg test <config>`. 

### Fixed
- Parallel processing of HTTP requests now works as it should.
- HTTPS support


## v0.0.1 - 2017-08-06

### Added
- Initial release 
- Basic support for loaders and replacements
- JSON schema support
