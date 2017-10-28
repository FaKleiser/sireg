# Change Log

This file keeps track of all changes to this project. This project follows [semantic versioning](http://semver.org/) and [keeps a change log](http://keepachangelog.com/).

> Please [view this change log on the master branch](https://github.com/FaKeller/sireg/blob/master/CHANGELOG.md), as otherwise it is probably outdated.


## [UNRELEASED]

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