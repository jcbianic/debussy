# Feature Specification: Workflow Phase Status

**Feature Branch**: `001-workflow-phase-status`
**Created**: 2026-03-10
**Status**: Draft
**Input**: User description: "I want my workflow page to be able to fetch the status of each phase just like the dashboard created by the iikit steps... the lookup is based on reading md files, and we should do the same."

## User Stories *(mandatory)*

### User Story 1 - View Phase Completion Status (Priority: P1)

As a developer using the Debussy workflow page, I want to see the current status of each IIKit phase so I know which phases are complete, in progress, or not yet started — without leaving the browser.

**Why this priority**: This is the core ask. Without real-time phase status, the workflow page is a static list of buttons with no awareness of what's already been done. This makes it the essential building block for all workflow orchestration.

**Independent Test**: Can be fully tested by creating a project with some IIKit artifacts present (e.g., `spec.md` and `plan.md` exist) and verifying the workflow page displays the correct status for each phase.

**Acceptance Scenarios**:

1. **Given** a project directory with `specs/<feature>/spec.md` present, **When** the workflow page loads, **Then** the "Specify" phase shows status "complete" and phases after it that have no artifacts show "not_started".
2. **Given** a project directory with `specs/<feature>/tasks.md` containing 3 of 5 tasks checked, **When** the workflow page loads, **Then** the "Implement" phase shows status "in_progress" with progress "60%".
3. **Given** a project directory with no `specs/` directory, **When** the workflow page loads, **Then** all phases show status "not_started".

---

### User Story 2 - Select Target Feature (Priority: P1)

As a developer with multiple features in `specs/`, I want to choose which feature's phase status to display so I can track the right workflow.

**Why this priority**: Without feature selection, the system cannot know which feature directory to read. This is a prerequisite for displaying meaningful status when multiple features exist.

**Independent Test**: Can be tested by having two feature directories under `specs/` and verifying the UI lets the user pick one, then displays that feature's phase status.

**Acceptance Scenarios**:

1. **Given** a project with `specs/001-auth/` and `specs/002-billing/`, **When** the workflow page loads, **Then** a feature selector lists both features.
2. **Given** the user selects "002-billing" from the feature selector, **When** the status endpoint is called, **Then** phase statuses reflect the artifacts in `specs/002-billing/`.
3. **Given** a project with only one feature directory, **When** the workflow page loads, **Then** that feature is auto-selected.

---

### User Story 3 - Refresh Phase Status (Priority: P2)

As a developer who just ran an IIKit phase in a terminal, I want to refresh the workflow page and see updated phase statuses without restarting the server.

**Why this priority**: Phase status changes when artifacts are created or modified externally. The page must re-read the filesystem on demand to stay current.

**Independent Test**: Can be tested by loading the workflow page, creating a `plan.md` file externally, clicking refresh, and verifying the "Plan" phase transitions from "not_started" to "complete".

**Acceptance Scenarios**:

1. **Given** the workflow page is open and shows "Plan" as "not_started", **When** the user creates `specs/<feature>/plan.md` externally and clicks refresh, **Then** the "Plan" phase updates to "complete".
2. **Given** the workflow page is open, **When** the user clicks refresh, **Then** all phase statuses are re-read from disk (no stale cache).

---

### User Story 4 - Visual Phase Pipeline (Priority: P2)

As a developer, I want the phase statuses rendered as a visual pipeline with distinct styling per status so I can glance at it and immediately understand workflow progress.

**Why this priority**: A visually differentiated pipeline is significantly easier to parse than a flat list. This builds on Story 1's data to provide a polished experience.

**Independent Test**: Can be tested by loading the workflow page for a feature at various stages and verifying each phase card shows the correct visual indicator for its status.

**Acceptance Scenarios**:

1. **Given** phase "Specify" has status "complete", **When** rendered in the pipeline, **Then** it displays with a "complete" visual indicator (e.g., checkmark, green styling).
2. **Given** phase "Implement" has status "in_progress" with progress "40%", **When** rendered in the pipeline, **Then** it displays with a progress indicator showing 40%.
3. **Given** phase "Testify" has status "skipped" (TDD not required), **When** rendered in the pipeline, **Then** it displays with a "skipped" visual indicator distinct from "not_started".

