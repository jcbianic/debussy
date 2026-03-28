---
name: Dependencies
icon: i-heroicons-cube
status: draft
order: 6
---

# Dependencies

## Management

- **Lock file tracking** — Commit package-lock.json
- **Minimal dependencies** — Don't add "just in case"
- **Avoid peer dependency hell** — Review dependency trees before adding

## Updates

- **Security patches** — Apply immediately
- **Minor updates** — Bundle in regular PRs
- **Major updates** — Plan separately, test thoroughly

## Audit

- **Before merge** — `npm audit` must pass
- **Workspace dependencies** — Keep ui/ and other workspaces in sync
