# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-004
Feature: Visual Phase Pipeline
  As a developer,
  I want the phase statuses rendered as a visual pipeline with distinct styling per status
  so I can glance at it and immediately understand workflow progress.

  Background:
    Given the workflow page is open

  @TS-026 @FR-009 @P2 @acceptance
  Scenario: Complete phase displays with success visual indicator
    Given the "spec" phase has status "complete"
    When the phase pipeline is rendered
    Then the "spec" phase card displays a complete indicator
    And the "spec" phase card uses success styling

  @TS-027 @FR-009 @FR-006 @P2 @acceptance
  Scenario: In-progress phase displays with progress percentage
    Given the "implement" phase has status "in_progress" with progress 40
    When the phase pipeline is rendered
    Then the "implement" phase card displays a progress indicator
    And the "implement" phase card shows "40%"

  @TS-028 @FR-009 @P2 @acceptance
  Scenario: Skipped phase displays with indicator distinct from not_started
    Given the "testify" phase has status "skipped"
    And the "plan" phase has status "not_started"
    When the phase pipeline is rendered
    Then the "testify" phase card displays a skipped indicator
    And the "testify" phase card styling differs from the "plan" phase card styling

  @TS-029 @FR-008 @P2 @acceptance
  Scenario: Feature selector is shown when multiple features exist
    Given the API returns features "001-auth" and "002-billing"
    When the workflow page is rendered
    Then a feature selector element is displayed
    And the selector lists "001-auth" and "002-billing" as options
