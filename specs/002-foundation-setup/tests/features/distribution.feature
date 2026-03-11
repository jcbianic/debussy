# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-003 @distribution
Feature: Global Distribution via npm
  As an end user,
  I want to run Debussy with `npx debussy` without any manual setup,
  So that I can try it immediately with minimal friction.

  @TS-007 @FR-110 @FR-111 @SC-005 @SC-006 @acceptance @P1
  Scenario: App launches via npx without manual build
    Given the app is published to npm
    When a user runs `npx debussy`
    Then the app launches without errors and no manual build steps are required

  @TS-008 @FR-111 @SC-006 @acceptance @P1
  Scenario: Executable opens app in browser
    Given the executable is triggered
    When it starts
    Then the app opens in the browser or terminal with the welcome page visible

  @TS-009 @FR-111 @acceptance @P1
  Scenario: Users can update to latest version
    Given npm publishes the package
    When subsequent versions are released
    Then users can update with `npm install -g debussy@latest` or the latest is available via `npx`
