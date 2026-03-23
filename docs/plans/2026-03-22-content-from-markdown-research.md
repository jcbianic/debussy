# Research: Migrate Hard-Coded UI Data to File-System Reading (2026-03-22)

## Problem Statement

The unified UI (issue #42) is scaffolded with rich mock data hard-coded directly
in composables. The pattern for real file reading already exists in
`server/api/strategy.get.ts`. Issue #44 extends that pattern to all remaining
data sources.

## Requirements

- Remove all static data from `useMockData.ts`, `useArchitecture.ts`, and
  `useRoadmap.ts`.
- Add Nitro API routes under `server/api/{skill}/` per ADR-004 naming convention.
- Replace static data in composables with `useFetch` / `$fetch` calls.
- Graceful empty state when files do not exist yet.
- Project name and path come from a single `server/api/config.get.ts` endpoint.
- Live-reload via SSE (`/api/watch`) triggers refresh when target markdown files
  change.

---

## Findings

### Relevant Files

| File | Purpose | Lines |
| ---- | ------- | ----- |
| `ui/composables/useArchitecture.ts` | Principles + ADRs | 35–271 |
| `ui/composables/useRoadmap.ts` | Releases + intents | 52–245 |
| `ui/composables/useMockData.ts` | Lanes, workflows, commits | 77–512 |
| `ui/server/api/strategy.get.ts` | Reference file-read pattern | 1–54 |
| `ui/server/api/watch.get.ts` | SSE chokidar watcher | 1–19 |
| `ui/server/utils/debussy.ts` | Path resolver + validators | 1–64 |
| `ui/pages/architecture.vue` | Hard-codes project name/path | 7–10 |
| `ui/pages/roadmap.vue` | Hard-codes project name/path | 9–12 |
| `ui/pages/index.vue` | Same — 7 pages total | 1–15 |
| `ui/components/AppSidebar.vue` | Hard-codes name + path | 11–16 |
| `specs/intents.md` | Flat H2 intent format | 1–end |
| `docs/decisions/001-unified-ui-tech-stack.md` | ADR format reference | 1–end |
| `.workflow-runs/<run-id>/state.json` | Workflow run state | full |

**7 pages** contain hard-coded project strings:
`index.vue`, `feature.vue`, `policy.vue`, `product.vue`, `roadmap.vue`,
`setup.vue`, `architecture.vue`

**4 components** also hard-code project strings:
`AppSidebar.vue`, `InboxListPanel.vue`, `IntentMetadata.vue`,
`RoadmapReleasesSection.vue`

---

### Existing Patterns

**`strategy.get.ts` pattern** (the template to replicate):

1. Call `resolveStrategyPath()` (uses `git worktree list --porcelain` to find
   main worktree root, falls back to `process.cwd()/../.debussy/strategy`).
2. `readdir()` the target path, filter to `.md` files — catch `ENOENT` and
   return `[]`.
3. For each file: `readFile` → `gray-matter` → validate frontmatter → return
   shaped object.
4. Sort by a predefined `ORDER` array.

**`watch.get.ts` SSE pattern**:

- `createEventStream(event)` from h3
- `chokidar.watch(path, { ignoreInitial: true })`
- Push JSON `{ event, path }` on any change
- Close watcher on `stream.onClosed`

**`resolveStrategyPath()` in `debussy.ts`**:

- Parses `git worktree list --porcelain`, takes first line as main worktree root
- Constructs path via `path.join(mainWorktree, '.debussy', 'strategy')`
- A generic `resolveDebussyPath(...segments)` helper could replace the
  skill-specific version

---

### Data Source Analysis

#### 1. Architecture Principles → `docs/architecture/principles.md`

Current shape in `useArchitecture.ts`:

```ts
{ num: string, name: string, description: string, relatedAdrs?: string[] }
```

No markdown file exists yet. A simple H2-per-principle format with frontmatter
fields `num`, `name` and `relatedAdrs` would work. Alternatively a single file
with all principles as H2 sections.

**Recommendation:** Single file `docs/architecture/principles.md` with
frontmatter per-principle is simpler. Use YAML list items or a `---`-separated
multi-document approach.

#### 2. Architecture Decision Records → `docs/decisions/adr-*.md`

`docs/decisions/001-unified-ui-tech-stack.md` already exists and has the right
structure. The `useArchitecture.ts` ADR shape expects:

```ts
{ key, id, shortTitle, title, status, date, issue?, issueLabel?,
  supersedes?, affectedPrinciples?, sections: AdrSection[] }
```

The existing ADR file uses bold-key inline frontmatter (`**Status:** Accepted`),
not YAML frontmatter. `gray-matter` requires YAML frontmatter (`---`) to parse
programmatically.

**Recommendation:** Add YAML frontmatter to existing ADR files (status, date,
issue, affectedPrinciples). Parse sections from H2 headings. Also extend
`resolveStrategyPath` with a `resolveDebussyPath()` generic helper.

#### 3. Roadmap Releases/Intents → `specs/intents.md`

`specs/intents.md` exists with a flat H2-per-intent format. It does **not** have
release grouping (`Release 1.0`, `Release 2.0`, etc.). The composable groups
intents into `Release` objects (`{ id, name, theme, intents[] }`).

Two options:

- **A)** Add YAML frontmatter to each intent with a `release` field; the API
  groups by release at read time.
- **B)** Use H1 sections for releases and H2 for intents within them.

**Recommendation:** Option A — frontmatter is more robust to parse and avoids
restructuring the existing file format too aggressively. Requires adding
`release`, `priority`, `state`, `issue` fields to each intent's frontmatter.

