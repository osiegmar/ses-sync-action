# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Nothing yet

## [2.0.1] - 2026-09-27

### Security

- Updated `@actions/core` to 3.0.1, bundling `undici` 6.29.0 to fix multiple
  vulnerabilities (HTTP request smuggling, CRLF/header injection, WebSocket
  denial of service).
- Updated `@aws-sdk/client-sesv2` to 3.1141.0, which no longer depends on the
  vulnerable `fast-xml-parser`.

### Changed

- Updated all development dependencies to their latest versions, including
  TypeScript 6.
- Updated GitHub Actions used in workflows to their latest major versions.

## [2.0.0] - 2026-03-12

### Changed

- **Breaking:** The action now runs on Node.js 24 (`runs.using: node24`) instead
  of Node.js 20. Self-hosted runners must support the `node24` runtime. Update
  references from `@v1` to `@v2`.
- Updated `@actions/core` to 3.x and `@aws-sdk/client-sesv2` to 3.1000+.
- The bundled action is now an ES module built with Rollup.

### Removed

- Dropped the unused `async` and `mime-types` runtime dependencies.

## [1.0.2] - 2026-03-11

### Fixed

- Used SDK retry for SES rate limiting instead of manual sleep.

## [1.0.1] - 2025-01-09

### Fixed

- Increased the delay from 1000 milliseconds to 1100 milliseconds between SES
  API calls to avoid rate limiting.

### Changed

- Removed the delay for the ListTemplates operation as it is a one-time
  operation.

## [1.0.0] - 2024-11-28

### Added

- Initial release.

[Unreleased]: https://github.com/osiegmar/ses-sync-action/compare/v2.0.1...main
[2.0.1]: https://github.com/osiegmar/ses-sync-action/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/osiegmar/ses-sync-action/compare/v1.0.2...v2.0.0
[1.0.2]: https://github.com/osiegmar/ses-sync-action/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/osiegmar/ses-sync-action/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/osiegmar/ses-sync-action/releases/tag/v1.0.0
