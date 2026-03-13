# Tasks: Foundation Setup (Intent 002)

**Spec**: `/specs/002-foundation-setup/spec.md` | **Plan**: `/specs/002-foundation-setup/plan.md`
**Test Specs**: `.feature` files in `/specs/002-foundation-setup/tests/features/`
**Total Tasks**: 29 | **Critical Path**: Setup (T001-T002) → P1 Stories (T004-T014) → P2 Stories (T015-T026) → Polish (T031-T033)

---

## Approach

This foundation phase establishes the complete Debussy development ecosystem:

1. **Setup Phase** (T001-T002): Project structure, configuration, and test infrastructure
2. **P1 User Stories** (T004-T014): Developer workflow, testing, npm distribution (blocking features)
3. **P2 User Stories** (T015-T026): Theming, welcome page, navigation (UX polish)
4. **Theme API** (T029): Theme API endpoint (localStorage-backed; session/workflow APIs deferred)
5. **Polish Phase** (T031-T033): README documentation, theming docs, and final integration testing

Each story is **independently tested** via `.feature` files (Gherkin scenarios with test IDs: TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-007, TS-008, TS-009, TS-010, TS-011, TS-012, TS-013, TS-014, TS-015, TS-016, TS-017, TS-018). Tasks are ordered to enable parallel work where possible (same story, different components).

---

## Phase 1: Setup

Foundation setup: project structure, config, and test framework.

- [x] T001 Create base project structure with Nuxt 4 scaffold in pages/, components/, server/, types/, and tests/ directories
- [x] T002 Configure Vitest 3.2 with vitest.config.ts, test discovery, coverage reporting, and npm scripts (npm test, npm test:coverage)

**Dependencies**: T001 → T002
**Critical Path**: T001 must complete before T002 can start

---

## Phase 2: P1 User Stories

High-priority stories that define the core developer experience.

### User Story 1: Developer Quick Start (US-001)

Tests: TS-001 (dev server launches in <5s), TS-002 (HMR works), TS-003 (command from any subdirectory)

- [x] T004 [US1] Configure npm scripts in package.json: `npm run dev` (nuxt dev), `npm run build` (nuxt build), `npm start` (nitro start) per dev-server.contract.md
- [x] T005 [P] [US1] Set up Nuxt dev server hot module reloading (HMR) in nuxt.config.ts with reasonable defaults (>= <1s feedback per plan)
- [x] T006 [P] [US1] Create health check endpoint (GET /api/health) to verify server readiness and test TS-001 scenario

**Dependencies**: T004 → T005, T004 → T006
**Parallel Opportunity**: T005 and T006 can run in parallel after T004

---

### User Story 2: Automated Testing and Quality Gates (US-002)

Tests: TS-004 (npm test passes), TS-005 (error messages are clear), TS-006 (test discovery works)

- [x] T007 [US2] Write Vitest setup file with Vue component testing utilities, test globals, and coverage configuration per testing-quality.contract.md
- [x] T008 [P] [US2] Create example unit test file (src/utils/example.test.ts) demonstrating test patterns: component rendering, mocking, assertions, async tests
- [x] T009 [P] [US2] Create example integration test (server/api/health.test.ts) demonstrating API testing: route handling, response validation
- [x] T010 [US2] Configure coverage thresholds in vitest.config.ts: lines >= 70%, branches >= 60%, functions >= 70% per SC-004

**Dependencies**: T002 → T007, T007 → T008, T007 → T009, T007 → T010
**Parallel Opportunity**: T008, T009, T010 can run in parallel after T007

---

### User Story 3: Global Distribution via npm (US-003)

Tests: TS-007 (npx debussy runs), TS-008 (executable launches), TS-009 (version updates work)

- [x] T011 [US3] Create bin/debussy.cjs executable entry point with Nitro standalone build command per distribution.contract.md
- [x] T012 [P] [US3] Update package.json with metadata: name, version, description, repository, homepage, bin field pointing to bin/debussy.cjs, and prepublish script (npm run build)
- [x] T013 [P] [US3] Create .npmignore file to exclude source, test, and build artifacts; include only dist/ and bin/ in npm package
- [x] T014 [US3] Test local npm distribution: verify `npm pack` generates tarball, extract it, run bin/debussy.cjs from clean environment (simulates npx behavior)

**Dependencies**: T001 → T011, T011 → T012, T012 → T013, T012 → T014
**Parallel Opportunity**: T013 and T014 can run after T012

