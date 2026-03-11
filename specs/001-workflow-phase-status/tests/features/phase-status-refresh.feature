# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-003
Feature: Phase Status Refresh
  As a developer who just ran an IIKit phase in a terminal,
  I want to refresh the workflow page and see updated phase statuses
  without restarting the server.

  Background:
    Given a temporary project directory
    And the project has feature "test-feature" with "specs/test-feature/spec.md"

  @TS-022 @FR-003 @FR-010 @SC-002 @P2 @acceptance
  Scenario: Refresh reflects externally created artifact immediately
    Given the "plan" phase shows status "not_started" for feature "test-feature"
    When "specs/test-feature/plan.md" is created externally
    And phase status is computed for feature "test-feature"
    Then the "plan" phase has status "complete"

  @TS-023 @FR-003 @SC-002 @P2 @acceptance
  Scenario: Each request reads fresh state from the filesystem without caching
    Given "specs/test-feature/plan.md" does not exist
    And phase status has been fetched once showing "plan" as "not_started"
    When "specs/test-feature/plan.md" is created externally
    And phase status is fetched again for feature "test-feature"
    Then the "plan" phase has status "complete"

  @TS-024 @FR-003 @P2 @acceptance
  Scenario: Refresh reflects artifact deletion
    Given "specs/test-feature/plan.md" exists and "plan" phase shows "complete"
    When "specs/test-feature/plan.md" is deleted externally
    And phase status is computed for feature "test-feature"
    Then the "plan" phase has status "not_started"

  @TS-025 @FR-010 @P2 @acceptance
  Scenario: Workflow page provides a way to trigger phase status refresh
    Given the workflow page is open for feature "test-feature"
    When the user triggers a refresh
    Then the phase status endpoint is called again
    And the displayed phases reflect the current filesystem state
