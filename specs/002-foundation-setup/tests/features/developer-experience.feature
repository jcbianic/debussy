# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-001 @developer-experience
Feature: Developer Quick Start
  As a developer who clones the repository,
  I want to start the development server with a single command,
  So that I can begin development immediately with hot reloading.

  Background:
    Given a cloned repository with dependencies installed

  @TS-001 @FR-100 @SC-001 @acceptance @P1
  Scenario: Dev server starts within 5 seconds
    When the developer runs `npm run dev`
    Then the dev server starts and is accessible at localhost within 5 seconds

  @TS-002 @FR-100 @acceptance @P1
  Scenario: Hot module reloading works
    Given the dev server is running
    When a file is modified
    Then the change is reflected in the browser without a manual refresh

  @TS-003 @FR-100 @acceptance @P1
  Scenario: Command works from any project subdirectory
    Given a developer in any subdirectory of the project
    When they run the dev command
    Then it works from the project root