---

## Phase 3: P2 User Stories

Visual polish and UX enhancements.

### User Story 4: Customizable Appearance (US-004)

Tests: TS-010 (light/dark mode switches), TS-011 (custom colors apply), TS-012 (no page reload on theme change)

- [x] T015 [P] [US4] Define design tokens in src/types/theme.ts: color palette, typography scale, spacing units; export as TypeScript constants
- [x] T016 [P] [US4] Create src/app.config.ts (Nuxt AppConfig) to expose theme tokens and Tailwind configuration
- [x] T017 [P] [US4] Configure Tailwind CSS 4 in tailwind.config.ts to use design tokens from app.config; add light/dark mode selectors
- [x] T018 [US4] Create useTheme() composable in src/composables/useTheme.ts: reactive theme switching, localStorage persistence, CSS variable application
- [x] T019 [P] [US4] Create ThemeToggle.vue component with light/dark/system mode buttons; test theme change and persistence per theme.contract.md
- [x] T020 [P] [US4] Update app.vue root layout to initialize theme on mount via useTheme(), wrap content with theme provider (data-theme attribute)

**Dependencies**: T015 → T016, T016 → T017, T016 → T018, T018 → T019, T018 → T020, T017 → T019, T017 → T020
**Parallel Opportunity**: T015, T016 are sequential; T017, T018, T019, T020 have multiple parallel paths

---

### User Story 5: Polished First Impression (US-005)

Tests: TS-013 (welcome page loads), TS-014 (CTAs navigate correctly), TS-015 (mobile layout works)

- [x] T021 [P] [US5] Create welcome page (pages/index.vue) with: hero headline, three feature callouts (Sessions, Workflows, Artifacts), primary CTA ("New Session"), secondary CTA ("View Workflows"), responsive layout per welcome-page.contract.md
- [x] T022 [P] [US5] Create session cards component (SessionCard.vue) showing session label, status, workflow count; re-used on welcome and session pages

**Dependencies**: T020 → T021 (theme provider must be ready), T021 → T022
**Parallel Opportunity**: T022 can start after T021

---

### User Story 6: Unified Navigation (US-006)

Tests: TS-016 (nav links work), TS-017 (active page highlights), TS-018 (layout is consistent across pages)

- [x] T023 [P] [US6] Create AppNavigation.vue component with: header with logo/title, sidebar with links (Sessions, Workflows, Artifacts), hamburger menu for mobile, active page highlighting via `$route.name` per navigation.contract.md
- [x] T024 [P] [US6] Create stub pages: pages/sessions.vue, pages/workflows.vue, pages/artifacts.vue with placeholder content and shared layout
- [x] T025 [P] [US6] Create default layout (layouts/default.vue) that wraps AppNavigation + page content; ensure navigation persists across page transitions
- [x] T026 [US6] Update app.vue to use default layout and initialize navigation state (active page tracking)

**Dependencies**: T020 → T023 (theme must be ready), T023 → T024, T023 → T025, T025 → T026
**Parallel Opportunity**: T024, T025 can run in parallel after T023

---

## Phase 4: Theme API

Theme API endpoint (localStorage-backed). Session/workflow API routes deferred to later intents.

- [x] T029 [P] Create Nitro API routes for theme: GET /api/theme (read current theme), POST /api/theme (update theme) with persistence to localStorage per theme.contract.md

**Dependencies**: T018 → T029 (useTheme composable must exist before theme API)
**Note**: T027 (sessions API), T028 (workflows API), T030 (database service) deferred — see Clarifications

---

## Phase 5: Polish & Integration

Documentation, testing, and final integration.

- [x] T031 [P] [TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-007, TS-008, TS-009, TS-010, TS-011, TS-012, TS-013, TS-014, TS-015, TS-016, TS-017, TS-018] Write and run all 18 test scenarios (via npm test): ensure every .feature file passes locally with step definitions implemented in tests/step_definitions/ (or Vitest BDD runner equivalent per testing framework)
- [x] T032 Create README.md documenting: project purpose, setup (npm install), dev workflow (npm run dev), testing (npm test), build (npm run build), distribution (npm publish), troubleshooting per SC-010
- [x] T033 [FR-201] Write theming documentation in `docs/theming.md`: explain design token structure, how to customize colors (primary, secondary, background), how to add new theme variants, and examples of using theme tokens in Vue components

