# Plan: Migrate Hard-Coded UI Data to Markdown (2026-03-22)

## Summary

Replace all static data arrays in `useArchitecture.ts`, `useRoadmap.ts`, and
`useMockData.ts` with Nitro API routes that read markdown and JSON files from
the filesystem. Project name and path are extracted to a shared config
endpoint. Implemented in 6 phases: config, architecture, roadmap, lanes, SSE
watcher extension, and cleanup.

## Stakes Classification

**Level**: Medium

**Rationale**: Multiple files touched across the data layer, but the composable
logic (filtering, pagination, selection) stays unchanged — only the data source
swaps. Rollback is a `git revert`. Main risk is test breakage when composables
become async.

## Context

**Research**: `docs/plans/2026-03-22-content-from-markdown-research.md`

**Affected areas**:

- 3 composables: `useArchitecture.ts`, `useRoadmap.ts`, `useMockData.ts`
- 1 composable to create: `useProjectConfig.ts`
- 5 new Nitro API routes
- 1 server utility to extend: `server/utils/debussy.ts`
- 7 pages + 4 components (hard-coded project strings)
- 1 data file to create: `docs/architecture/principles.md`
- 3 ADR files to create: `docs/decisions/002-*.md` through `004-*.md`
- 1 ADR file to update: `docs/decisions/001-*.md` (add YAML frontmatter)
- 1 file to update: `specs/intents.md` (add per-intent YAML frontmatter)
- 1 server route to update: `server/api/watch.get.ts`

## Success Criteria

- [ ] No static data arrays in `useMockData.ts`, `useArchitecture.ts`,
  `useRoadmap.ts`
- [ ] All pages render with empty states on fresh clone (no crashes)
- [ ] Project name/path comes from `/api/config` in all 11 locations
- [ ] SSE live-reload triggers on changes to `docs/decisions/`, `specs/`,
  `.workflow-runs/`
- [ ] `useMockData.ts` deleted or converted to type-only file
- [ ] All existing Vitest tests pass after migration

---

## Testing Strategy

### Server routes — parser-first approach

Server route handlers are thin wrappers. Extract parsing logic as pure
functions; unit-test those functions in isolation. Route handler is verified
manually via the dev server.

### Composable migrations — mock `useFetch`

Existing tests rely on synchronous mock data. When composables switch to
`useFetch`, tests must mock the fetch call. Pattern:

```ts
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useFetch', () => vi.fn(() => ({
  data: ref(<fixture>),
  pending: ref(false),
})))
```

---

## Implementation Steps

### Phase 1: Project Config Endpoint

Unblocks all 11 hard-coded project string replacements.

#### Step 1.1: Add `resolveDebussyPath()` helper (GREEN)

- **Files**: `ui/server/utils/debussy.ts`
- **Action**: Add generic helper alongside `resolveStrategyPath()`:

  ```ts
  export async function resolveDebussyPath(
    ...segments: string[]
  ): Promise<string>
  ```

  Uses same `git worktree list --porcelain` logic; falls back to
  `process.cwd()/..`.
- **Verify**: `resolveStrategyPath()` still works (existing strategy page
  loads); no TypeScript errors (`pnpm typecheck`)
- **Complexity**: Small

#### Step 1.2: Create `server/api/config.get.ts` (GREEN)

- **Files**: `ui/server/api/config.get.ts` *(new)*
- **Action**: Read `process.cwd()` for path; read `package.json#name` from
  root worktree for name. Return `{ name: string, path: string }`.
- **Manual test cases**:
  - `curl http://localhost:3000/api/config` →
    `{ "name": "debussy", "path": "/.../debussy" }`
  - Start server from a worktree → `path` still points to main worktree
- **Verify**: `curl /api/config` returns correct JSON in dev server
- **Complexity**: Small

#### Step 1.3: Create `composables/useProjectConfig.ts` (GREEN)

- **Files**: `ui/composables/useProjectConfig.ts` *(new)*
- **Action**: `const { data } = useFetch('/api/config')` — expose `name`
  and `path` as computed refs with `''` defaults while loading.
- **Test cases** (unit — `useProjectConfig.test.ts`):
  - Mock `useFetch` returns `{ name: 'foo', path: '/bar' }` →
    `name.value === 'foo'`
  - Mock `useFetch` returns null → `name.value === ''` (no crash)
- **Verify**: Tests pass; TypeScript clean
- **Complexity**: Small

#### Step 1.4: Replace hard-coded project strings (GREEN)

- **Files**: 7 pages + `AppSidebar.vue`, `InboxListPanel.vue`,
  `IntentMetadata.vue`, `RoadmapReleasesSection.vue`
- **Action**: Replace every `"debussy"` and `"~/Projets/Libon-Data/debussy"`
  with `{{ name }}` / `{{ path }}` from `useProjectConfig()`.