#### 4. Lanes, Workflow Runs, Commits → Git + `.workflow-runs/`

**Lanes** = git worktrees. Use `git worktree list --porcelain` (already used in
`debussy.ts`) to enumerate them. Each worktree line gives path and branch.

**Workflow runs** = `.workflow-runs/<run-id>/state.json`. The `state.json`
format is rich and matches the `WorkflowRun` interface well:

```json
{ "workflow": "...", "run_id": "...", "status": "...", "current_step": "...",
  "steps": { "<step-id>": { "name", "status", "review", ... } } }
```

**Commits** = `git log --oneline -20 <branch>` per worktree.

**Review groups** = items from `.workflow-runs/` with `pending_review` status
or from feedback session files.

**Recommendation:** New route `server/api/lanes/index.get.ts` that:

1. Lists worktrees via `git worktree list --porcelain`
2. For each worktree: scans `.workflow-runs/` for associated runs
3. For each worktree: runs `git log` to get recent commits
4. Returns shaped `Lane[]` with real data

#### 5. Project Config → `server/api/config.get.ts`

Hard-coded in 11 files (`"debussy"` + `"~/Projets/Libon-Data/debussy"`).
The new endpoint should return:

```json
{ "name": "debussy", "path": "/Users/jcbianic/Projets/Libon-Data/debussy" }
```

Read from `process.cwd()` (for path) and `package.json#name` at the root
worktree level. A new `useProjectConfig()` composable shared by all pages.

---

### Dependencies

- **`gray-matter`**: already installed (used by strategy.get.ts)
- **`chokidar`**: already installed (used by watch.get.ts)
- **`node:child_process`**: used in debussy.ts for git commands

No new npm dependencies needed.

---

### Technical Constraints

1. **ADR format mismatch**: existing `docs/decisions/001-*.md` uses bold-key
   inline frontmatter — needs YAML frontmatter added before it can be parsed
   by gray-matter.

2. **`specs/intents.md` format**: flat H2 per intent, no release grouping —
   YAML frontmatter needed per intent to carry `release`, `state`, `priority`.

3. **`useMockData.ts` consumed by multiple composables**: `useInbox.ts` calls
   `useMockData()`. Replacing with API calls requires either making
   `useInbox.ts` async or keeping a thin sync wrapper.

4. **SSE watcher scope**: `watch.get.ts` only watches `.debussy/strategy/`.
   Must be extended to watch `docs/decisions/`, `specs/`, `.workflow-runs/`.

5. **`reactive()` in `useRoadmap.ts`**: the releases array uses `reactive()` and
   has a `moveIntent` mutation. After migration to `useFetch`, mutations either
   need API write endpoints or become ephemeral UI state only.

6. **Principles not yet in markdown**: `docs/architecture/` only has
   `orchestration-presentation.md`. A new `principles.md` must be created.

---

### Open Questions

1. **Principles format**: single `principles.md` (all principles as H2
   sections), or one file per principle (`principle-01.md`)?

2. **`specs/intents.md` evolution**: add YAML frontmatter in place (Option A)
   or restructure to H1/H2 hierarchy (Option B)?

3. **`moveIntent` mutation in `useRoadmap.ts`**: keep as ephemeral UI state
   (no persistence) or add a write endpoint?

4. **`watch.get.ts` scope**: single watcher for all paths, or skill-scoped
   watchers at `/api/{skill}/watch`?

5. **Principles in `CONSTITUTION.md`**: the issue mentions `CONSTITUTION.md`
   as a possible target. Does that file exist or is it a future artifact?

---

## Recommendations

### Phase 1 — Config endpoint (unblocks everything)

- Add `server/utils/debussy.ts` → generic `resolveDebussyPath(...segments)`
- Create `server/api/config.get.ts` → returns `{ name, path }`
- Create `composables/useProjectConfig.ts` → `useFetch('/api/config')`
- Replace all 11 hard-coded project strings across pages + components

### Phase 2 — Architecture (low coupling, self-contained)

- Add YAML frontmatter to `docs/decisions/001-*.md` and remaining ADR files
- Create `docs/architecture/principles.md` (one H2 per principle)
- Create `server/api/architecture/principles.get.ts`
- Create `server/api/architecture/adrs.get.ts`
- Update `useArchitecture.ts` to use `useFetch` for both arrays

### Phase 3 — Roadmap (requires format decision on intents.md)

- Add YAML frontmatter to each intent in `specs/intents.md`
  (`release`, `state`, `priority`, `issue`)
- Create `server/api/roadmap/releases.get.ts` — reads intents.md,
  groups by `release` field
- Update `useRoadmap.ts` — replace `reactive([...])` with `useFetch`,
  keep computed logic intact

### Phase 4 — Lanes (most complex — requires git + file reads)

- Create `server/api/lanes/index.get.ts` — git worktrees + workflow runs
- Create `server/api/lanes/[id]/workflow.get.ts` — reads state.json
- Create `server/api/lanes/[id]/commits.get.ts` — runs `git log`
- Update `useMockData.ts` to use `useFetch` calls (or rename `useLanes.ts`)

### Phase 5 — Extend SSE watcher

- Update `server/api/watch.get.ts` to watch multiple directories
  (`docs/decisions/`, `specs/`, `.workflow-runs/`)

### Phase 6 — Cleanup

- Remove static data arrays from `useMockData.ts`, `useArchitecture.ts`,
  `useRoadmap.ts`
- Delete `useMockData.ts` or convert to type-only file
