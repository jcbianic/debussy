# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-001 @US-002
Feature: API Contracts
  The system exposes REST endpoints for feature listing and phase status
  that return structured data for the workflow page.

  Background:
    Given the Nitro API server is running
    And a temporary project directory is set as the project root

  @TS-030 @FR-001 @P1 @contract
  Scenario: GET /api/features returns list of valid features
    Given the project has features "001-auth" and "002-billing" each with "spec.md"
    When GET /api/features is called
    Then the response status is 200
    And the response body has a "features" array with 2 items
    And each item has an "id" and "name" field

  @TS-031 @FR-002 @P1 @contract
  Scenario: GET /api/phases returns 8 phases for a valid feature
    Given the project has feature "001-auth" with "specs/001-auth/spec.md"
    When GET /api/phases is called with query "feature=001-auth"
    Then the response status is 200
    And the response body has a "feature" field equal to "001-auth"
    And the response body has a "phases" array with 8 items

  @TS-032 @FR-002 @FR-005 @P1 @contract
  Scenario: Each phase object has required fields with valid status values
    Given the project has feature "001-auth" with "specs/001-auth/spec.md"
    When GET /api/phases is called with query "feature=001-auth"
    Then each phase has fields "id", "name", "status", "progress", "optional"
    And each phase "status" is one of "not_started", "in_progress", "complete", "skipped"

  @TS-033 @FR-002 @FR-006 @P1 @contract
  Scenario: Progress field is a number for phases with quantifiable progress
    Given the project has feature "test-feature" with "specs/test-feature/tasks.md" containing:
      """
      - [x] T001 [US1] First task
      - [ ] T002 [US1] Second task
      """
    When GET /api/phases is called with query "feature=test-feature"
    Then the "implement" phase has "progress" equal to 50
    And the "spec" phase has "progress" equal to null

  @TS-034 @FR-002 @P1 @contract
  Scenario: GET /api/phases returns 400 when feature parameter is missing
    When GET /api/phases is called with no query parameters
    Then the response status is 400
    And the response body has an "error" field containing "Missing required query parameter"

  @TS-035 @FR-002 @P1 @contract
  Scenario: GET /api/phases returns 404 when feature directory does not exist
    When GET /api/phases is called with query "feature=999-nonexistent"
    Then the response status is 404
    And the response body has an "error" field containing "Feature not found"

  @TS-036 @SC-005 @P2 @contract
  Scenario: Phase status endpoint responds within 2 seconds for a project with 10 features
    Given the project has 10 features each with a "spec.md"
    When GET /api/phases is called for each feature
    Then each response completes within 2000 milliseconds

  @TS-037 @FR-003 @P1 @contract
  Scenario: Phase status is computed fresh on every request
    Given the project has feature "test-feature" with "specs/test-feature/spec.md"
    And GET /api/phases was called once returning "plan" as "not_started"
    When "specs/test-feature/plan.md" is created on the filesystem
    And GET /api/phases is called again with query "feature=test-feature"
    Then the "plan" phase has status "complete"

  @TS-038 @P1 @validation
  Scenario: Phase computation falls back gracefully when context.json is missing
    Given the project has feature "test-feature" with "specs/test-feature/plan.md"
    And ".specify/context.json" does not exist
    When phase status is computed for feature "test-feature"
    Then the "plan" phase has status "complete"
    And no error is thrown

  @TS-039 @P1 @validation
  Scenario: Phase computation falls back gracefully when context.json is malformed
    Given the project has feature "test-feature" with "specs/test-feature/plan.md"
    And ".specify/context.json" contains invalid JSON
    When phase status is computed for feature "test-feature"
    Then the "plan" phase has status "complete"
    And no error is thrown

  @TS-040 @P1 @validation
  Scenario: tasks.md with no task items yields Tasks complete and Implement not_started
    Given the project has feature "test-feature" with "specs/test-feature/tasks.md" containing:
      """
      # Tasks

      No task items here yet.
      """
    When phase status is computed for feature "test-feature"
    Then the "tasks" phase has status "complete"
    And the "implement" phase has status "not_started"
    And the "implement" phase has no progress

  @TS-041 @FR-001 @SC-003 @P1 @validation
  Scenario: Feature directory without spec.md does not appear in feature list
    Given the project has directory "specs/001-draft/" with no "spec.md"
    When GET /api/features is called
    Then the response does not include a feature with id "001-draft"

  @TS-042 @P2 @validation
  Scenario: Checklist requirements.md is excluded from checklist progress unless checklist phase was run
    Given the project has feature "test-feature" with "specs/test-feature/checklists/requirements.md" containing:
      """
      - [x] CHK-001 Requirement checked
      - [x] CHK-002 Another requirement checked
      """
    And ".specify/context.json" does not set "checklist_reviewed_at"
    When phase status is computed for feature "test-feature"
    Then the "checklist" phase has status "not_started"

  @TS-043 @P1 @validation
  Scenario: Implement phase has no progress when no tasks are checked
    Given the project has feature "test-feature" with "specs/test-feature/tasks.md" containing:
      """
      - [ ] T001 [US1] First task
      - [ ] T002 [US1] Second task
      """
    When phase status is computed for feature "test-feature"
    Then the "implement" phase has status "not_started"
    And the "implement" phase has no progress
