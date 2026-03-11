# Tasks: Foundation Setup (Intent 002)

**Spec**: `/specs/002-foundation-setup/spec.md` | **Plan**: `/specs/002-foundation-setup/plan.md`
**Test Specs**: `.feature` files in `/specs/002-foundation-setup/tests/features/`
**Total Tasks**: 32 | **Critical Path**: Setup (T001-T003) → P1 Stories (T004-T021) → P2 Stories (T022-T030) → Polish (T031-T032)

---

## Approach

This foundation phase establishes the complete Debussy development ecosystem:

1. **Setup Phase** (T001-T003): Project structure, configuration, and test infrastructure
2. **P1 User Stories** (T004-T021): Developer workflow, testing, npm distribution (blocking features)
3. **P2 User Stories** (T022-T030): Theming, welcome page, navigation (UX polish)
4. **Polish Phase** (T031-T032): README documentation and final integration testing

Each story is **independently tested** via `.feature` files (Gherkin scenarios with test IDs: TS-001 through TS-018). Tasks are ordered to enable parallel work where possible (same story, different components).

---

## Phase 1: Setup

Foundation setup: project structure, config, SQLite, and test framework.

- [x] T001 Create base project structure with Nuxt 4 scaffold in pages/, components/, server/, types/, and tests/ directories
- [x] T002 Configure Vitest 3.2 with vitest.config.ts, test discovery, coverage reporting, and npm scripts (npm test, npm test:coverage)
- [x] T003 [P] Initialize SQLite schema with better-sqlite3: sessions table, workflows table, indices per data-model.md

**Dependencies**: T001 → T002, T001 → T003
**Critical Path**: T001 must complete before T002 and T003 can start

---

## Phase 2: P1 User Stories

High-priority stories that define the core developer experience.

### User Story 1: Developer Quick Start (US-001)

Tests: TS-001 (dev server launches in <5s), TS-002 (HMR works), TS-003 (command from any subdirectory)

- [x] T004 [US-001] Configure npm scripts in package.json: `npm run dev` (nuxt dev), `npm run build` (nuxt build), `npm start` (nitro start) per dev-server.contract.md
- [x] T005 [P] [US-001] Set up Nuxt dev server hot module reloading (HMR) in nuxt.config.ts with reasonable defaults (>= <1s feedback per plan)
- [ ] T006 [P] [US-001] Create health check endpoint (GET /api/health) to verify server readiness and test TS-001 scenario

**Dependencies**: T004 → T005, T004 → T006
**Parallel Opportunity**: T005 and T006 can run in parallel after T004

---

### User Story 2: Automated Testing and Quality Gates (US-002)

Tests: TS-004 (npm test passes), TS-005 (error messages are clear), TS-006 (test discovery works)

- [ ] T007 [US-002] Write Vitest setup file with Vue component testing utilities, test globals, and coverage configuration per testing-quality.contract.md
- [ ] T008 [P] [US-002] Create example unit test file (src/utils/example.test.ts) demonstrating test patterns: component rendering, mocking, assertions, async tests
- [ ] T009 [P] [US-002] Create example integration test (server/api/health.test.ts) demonstrating API testing: route handling, response validation
- [ ] T010 [US-002] Configure coverage thresholds in vitest.config.ts: lines >= 70%, branches >= 60%, functions >= 70% per SC-004

**Dependencies**: T002 → T007, T007 → T008, T007 → T009, T007 → T010
**Parallel Opportunity**: T008, T009, T010 can run in parallel after T007

---

### User Story 3: Global Distribution via npm (US-003)

Tests: TS-007 (npx debussy runs), TS-008 (executable launches), TS-009 (version updates work)

- [ ] T011 [US-003] Create bin/debussy.cjs executable entry point with Nitro standalone build command per distribution.contract.md
- [ ] T012 [P] [US-003] Update package.json with metadata: name, version, description, repository, homepage, bin field pointing to bin/debussy.cjs, and prepublish script (npm run build)
- [ ] T013 [P] [US-003] Create .npmignore file to exclude source, test, and build artifacts; include only dist/ and bin/ in npm package
- [ ] T014 [US-003] Test local npm distribution: verify `npm pack` generates tarball, extract it, run bin/debussy.cjs from clean environment (simulates npx behavior)

