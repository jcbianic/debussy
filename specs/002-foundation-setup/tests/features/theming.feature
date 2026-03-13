# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-004 @theming
Feature: Customizable Appearance
  As a user or developer,
  I want to customize colors, fonts, and spacing through a centralized system,
  So that I can personalize Debussy or apply org-specific branding.

  Background:
    Given the theming system is in place

  @TS-010 @FR-200 @SC-007 @SC-008 @acceptance @P2
  Scenario: Light to dark mode switching updates all colors
    When a user switches from light to dark mode
    Then all colors update consistently and remain readable

  @TS-011 @FR-200 @SC-007 @acceptance @P2
  Scenario: Developer can customize primary color globally
    Given theme tokens are documented
    When a developer wants to customize the primary color
    Then they can update a single value and see the change reflected everywhere

  @TS-012 @FR-200 @acceptance @P2
  Scenario: Theme updates immediately without page reload
    Given the app is running
    When the theme is changed
    Then the update is immediate (no page reload required)
