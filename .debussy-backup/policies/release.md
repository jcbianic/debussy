---
name: Release
icon: i-heroicons-rocket-launch
status: draft
order: 2
---

## Versioning

Semantic versioning (MAJOR.MINOR.PATCH):

- MAJOR — Breaking plugin API changes
- MINOR — New skills or skill commands
- PATCH — Bug fixes and non-breaking changes

## Process

1. All intents for the release must be merged to main.
2. Build the UI: `cd ui && npm run build`.
3. Commit the built `.output/` directory.
4. Tag the release: `git tag vX.Y.Z`.
5. Push tag to trigger marketplace sync.

## Deprecation

Deprecated features are announced one minor release before removal. The CHANGELOG uses Keep a Changelog categories: Added, Changed, Deprecated, Removed, Fixed, Security.