**Dependencies**: T001 → T011, T011 → T012, T012 → T013, T012 → T014
**Parallel Opportunity**: T013 and T014 can run after T012

---

## Phase 3: P2 User Stories

Visual polish and UX enhancements.

### User Story 4: Customizable Appearance (US-004)

Tests: TS-010 (light/dark mode switches), TS-011 (custom colors apply), TS-012 (no page reload on theme change)

- [ ] T015 [P] [US-004] Define design tokens in src/types/theme.ts: color palette, typography scale, spacing units; export as TypeScript constants
- [ ] T016 [P] [US-004] Create src/app.config.ts (Nuxt AppConfig) to expose theme tokens and Tailwind configuration
- [ ] T017 [P] [US-004] Configure Tailwind CSS 4 in tailwind.config.ts to use design tokens from app.config; add light/dark mode selectors
- [ ] T018 [US-004] Create useTheme() composable in src/composables/useTheme.ts: reactive theme switching, localStorage persistence, CSS variable application
- [ ] T019 [P] [US-004] Create ThemeToggle.vue component with light/dark/system mode buttons; test theme change and persistence per theme.contract.md
- [ ] T020 [P] [US-004] Update app.vue root layout to initialize theme on mount via useTheme(), wrap content with theme provider (data-theme attribute)

**Dependencies**: T015 → T016, T016 → T017, T016 → T018, T018 → T019, T018 → T020, T017 → T019, T017 → T020
**Parallel Opportunity**: T015, T016 are sequential; T017, T018, T019, T020 have multiple parallel paths

---

### User Story 5: Polished First Impression (US-005)

Tests: TS-013 (welcome page loads), TS-014 (CTAs navigate correctly), TS-015 (mobile layout works)

- [ ] T021 [P] [US-005] Create welcome page (pages/index.vue) with: hero headline, three feature callouts (Sessions, Workflows, Artifacts), primary CTA ("New Session"), secondary CTA ("View Workflows"), responsive layout per welcome-page.contract.md
- [ ] T022 [P] [US-005] Create session cards component (SessionCard.vue) showing session label, status, workflow count; re-used on welcome and session pages

**Dependencies**: T020 → T021 (theme provider must be ready), T021 → T022
**Parallel Opportunity**: T022 can start after T021

---

### User Story 6: Unified Navigation (US-006)

Tests: TS-016 (nav links work), TS-017 (active page highlights), TS-018 (layout is consistent across pages)

- [ ] T023 [P] [US-006] Create AppNavigation.vue component with: header with logo/title, sidebar with links (Sessions, Workflows, Artifacts), hamburger menu for mobile, active page highlighting via `$route.name` per navigation.contract.md
- [ ] T024 [P] [US-006] Create stub pages: pages/sessions.vue, pages/workflows.vue, pages/artifacts.vue with placeholder content and shared layout
- [ ] T025 [P] [US-006] Create default layout (layouts/default.vue) that wraps AppNavigation + page content; ensure navigation persists across page transitions
- [ ] T026 [US-006] Update app.vue to use default layout and initialize navigation state (active page tracking)

**Dependencies**: T020 → T023 (theme must be ready), T023 → T024, T023 → T025, T025 → T026
**Parallel Opportunity**: T024, T025 can run in parallel after T023

---

## Phase 4: API & Database Integration

Core data layer: sessions, workflows, and theme API endpoints.

- [ ] T027 [P] Create Nitro API routes for sessions: GET /api/sessions (list), GET /api/sessions/:id (detail), with pagination, filtering, error handling per sessions-api.contract.md
- [ ] T028 [P] Create Nitro API routes for workflows: GET /api/workflows/:sessionId (list workflows by session), with error handling per workflows-api.contract.md
- [ ] T029 [P] Create Nitro API routes for theme: GET /api/theme (read current theme), POST /api/theme (update theme) with persistence to localStorage per theme.contract.md
- [ ] T030 [P] Create database service layer (src/server/db/index.ts) with functions: getSession, getSessions, createSession, getWorkflows, createWorkflow; wrap SQLite operations with error handling

