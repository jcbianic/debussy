# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-001
Feature: Phase Status Computation
  As a developer using the Debussy workflow page,
  I want to see the current status of each IIKit phase
  so I know which phases are complete, in progress, or not yet started.

  Background:
    Given a temporary project directory
    And the project contains a "CONSTITUTION.md" file

  @TS-001 @FR-002 @FR-004 @SC-001 @SC-004 @P1 @acceptance
  Scenario: Specify phase is complete when spec.md exists and later phases have no artifacts
    Given the project has feature "test-feature" with "specs/test-feature/spec.md" present
    And no plan, checklist, testify, tasks, analyze, or implement artifacts exist for "test-feature"
    When phase status is computed for feature "test-feature"
    Then the "spec" phase has status "complete"
    And the "plan" phase has status "not_started"
    And the "checklist" phase has status "not_started"
    And the "tasks" phase has status "not_started"
    And the "implement" phase has status "not_started"

  @TS-002 @FR-002 @FR-004 @FR-006 @SC-001 @P1 @acceptance
  Scenario: Implement phase shows in_progress with 60 percent when 3 of 5 tasks are checked
    Given the project has feature "test-feature" with "specs/test-feature/tasks.md" containing:
      """
      - [x] T001 [US1] First task
      - [x] T002 [US1] Second task
      - [x] T003 [US1] Third task
      - [ ] T004 [US1] Fourth task
      - [ ] T005 [US1] Fifth task
      """
    When phase status is computed for feature "test-feature"
    Then the "implement" phase has status "in_progress"
    And the "implement" phase has progress 60

  @TS-003 @FR-002 @FR-004 @SC-001 @P1 @acceptance
  Scenario: All phases show not_started when project has no specs directory
    Given the project has no "specs/" directory
    When phase status is computed for feature "test-feature"
    Then all 8 phases have status "not_started"

  @TS-004 @FR-004 @P1 @acceptance
  Scenario: Constitution phase is complete when CONSTITUTION.md exists at project root
    Given the project contains a "CONSTITUTION.md" file
    When phase status is computed for feature "test-feature"
    Then the "constitution" phase has status "complete"

  @TS-005 @FR-004 @P1 @acceptance
  Scenario: Constitution phase is not_started when CONSTITUTION.md is absent
    Given the project does not contain a "CONSTITUTION.md" file
    When phase status is computed for feature "test-feature"
    Then the "constitution" phase has status "not_started"

  @TS-006 @FR-004 @P1 @acceptance
  Scenario: Plan phase is complete when plan.md exists
    Given the project has feature "test-feature" with "specs/test-feature/plan.md" present
    When phase status is computed for feature "test-feature"
    Then the "plan" phase has status "complete"

  @TS-007 @FR-004 @FR-006 @P1 @acceptance
  Scenario: Checklist phase shows in_progress with percentage when some items are checked
    Given the project has feature "test-feature" with "specs/test-feature/checklists/quality.md" containing:
      """
      - [x] CHK-001 First item
      - [x] CHK-002 Second item
      - [ ] CHK-003 Third item
      - [ ] CHK-004 Fourth item
      - [ ] CHK-005 Fifth item
      """
    When phase status is computed for feature "test-feature"
    Then the "checklist" phase has status "in_progress"
    And the "checklist" phase has progress 40

  @TS-008 @FR-004 @P1 @acceptance
  Scenario: Checklist phase is not_started when checklists directory has no items
    Given the project has feature "test-feature" with an empty "specs/test-feature/checklists/" directory
    When phase status is computed for feature "test-feature"
    Then the "checklist" phase has status "not_started"
    And the "checklist" phase has no progress

  @TS-009 @FR-004 @P1 @acceptance
  Scenario: Testify phase is complete when feature files exist
    Given the project has feature "test-feature" with ".feature" files in "specs/test-feature/tests/features/"
    When phase status is computed for feature "test-feature"
    Then the "testify" phase has status "complete"

  @TS-010 @FR-004 @FR-007 @P1 @acceptance
  Scenario: Testify phase is skipped when TDD is not required and plan exists
    Given the project does not contain a "CONSTITUTION.md" file
    And the project has feature "test-feature" with "specs/test-feature/plan.md" present
    And no ".feature" files exist in "specs/test-feature/tests/features/"
    And ".specify/context.json" does not set "tdd_determination"
    When phase status is computed for feature "test-feature"
    Then the "testify" phase has status "skipped"
    And the "testify" phase is marked optional

  @TS-011 @FR-004 @P1 @acceptance
  Scenario: Tasks phase is complete when tasks.md exists
    Given the project has feature "test-feature" with "specs/test-feature/tasks.md" present
    When phase status is computed for feature "test-feature"
    Then the "tasks" phase has status "complete"

  @TS-012 @FR-004 @P1 @acceptance
  Scenario: Analyze phase is complete when analysis.md exists
    Given the project has feature "test-feature" with "specs/test-feature/analysis.md" present
    When phase status is computed for feature "test-feature"
    Then the "analyze" phase has status "complete"

  @TS-013 @FR-004 @P1 @acceptance
  Scenario: Implement phase is complete when all tasks are checked
    Given the project has feature "test-feature" with "specs/test-feature/tasks.md" containing:
      """
      - [x] T001 [US1] First task
      - [x] T002 [US1] Second task
      - [x] T003 [US1] Third task
      """
    When phase status is computed for feature "test-feature"
    Then the "implement" phase has status "complete"
    And the "implement" phase has progress 100

  @TS-014 @FR-004 @FR-005 @SC-001 @P1 @acceptance
  Scenario: All 8 phases are always returned in fixed order
    Given the project has feature "test-feature" with "specs/test-feature/spec.md" present
    When phase status is computed for feature "test-feature"
    Then the response contains exactly 8 phases
    And the phases are ordered: "constitution", "spec", "plan", "checklist", "testify", "tasks", "analyze", "implement"

  @TS-015 @FR-007 @P1 @acceptance
  Scenario: Testify phase is mandatory when constitution declares TDD required
    Given ".specify/context.json" sets "tdd_determination" to "mandatory"
    And no ".feature" files exist in "specs/test-feature/tests/features/"
    And the project has feature "test-feature" with "specs/test-feature/plan.md" present
    When phase status is computed for feature "test-feature"
    Then the "testify" phase has status "not_started"
    And the "testify" phase is not marked optional