- **Manual test cases**:
  - Load each page → header shows project name and path from API
  - No hard-coded strings remain: `grep -r "Projets/Libon" ui/pages ui/components`
    returns empty
- **Verify**: Grep returns no hits; pages render in browser
- **Complexity**: Medium (11 files, mechanical change)

---

### Phase 2: Architecture Data

No existing tests to break. Self-contained.

#### Step 2.1: Create `docs/architecture/principles.md` (data)

- **Files**: `docs/architecture/principles.md` *(new)*
- **Action**: Write 8 principles from `useArchitecture.ts` (lines 35–89) as
  YAML-frontmatter sections. Format per principle:

  ```markdown
  ---
  num: "1"
  name: Local first, no cloud
  relatedAdrs: [adr-001, adr-003]
  ---
  <description paragraph>
  ```

  Separate principles with `---` (multi-doc YAML).

  **Alternative**: H2 headings with a frontmatter block at top of file
  (simpler for gray-matter). Use this if multi-doc is complex.
- **Verify**: File exists and is readable with `cat`
- **Complexity**: Small (copy-paste + reformat)

#### Step 2.2: Add YAML frontmatter to ADR files

- **Files**:
  - `docs/decisions/001-unified-ui-tech-stack.md` (update)
  - `docs/decisions/002-committed-output-build.md` *(new)*
  - `docs/decisions/003-sse-file-change-events.md` *(new)*
  - `docs/decisions/004-skill-namespaced-api-routes.md` *(new)*
- **Action**: Each file gets a YAML block:

  ```markdown
  ---
  id: "001"
  shortTitle: Nuxt 4 + Nitro UI Stack
  status: Accepted
  date: 2026-03-20
  issue: https://github.com/jcbianic/debussy/issues/42
  issueLabel: "#42 — Unified Debussy UI"
  affectedPrinciples: ["2", "3"]
  ---
  ```

  ADR content (H2 sections) follows below the frontmatter block.
  ADRs 002–004 are created from the data in `useArchitecture.ts` lines
  159–271.
- **Verify**: `cat docs/decisions/001-*.md` shows `---` at top
- **Complexity**: Small (copy-paste + reformat)

#### Step 2.3: Write `parsePrinciples()` unit test (RED)

- **Files**: `ui/server/utils/architecture.test.ts` *(new)*
- **Action**: Write failing tests for a pure `parsePrinciples(raw: string)`
  function that parses the principles markdown.
- **Test cases**:
  - Valid multi-doc markdown → array with correct `num`, `name`, `description`
  - Single principle → array of length 1
  - Empty string → `[]`
  - Missing `num` field → principle skipped (with console.warn)
- **Verify**: Tests exist and fail (`pnpm test`)
- **Complexity**: Small

#### Step 2.4: Create `server/utils/architecture.ts` + principles route (GREEN)

- **Files**:
  - `ui/server/utils/architecture.ts` *(new)* — `parsePrinciples()`,
    `parseAdrs()`
  - `ui/server/api/architecture/principles.get.ts` *(new)* — thin route
    calling `parsePrinciples()`
- **Action**:
  - `parsePrinciples`: reads `docs/architecture/principles.md`, splits on
    `---`, parses frontmatter per section, returns `Principle[]`.
  - Route: `resolveDebussyPath('docs', 'architecture', 'principles.md')` →
    read file → parse → return. Catch `ENOENT` → return `[]`.
- **Verify**: Step 2.3 tests pass; `curl /api/architecture/principles`
  returns 8 principles
- **Complexity**: Medium

#### Step 2.5: Write `parseAdrs()` unit test (RED)

- **Files**: `ui/server/utils/architecture.test.ts` (extend)
- **Action**: Tests for `parseAdrs(files: string[])` that parses ADR files.
- **Test cases**:
  - Valid ADR with all fields → correct `Adr` object returned
  - ADR with only required fields → optional fields are undefined
  - File missing `status` → file skipped (with console.warn)
  - Multiple files → array sorted by `id`
  - No files → `[]`
- **Verify**: New tests fail
- **Complexity**: Small

#### Step 2.6: Create ADRs route (GREEN)

- **Files**:
  - `ui/server/utils/architecture.ts` (extend with `parseAdrs()`)
  - `ui/server/api/architecture/adrs.get.ts` *(new)*
- **Action**: `readdir(docs/decisions)` → filter `*.md` → parse frontmatter
  and H2 sections → return `Adr[]` sorted by `id`.
- **Verify**: Step 2.5 tests pass; `curl /api/architecture/adrs` returns 4
  ADRs
- **Complexity**: Medium

#### Step 2.7: Update `useArchitecture.ts` to use `useFetch` (GREEN)

