# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-002 @testing-quality
Feature: Automated Testing and Quality Gates
  As a developer,
  I want to run a comprehensive test suite with a single command,
  So that I can be confident that my changes don't break existing functionality.

  Background:
    Given a working test suite

  @TS-004 @FR-102 @SC-002 @SC-003 @acceptance @P1
  Scenario: Test suite passes and displays coverage
    When the developer runs `npm test`
    Then all tests pass and a coverage report is displayed

  @TS-005 @FR-102 @SC-002 @acceptance @P1
  Scenario: Failing test produces clear error message
    Given a failing test
    When the developer reviews the output
    Then the error message is clear and points to the specific assertion or code location

  @TS-006 @FR-120 @SC-004 @acceptance @P1
  Scenario: New tests are discovered automatically
    Given the test infrastructure is set up
    When a developer adds a new test file following the pattern
    Then the test is discovered and executed automatically
