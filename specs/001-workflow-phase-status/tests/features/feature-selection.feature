# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-002
Feature: Feature Selection
  As a developer with multiple features in specs/,
  I want to choose which feature's phase status to display
  so I can track the right workflow.

  Background:
    Given a temporary project directory

  @TS-016 @FR-001 @FR-008 @SC-003 @P1 @acceptance
  Scenario: Feature selector lists all feature directories that contain spec.md
    Given the project has feature directories "001-auth" and "002-billing" each with a "spec.md"
    When the feature list is fetched
    Then the response contains features "001-auth" and "002-billing"
    And "001-auth" has display name "Auth"
    And "002-billing" has display name "Billing"

  @TS-017 @FR-002 @SC-001 @P1 @acceptance
  Scenario: Phase statuses reflect the selected feature's artifacts
    Given the project has feature "001-auth" with "specs/001-auth/spec.md" and "specs/001-auth/plan.md"
    And the project has feature "002-billing" with "specs/002-billing/spec.md" only
    When phase status is computed for feature "002-billing"
    Then the "spec" phase has status "complete"
    And the "plan" phase has status "not_started"

  @TS-018 @FR-008 @P1 @acceptance
  Scenario: Single feature is auto-selected when only one exists
    Given the project has only feature "001-auth" with "specs/001-auth/spec.md"
    When the feature list is fetched
    Then the response contains exactly 1 feature
    And the feature "001-auth" is returned

  @TS-019 @FR-001 @SC-003 @P1 @acceptance
  Scenario: Feature directory without spec.md is not listed
    Given the project has directory "specs/001-draft/" with no "spec.md"
    And the project has feature "002-active" with "specs/002-active/spec.md"
    When the feature list is fetched
    Then the response does not contain feature "001-draft"
    And the response contains feature "002-active"

  @TS-020 @FR-001 @P1 @acceptance
  Scenario: Empty feature list when no specs directory exists
    Given the project has no "specs/" directory
    When the feature list is fetched
    Then the response contains an empty features list

  @TS-021 @FR-001 @P1 @acceptance
  Scenario: Feature display name is derived from directory name
    Given the project has feature "001-workflow-phase-status" with "specs/001-workflow-phase-status/spec.md"
    When the feature list is fetched
    Then the feature "001-workflow-phase-status" has display name "Workflow Phase Status"
