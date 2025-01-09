# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-01-09

### Fixed

- Increased the delay from 1000 milliseconds to 1100 milliseconds between SES API calls to avoid rate limiting.

### Changed

- Removed the delay for the ListTemplates operation as it is a one-time operation.

## [1.0.0] - 2024-11-28

### Added

- Initial release.

[1.0.1]: https://github.com/osiegmar/ses-sync-action/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/osiegmar/ses-sync-action/releases/tag/v1.0.0
