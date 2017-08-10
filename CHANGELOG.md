# Change Log

This file keeps track of all changes to this project. This project follows [semantic versioning](http://semver.org/) and [keeps a change log](http://keepachangelog.com/).

> Please [view this change log on the master branch](https://github.com/FaKeller/sitemap-regression/blob/master/CHANGELOG.md), as otherwise it is probably outdated.


## [UNRELEASED]

### Added
- Big architecture refactoring opening extension points through a DI container. It is now possible to add custom strategies to the tool by defining them in the DI container.

### Changed
- BC: `replacements` are now called `replacers` to be consistent with the other names. 

### Fixed
- Parallel processing of HTTP requests now works as it should.
- HTTPS support


## v0.0.1 - 2017-08-06

### Added
- Initial release 
- Basic support for loaders and replacements
- JSON schema support