- **Files**: `ui/composables/useArchitecture.ts`
- **Action**: Replace module-level `principles: Principle[]` and
  `adrs: Adr[]` arrays with:

  ```ts
  const { data: principles } = useFetch('/api/architecture/principles')
  const { data: adrs } = useFetch('/api/architecture/adrs')
  ```

  Use `computed(() => principles.value ?? [])` where arrays were used.
  Remove static data (lines 35–271).
- **Manual test cases**:
  - Architecture page loads → 8 principles visible
  - Architecture page loads → 4 ADRs visible
  - Delete `docs/architecture/principles.md` → empty state shown, no crash
- **Verify**: Architecture page renders correctly in browser
- **Complexity**: Medium

---

### Phase 3: Roadmap Data

#### Step 3.1: Add YAML frontmatter to `specs/intents.md` (data)

- **Files**: `specs/intents.md`
- **Action**: Add frontmatter to each H2 intent section. Format:

  ```markdown
  ---
  id: "001"
  release: r1
  releaseName: Release 1.0
  releaseTheme: Foundation
  state: done
  priority: now
  issue: 34
  addresses: "P1: Documentation Artifact Review Friction"
  ---
  ## 001 — Roadmap Skill Iteration
  ```

  Map each intent from `useRoadmap.ts` (lines 53–245) to its frontmatter.
  Four release groups: `r0`, `r1`, `r2`, `backlog`.
- **Verify**: File parses correctly with `gray-matter` (manual Node.js REPL
  check); no content removed
- **Complexity**: Medium (16 intents to annotate)

#### Step 3.2: Write `parseReleases()` unit test (RED)

- **Files**: `ui/server/utils/roadmap.test.ts` *(new)*
- **Action**: Tests for `parseReleases(raw: string)` — reads intents.md and
  groups intents by `release` field.
- **Test cases**:
  - Valid intents.md with 4 releases → `Release[]` of length 4
  - All intents in a release → `intent.length` correct per release
  - Intent missing `release` field → skipped with console.warn
  - Empty file → `[]`
  - Intents with `state: out-of-scope` → included in backlog release
- **Verify**: Tests exist and fail
- **Complexity**: Small

#### Step 3.3: Create `server/api/roadmap/releases.get.ts` (GREEN)

- **Files**:
  - `ui/server/utils/roadmap.ts` *(new)* — `parseReleases(raw)`
  - `ui/server/api/roadmap/releases.get.ts` *(new)*
- **Action**: Read `specs/intents.md` via `resolveDebussyPath('specs',
  'intents.md')` → parse and group by `release` → return `Release[]`.
  Catch `ENOENT` → return `[]`.
- **Verify**: Step 3.2 tests pass; `curl /api/roadmap/releases` returns
  4 releases
- **Complexity**: Medium

#### Step 3.4: Update `useRoadmap.ts` to use `useFetch` (GREEN)

- **Files**: `ui/composables/useRoadmap.ts`
- **Action**: Replace `reactive<Release[]>([...])` (lines 52–245) with:

  ```ts
  const { data: releases } = useFetch('/api/roadmap/releases')
  ```

  Keep all computed properties and mutation helpers (`moveIntent`, etc.)
  unchanged — these operate on the reactive array and work the same.
  `moveIntent` remains ephemeral UI state (no write endpoint needed).
- **Manual test cases**:
  - Roadmap page loads → releases and intents visible
  - Delete `specs/intents.md` → empty state shown, no crash
  - `moveIntent` still works within the session (ephemeral)
- **Verify**: Roadmap page renders in browser; `pnpm typecheck` passes
- **Complexity**: Medium

---

### Phase 4: Lanes, Workflow Runs, Commits

Most complex phase — requires git subprocess calls and JSON file reads.

#### Step 4.1: Write `parseLanes()` unit test (RED)

- **Files**: `ui/server/utils/lanes.test.ts` *(new)*
- **Action**: Tests for `parseLanesFromWorktrees(stdout: string)` — parses
  `git worktree list --porcelain` output into lane stubs.
- **Test cases**:
  - Single worktree (main) → one lane with `id: 'root'`, `isActive: true`
  - Two worktrees → two lanes; active = worktree matching `cwd`
  - No `branch` line → lane with `branch: 'detached'`
  - Empty stdout → `[]`
- **Verify**: Tests exist and fail
- **Complexity**: Small

#### Step 4.2: Create `server/api/lanes/index.get.ts` (GREEN)

- **Files**:
  - `ui/server/utils/lanes.ts` *(new)* — `parseLanesFromWorktrees()`,
    `loadWorkflowRunsForLane()`
  - `ui/server/api/lanes/index.get.ts` *(new)*
- **Action**:
  1. `git worktree list --porcelain` → parse worktrees → `Lane[]` stubs
  2. For each lane: scan `.workflow-runs/` for matching branch runs → attach
     pending `ReviewGroup[]` from runs with `pending_review` steps
  3. Return `Lane[]` with `groups` populated
