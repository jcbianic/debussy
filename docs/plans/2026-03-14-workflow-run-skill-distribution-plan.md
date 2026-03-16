# Plan: Distribute workflow-run via npx skills (2026-03-14)

## Goal

Make `workflow-run` installable by any Claude Code user with:

```bash
npx skills add jcbianic/debussy --skill workflow-run -a claude-code
```

## Context

Research doc: `2026-03-14-workflow-run-skill-distribution-research.md`

The skill structure already conforms to the vercel-labs/skills format. The
minimum required change (adding `name` to SKILL.md frontmatter) is already
done. Remaining tasks are about discoverability and user experience.

## Tasks

### Phase 1: Frontmatter (Done)

- [x] Add `name: workflow-run` to SKILL.md frontmatter
- [x] Add `compatibility`, `license`, `metadata.version`, `metadata.author`

### Phase 2: User-Facing Documentation

- [ ] Add `examples/` directory inside the skill with a copy of `smoke-test.yml`
  - Users installing the skill get a ready-to-run example workflow
  - Distinct from `.claude/workflows/smoke-test.yml` (development-only)
- [ ] Add `references/README.md` inside the skill with setup and usage guide
  - System requirements (Python 3, jq, bash)
  - How to write a workflow YAML
  - How to run, resume, and list runs
  - Troubleshooting tips

### Phase 3: Repo Visibility

- [ ] Ensure the debussy repo is public on GitHub (required for `npx skills add`)
- [ ] Add a top-level `skills/` symlink or note in the root README pointing at
  `.claude/skills/workflow-run/` (the CLI searches `skills/` before `.claude/skills/`)

### Phase 4: Discoverability (Optional)

- [ ] Submit to [skills.sh](https://skills.sh) directory (process unclear — may be
  automatic indexing of public GitHub repos; monitor after going public)
- [ ] Add `npx skills add jcbianic/debussy` to the debussy project README

## Verification

After completing Phase 2, validate end-to-end install in a clean directory:

```bash
mkdir /tmp/test-skill-install && cd /tmp/test-skill-install
npx skills add jcbianic/debussy --skill workflow-run -a claude-code
ls .claude/skills/workflow-run/
# Expected: SKILL.md  templates/  examples/  references/
```

## Non-Goals

- Publishing to npm (not required by vercel-labs/skills)
- Creating a separate repo for the skill (keeping it in debussy is fine)
- Automated version bumping (manual for now)
