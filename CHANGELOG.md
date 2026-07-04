# Change Log

This file keeps track of all changes to this project. This project follows [semantic versioning](http://semver.org/) and [keeps a change log](http://keepachangelog.com/).

> Please [view this change log on the master branch](https://github.com/FaKeller/sireg/blob/master/CHANGELOG.md), as otherwise it is probably outdated.


## [UNRELEASED]

### Added
- Add a tag-driven GitHub Release and npm publishing workflow with release validation.
- Add `npm run release:prepare -- major|minor|patch` to finalize changelog entries, bump versions, commit, tag, and push releases.
- Add an agent release command so future agents consistently prepare changelog-backed releases.
- Add interactive CLI progress with a spinner, progress bar, elapsed time, and live pass/fail stats.
- Add progress events to the typed runner API for custom integrations.


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