- **Verify**: Step 4.1 tests pass; `curl /api/lanes` returns real worktree
  data
- **Complexity**: Large

#### Step 4.3: Create `server/api/lanes/[id]/workflow.get.ts` (GREEN)

- **Files**: `ui/server/api/lanes/[id]/workflow.get.ts` *(new)*
- **Action**: Map lane `id` to worktree path → scan `.workflow-runs/` for
  the most recent active run → read `state.json` → return `WorkflowRun`.
  Return `null` if no active run.
- **Manual test cases**:
  - `curl /api/lanes/root/workflow` → returns running workflow or null
  - Lane with no `.workflow-runs/` entries → returns `null`
- **Verify**: Browser shows workflow data on lane detail page
- **Complexity**: Medium

#### Step 4.4: Create `server/api/lanes/[id]/commits.get.ts` (GREEN)

- **Files**: `ui/server/api/lanes/[id]/commits.get.ts` *(new)*
- **Action**: Map lane `id` to worktree branch → run
  `git log --oneline -20 <branch>` in main worktree → parse into
  `Commit[]`.
- **Manual test cases**:
  - `curl /api/lanes/root/commits` → returns recent commits
  - Unknown lane id → returns `[]`
- **Verify**: Commits tab on lane detail page shows real history
- **Complexity**: Small

#### Step 4.5: Update `useMockData.ts` to use `useFetch` (GREEN)

- **Files**: `ui/composables/useMockData.ts`
- **Action**:
  - Replace module-level `lanes`, `workflowByLane`, etc. with
    `useFetch('/api/lanes')` etc.
  - Keep all helper functions (`getLane`, `getWorkflow`, etc.) intact.
  - Update `useInbox.test.ts` to mock `useFetch` (see testing strategy
    above).
- **Verify**: `pnpm test` passes; inbox page renders with real data
- **Complexity**: Large

---

### Phase 5: Extend SSE Watcher

#### Step 5.1: Update `server/api/watch.get.ts` (GREEN)

- **Files**: `ui/server/api/watch.get.ts`
- **Action**: Watch multiple paths instead of just `strategyPath`:

  ```ts
  const paths = await Promise.all([
    resolveStrategyPath(),
    resolveDebussyPath('docs', 'decisions'),
    resolveDebussyPath('specs'),
    resolveDebussyPath('.workflow-runs'),
  ])
  const watcher = chokidar.watch(paths, { ignoreInitial: true })
  ```

- **Manual test cases**:
  - Edit an ADR file → browser auto-refreshes architecture page
  - Edit `specs/intents.md` → browser auto-refreshes roadmap page
  - New `.workflow-runs/` entry → inbox/lane page updates
- **Verify**: File change triggers SSE event observed in browser devtools
- **Complexity**: Small

---

### Phase 6: Cleanup

#### Step 6.1: Remove static data from composables

- **Files**: `ui/composables/useArchitecture.ts`,
  `ui/composables/useRoadmap.ts`, `ui/composables/useMockData.ts`
- **Action**: Delete all module-level data arrays. Keep interfaces, types,
  and pure utility functions (`releaseStatus`, `releaseStatusColor`, etc.).
- **Verify**: `pnpm typecheck` clean; `grep -n "const lanes = \[" ui/` empty
- **Complexity**: Small

#### Step 6.2: Convert `useMockData.ts` to type-only file

- **Files**: `ui/composables/useMockData.ts`
- **Action**: Rename to `ui/composables/useLanes.ts`. Move all interfaces
  (`Lane`, `WorkflowRun`, `Commit`, `ReviewItem`, etc.) to a shared types
  file `ui/types/lanes.ts`. Update all imports.
- **Verify**: `pnpm typecheck` clean; no import errors
- **Complexity**: Small

#### Step 6.3: Final verification

- **Action**:
  1. `pnpm test` — all tests pass
  2. `pnpm typecheck` — no errors
  3. Delete `.debussy/strategy/`, `docs/decisions/`, `specs/intents.md`
     locally → all pages show empty states, no crashes
  4. Restore files; check live-reload works end-to-end
- **Verify**: All checks pass
- **Complexity**: Small

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| `useFetch` async breaks tests | Medium | Mock `useFetch` per strategy |
| `git worktree` fails | Low | Fallback to `process.cwd()` |
| `intents.md` parse errors | Low | Validate in Node REPL first |
| ADR files diverge | Low | Created from composable in 2.2 |
| `moveIntent` lost on refresh | Low | Ephemeral — no regression |

## Rollback Strategy

Each phase is independent. Any phase can be reverted with:

```bash
git revert <commit>
```

The static data in composables is not deleted until Phase 6, so any
API route failure before that point degrades gracefully.

## Status

- [x] Plan approved
- [ ] Implementation started
- [ ] Implementation complete