---

### Edge Cases

- What happens when `specs/<feature>/` exists but `spec.md` is missing? The feature appears in the list but "Specify" shows "not_started".
- What happens when `CONSTITUTION.md` is missing? The "Constitution" phase shows "not_started"; other phases still render based on their own artifacts.
- What happens when `.specify/context.json` is missing or malformed? Phase status falls back to artifact-existence checks only (TDD determination defaults to false).
- What happens when `tasks.md` exists but has no task items? "Tasks" shows "complete" (the file exists), "Implement" shows "not_started" (0 tasks to check off).
- What happens when the project path is invalid or inaccessible? The API returns a structured error response (HTTP 4xx/5xx with `{ error: string }` — see `contracts/phases.md` and `contracts/features.md`) and the UI displays the error message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose an API endpoint that returns the list of features found under `specs/` for a given project path (any subdirectory qualifies, regardless of which artifacts are present).
- **FR-002**: System MUST expose an API endpoint that returns the phase status for each IIKit phase of a selected feature.
- **FR-003**: Phase status MUST be derived by reading artifacts from the filesystem on each request (no persistent cache).
- **FR-004**: Phase status detection MUST follow the same logic as IIKit's dashboard generator — specifically, artifact existence determines phase completion:
  - **Constitution**: `CONSTITUTION.md` exists at project root
  - **Specify**: `specs/<feature>/spec.md` exists
  - **Plan**: `specs/<feature>/plan.md` exists
  - **Checklist**: files in `specs/<feature>/checklists/` with checked/total items parsed
  - **Testify**: `.feature` files exist under the feature directory
  - **Tasks**: `specs/<feature>/tasks.md` exists
  - **Analyze**: `specs/<feature>/analysis.md` exists
  - **Implement**: checked vs. total task items in `tasks.md`
- **FR-005**: Each phase status MUST be one of: `not_started`, `in_progress`, `complete`, or `skipped`.
- **FR-006**: Phases with quantifiable progress (Checklist, Implement) MUST return a progress percentage alongside the status. When status is `not_started` or the total count is zero, progress MUST be 0.
- **FR-007**: The Testify phase MUST be marked `skipped` when TDD is not required and the plan already exists. TDD requirement is determined from `.specify/context.json` (takes precedence); if that file is missing or malformed, fall back to `CONSTITUTION.md`.
- **FR-008**: The workflow page MUST display a feature selector when multiple features exist under `specs/`.
- **FR-009**: The workflow page MUST render each phase as a pipeline card with visual status indicators.
- **FR-010**: The workflow page MUST provide a way to refresh phase statuses on demand.

### Key Entities

- **Feature**: A directory under `specs/` containing IIKit artifacts. Identified by directory name (e.g., `001-workflow-phase-status`). Has a display name derived from the directory name.
- **Phase**: One step in the IIKit workflow. Has an id, name, status, optional progress percentage, and an optional flag. The ordered set of phases is fixed: constitution, spec, plan, checklist, testify, tasks, analyze, implement.
- **Phase Status**: The computed state of a phase — one of `not_started`, `in_progress`, `complete`, `skipped`. Derived from filesystem artifact checks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user viewing the workflow page for a feature with known artifacts sees the correct status for every phase, matching what the IIKit dashboard would show. *(End-to-end: verifiable via the browser UI — this is the user-visible acceptance bar.)*
- **SC-002**: After creating or deleting an artifact file externally, refreshing the workflow page reflects the change within one page load.
- **SC-003**: The feature selector correctly lists all feature directories under `specs/` (any directory qualifies; those without `spec.md` appear with "Specify" showing `not_started`).
- **SC-004**: The phase computation engine (`pipeline.ts`) produces identical results to IIKit's `computePipelineState()` for the same filesystem state. *(Implementation contract: unit-testable in isolation — this is the code-level correctness bar that ensures SC-001 holds over time.)*
- **SC-005**: The workflow page loads and displays phase status within 2 seconds for a project with up to 10 features.