**Dependencies**: T004 → T031, T010 → T031, T021 → T031, T026 → T031, T020 → T033
(All major features must be ready before final integration testing; T033 requires theme system complete)

---

## Dependency Graph Summary

```
Setup Phase
├── T001 (structure)
└── T002 (Vitest) ← T001

P1 Stories
├── US1: T004 → T005, T006
├── US2: T007 → T008, T009, T010
└── US3: T011 → T012 → T013, T014

P2 Stories
├── US4: T015 → T016 → T017, T018 → T019, T020
├── US5: T021 ← T020, T022 ← T021
└── US6: T023 ← T020, T024, T025 ← T023, T026 ← T025

Theme API
└── T029 ← T018

Polish & Integration
├── T031 ← [all major tasks]
├── T032 ← [all features]
└── T033 ← T020 (theme system)
```

---

## Critical Path & Parallelization

**Critical Path** (longest chain): T001 → T002 → T007 → T020 → T023 → T026 → T031 (8 sequential tasks)

**Parallel Batches**:
- **Batch 1**: T001 (1 task)
- **Batch 2**: T002 (1 task)
- **Batch 3**: T004, T007, T011 (3 parallel) — start P1 stories in parallel
- **Batch 4**: T005, T006, T008, T009, T010, T012, T013 (7 parallel) — parallelize within stories
- **Batch 5**: T014, T015, T016 (3 parallel)
- **Batch 6**: T017, T018 (2 parallel)
- **Batch 7**: T019, T020, T021 (3 parallel) — theme and pages
- **Batch 8**: T022, T023, T029 (3 parallel) — T029 unblocked once T018 is ready
- **Batch 9**: T024, T025 (2 parallel)
- **Batch 10**: T026 (1 task)
- **Batch 11**: T031, T032, T033 (3 parallel) — final testing, README, and theming docs

---

## MVP Scope

For a minimal first delivery (can merge after):
1. ✅ Setup + P1 stories (T001-T002, T004-T014) = working dev experience + tests + npm distribution
2. ⏸️ Skip P2 stories (T015-T026) = defer visual polish for Intent 002b
3. ✅ Theme API (T029) = lightweight; no SQLite required (localStorage-backed)
4. ⏸️ Skip final polish (T031-T032) = minimal README

Session/workflow API (T027, T028) and database layer (T030) are deferred to a later intent.
This delivers the developer experience and distribution mechanism, unblocking higher intents.

---

## Notes

- **Test-First Development**: Every story has `.feature` files (TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-007, TS-008, TS-009, TS-010, TS-011, TS-012, TS-013, TS-014, TS-015, TS-016, TS-017, TS-018). Write step definitions and implement code to pass, don't modify `.feature` files (assertion integrity per CONSTITUTION.md).
- **File Paths**: All source paths assume standard Nuxt 4 structure (pages/, components/, server/, types/). Adjust if project uses different layout.
- **Time Estimates**: Not included per Claude Code project instructions (focus on WHAT not duration).
- **Assertion Hash**: context.json contains immutable hash of all test assertions. Do not modify `.feature` files directly.
- **Deferred Data Layer**: T003 (SQLite schema), T027 (sessions API), T028 (workflows API), T030 (database service) are deferred to a later intent. Stub pages (T024) display placeholder content; no live data required in this foundation phase.

## Clarifications

### Session 2026-03-11

- Q: Spec says "No persistent data entities for this foundation phase" but plan defines Session+Workflow SQLite models and tasks T003/T027/T028/T030 implement the full data layer — which wins? -> A: Remove data layer from this intent. T003, T027, T028, T030 deferred to a later intent. T029 (theme API, localStorage-backed) is retained. Stub pages return placeholder content only. [T003, T027, T028, T029, T030, T024]
- Q: FR-201 (document theming approach) has no task — where should theming docs live and when? -> A: Add T033 in this intent — write `docs/theming.md` covering design token structure, color customization, adding theme variants, and component examples. Depends on T020 (theme system complete). [FR-201, T033, T020, T031]
- Q: FR-101 (build command) has no Gherkin scenario — add one, accept as manual gate, or fold into T014? -> A: Add TS-019 build scenario to `distribution.feature`. Scenario: Given deps installed / When `npm run build` / Then output appears in `.output/` with no errors. Requires `/iikit-04-testify` re-run to register TS-019 in context.json. T031 will cover TS-019 once generated. [FR-101, T031, T014]
