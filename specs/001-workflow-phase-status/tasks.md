# Tasks: Workflow Phase Status

**Input**: Design documents from `/specs/001-workflow-phase-status/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, tests/features/ ✅ (43 scenarios)

**TDD Policy**: CONSTITUTION.md Principle II is NON-NEGOTIABLE — tests MUST be written and verified to fail before any production code. Each story section lists test tasks first.

**Tech Stack**: TypeScript 5.x / Nuxt 3 / Nitro / Vitest 3.2 — all code lives under `poc/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Vitest environment and shared types — required before any test can be written

- [x] T001 Configure Vitest 3.2 for poc/ — add vitest, @vitest/coverage-v8, @nuxt/test-utils to poc/package.json devDependencies; create poc/vitest.config.ts; add "test" script
- [x] T002 [P] Define shared TypeScript types (Feature, Phase, PhaseId, PhaseStatus, FeaturesResponse, PhasesResponse, ErrorResponse) in poc/server/utils/types.ts

---

## Phase 2: Foundational — Pipeline Computation Engine

**Purpose**: Core filesystem-read logic in `poc/server/utils/pipeline.ts` — required by both API endpoints

**CRITICAL**: No API or UI work can begin until this phase is complete. TDD sequence per function: write failing tests → implement → confirm green.

### Tests (write first — must fail before T006–T008)

- [x] T003 [US1] Write failing unit tests for parseTasks(), parseChecklists(), parseConstitutionTDD() helper functions in poc/tests/unit/pipeline.test.ts [TS-007, TS-008, TS-010, TS-015, TS-038, TS-039, TS-042, TS-043]
- [x] T004 [US1] Write failing unit tests for computePipelineState() end-to-end scenarios in poc/tests/unit/pipeline.test.ts [TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-009, TS-011, TS-012, TS-013, TS-014, TS-040]
- [x] T005 [US2] Write failing unit tests for listFeatures() in poc/tests/unit/pipeline.test.ts [TS-016, TS-018, TS-019, TS-020, TS-021]

### Implementation (make tests pass — run `vitest` to confirm green after each)

- [x] T006 [US1] Implement parseTasks(), parseChecklists(), parseConstitutionTDD() in poc/server/utils/pipeline.ts (makes T003 green)
- [x] T007 [US1] Implement computePipelineState() in poc/server/utils/pipeline.ts (makes T004 green; depends on T006)
- [x] T008 [US2] Implement listFeatures() in poc/server/utils/pipeline.ts (makes T005 green)

**Checkpoint**: All 43 pipeline unit tests green — API and UI work can now begin

---

## Phase 3: User Story 2 — Select Target Feature (Priority: P1)

**Goal**: `GET /api/features` endpoint lists valid features so the UI can populate its selector

**Independent Test**: Two feature dirs under `specs/` — verify endpoint lists both with correct display names

### Tests (write first — must fail before T010)

- [x] T009 [P] [US2] Write failing integration tests for GET /api/features in poc/tests/integration/features-api.test.ts [TS-030, TS-041]

### Implementation

- [x] T010 [US2] Implement poc/server/api/features.get.ts — resolve PROJECT_ROOT, call listFeatures(), return { features } or error (depends on T008, T009)

**Checkpoint**: GET /api/features fully functional and tested

---

## Phase 4: User Story 1 — View Phase Completion Status (Priority: P1)

**Goal**: `GET /api/phases?feature=<id>` returns 8 phase objects with status computed from filesystem

**Independent Test**: Create a project with known artifacts — verify correct status for every phase

### Tests (write first — must fail before T012)

- [x] T011 [P] [US1] Write failing integration tests for GET /api/phases in poc/tests/integration/phases-api.test.ts [TS-017, TS-031, TS-032, TS-033, TS-034, TS-035, TS-037]

### Implementation

- [x] T012 [US1] Implement poc/server/api/phases.get.ts — validate `feature` query param (400/404), call computePipelineState(), return { feature, phases } (depends on T007, T011)

**Checkpoint**: GET /api/phases fully functional and tested; backend complete

---

## Phase 5: User Story 2 — Feature Selector UI (Priority: P1)

**Goal**: Workflow page shows a feature dropdown populated from `/api/features`; auto-selects when only one feature exists

### Tests (write first — must fail before T014)