**Dependencies**: T003 → T027, T003 → T028, T003 → T029, T003 → T030, T030 → T027, T030 → T028, T030 → T029
**Parallel Opportunity**: T027, T028, T029 can run in parallel after T030 is ready

---

## Phase 5: Polish & Integration

Documentation, testing, and final integration.

- [ ] T031 [P] [TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-007, TS-008, TS-009, TS-010, TS-011, TS-012, TS-013, TS-014, TS-015, TS-016, TS-017, TS-018] Write and run all 18 test scenarios (via npm test): ensure every .feature file passes locally with step definitions implemented in tests/step_definitions/ (or Vitest BDD runner equivalent per testing framework)
- [ ] T032 Create README.md documenting: project purpose, setup (npm install), dev workflow (npm run dev), testing (npm test), build (npm run build), distribution (npm publish), theme customization, troubleshooting per SC-010

**Dependencies**: T004 → T031, T010 → T031, T021 → T031, T026 → T031, T030 → T031
(All major features must be ready before final integration testing)

---

## Dependency Graph Summary

```
Setup Phase
├── T001 (structure)
├── T002 (Vitest) ← T001
└── T003 (SQLite) ← T001

P1 Stories
├── US-001: T004 → T005, T006
├── US-002: T007 → T008, T009, T010
└── US-003: T011 → T012 → T013, T014

P2 Stories
├── US-004: T015 → T016 → T017, T018 → T019, T020
├── US-005: T021 ← T020, T022 ← T021
└── US-006: T023 ← T020, T024, T025 ← T023, T026 ← T025

API & Database
├── T027 ← T030
├── T028 ← T030
└── T029 ← T030, T030 ← T003

Polish & Integration
└── T031 ← [all major tasks], T032 ← [all features]
```

---

## Critical Path & Parallelization

**Critical Path** (longest chain): T001 → T002 → T007 → T020 → T023 → T026 → T031 (8 sequential tasks)

**Parallel Batches**:
- **Batch 1**: T001 (1 task, ~2h)
- **Batch 2**: T002, T003 (2 parallel, ~3h)
- **Batch 3**: T004, T007, T011 (3 parallel, ~4h) — start P1 stories in parallel
- **Batch 4**: T005, T006, T008, T009, T010, T012, T013 (7 parallel, ~6h) — parallelize within stories
- **Batch 5**: T014, T015, T016 (3 parallel, ~3h)
- **Batch 6**: T017, T018 (2 parallel, ~3h)
- **Batch 7**: T019, T020, T021, T030 (4 parallel, ~5h) — theme, pages, database layer
- **Batch 8**: T022, T023 (2 parallel, ~3h)
- **Batch 9**: T024, T025, T027, T028, T029 (5 parallel, ~4h)
- **Batch 10**: T026 (1 task, ~1h)
- **Batch 11**: T031, T032 (2 parallel, ~3h) — final testing and docs

**Estimated Total Duration**: ~37h sequential, ~13h if fully parallelized (assuming independent developers)

---

## MVP Scope

For a minimal first delivery (can merge after):
1. ✅ Setup + P1 stories (T001-T014) = working dev experience + tests + npm distribution
2. ⏸️ Skip P2 stories (T015-T026) = defer visual polish for Intent 002b
3. ⏸️ Skip API/Database (T027-T030) = stub API returns empty data (will be filled by Intent 001 enhancement)
4. ⏸️ Skip final polish (T031-T032) = minimal README

This delivers the developer experience and distribution mechanism, unblocking higher intents.

---

## Notes

- **Test-First Development**: Every story has `.feature` files (TS-001 through TS-018). Write step definitions and implement code to pass, don't modify `.feature` files (assertion integrity per CONSTITUTION.md).
- **File Paths**: All source paths assume standard Nuxt 4 structure (pages/, components/, server/, types/). Adjust if project uses different layout.
- **Time Estimates**: Not included per Claude Code project instructions (focus on WHAT not duration).
- **Assertion Hash**: context.json contains immutable hash of all test assertions. Do not modify `.feature` files directly.