- [x] T013 [P] [US2] Write failing component tests for feature selector in poc/tests/unit/workflow-feature-selector.test.ts [TS-029]

### Implementation

- [x] T014 [US2] Add feature selector dropdown to poc/pages/workflow.vue — fetch from /api/features via useFetch(), auto-select single feature, trigger phase status fetch on selection change (depends on T010, T013)

**Checkpoint**: Workflow page lists and selects features

---

## Phase 6: User Story 3 — Refresh Phase Status (Priority: P2)

**Goal**: Workflow page re-reads filesystem state on demand without server restart

### Tests (write first — must fail before T016)

- [x] T015 [P] [US3] Write failing tests for phase refresh behaviour in poc/tests/unit/workflow-refresh.test.ts [TS-022, TS-023, TS-024, TS-025]

### Implementation

- [x] T016 [US3] Add refresh button to poc/pages/workflow.vue — re-fetches /api/phases on click, no client-side cache (depends on T014, T015)

**Checkpoint**: Refresh button works; phase status reflects current filesystem state

---

## Phase 7: User Story 4 — Visual Phase Pipeline (Priority: P2)

**Goal**: Each phase is rendered as a pipeline card with distinct visual indicators per status (complete / in_progress / not_started / skipped)

### Tests (write first — must fail before T018)

- [x] T017 [P] [US4] Write failing component tests for phase pipeline cards in poc/tests/unit/workflow-pipeline.test.ts [TS-026, TS-027, TS-028]

### Implementation

- [x] T018 [US4] Implement visual phase pipeline cards in poc/pages/workflow.vue — horizontal card row with arrows; status indicators: green/checkmark (complete), amber/progress% (in_progress), gray/number (not_started), dashed/skip-icon (skipped) (depends on T016, T017)

**Checkpoint**: Full visual pipeline renders correctly for all four status values

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T019 Add performance test (SC-005) to poc/tests/integration/phases-api.test.ts — assert each /api/phases response completes within 2000 ms for a project with 10 features [TS-036]
- [x] T020 Run quickstart.md manual validation scenarios against `nuxt dev` server to confirm end-to-end correctness

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No prerequisites — start immediately
- **Foundational (Phase 2)**: Depends on T001, T002 — BLOCKS all API and UI work
- **Phase 3 (US2 API)**: Depends on T008 (listFeatures)
- **Phase 4 (US1 API)**: Depends on T007 (computePipelineState)
- **Phase 5 (US2 UI)**: Depends on T010 (features endpoint)
- **Phase 6 (US3)**: Depends on T014 (feature selector)
- **Phase 7 (US4)**: Depends on T016 (refresh)
- **Polish**: Depends on T012, T018

### Critical Path

```
T001 → T002 → T003 → T004 → T006 → T007 → T011 → T012 → T014 → T016 → T018
```

Longest chain: 10 tasks. Parallelisation reduces wall-clock time at several points (see below).

### Parallel Batches

| Batch | Tasks | Condition |
|-------|-------|-----------|
| A | T001, T002 | Immediate — different files |
| B | T009, T011, T013, T015, T017 | After T001 — all write different test files |
| C | T003, T005 | After T001+T002 — same test file, but T003 then T005 (T004 sequential between) |
| D | T010, T012 | After T008+T009 and T007+T011 respectively — different source files |

### Story Count

| Story | Tasks | Test scenarios |
|-------|-------|----------------|
| US1 – View Phase Status | T003, T004, T006, T007, T011, T012 | TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-007, TS-008, TS-009, TS-010, TS-011, TS-012, TS-013, TS-014, TS-015, TS-017, TS-031, TS-032, TS-033, TS-034, TS-035, TS-037, TS-038, TS-039, TS-040, TS-043 |
| US2 – Select Feature | T005, T008, T009, T010, T013, T014 | TS-016, TS-018, TS-019, TS-020, TS-021, TS-029, TS-030, TS-041 |
| US3 – Refresh | T015, T016 | TS-022, TS-023, TS-024, TS-025 |
| US4 – Visual Pipeline | T017, T018 | TS-026, TS-027, TS-028 |
| Cross-cutting | T001, T002, T019, T020 | TS-036, TS-042 |

**Total tasks**: 20 | **Total scenarios**: 43 | **MVP scope** (P1 only): T001–T014 (14 tasks, US1+US2 complete)
