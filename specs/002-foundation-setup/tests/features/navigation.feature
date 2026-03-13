# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-006 @navigation
Feature: Unified Navigation
  As a user navigating between core pages,
  I want a cohesive, intuitive UI with consistent navigation,
  So that I experience a unified application rather than patched-together pages.

  Background:
    Given all three pages are loaded

  @TS-016 @FR-301 @FR-302 @SC-009 @acceptance @P2
  Scenario: Navigation updates page indicator when navigating
    Given the user is on the session page
    When they click the "Workflows" link
    Then the workflow page loads and the navigation indicator updates

  @TS-017 @FR-301 @FR-302 @SC-009 @acceptance @P2
  Scenario: Layout remains consistent across page navigation
    Given the user navigates between pages
    When they review the layout
    Then the header, sidebar, and content area maintain consistent styling

  @TS-018 @FR-301 @FR-302 @SC-007 @SC-009 @acceptance @P2
  Scenario: Pages render without visual bugs in light and dark modes
    Given all three pages are rendered
    When visual design is reviewed
    Then no color clashes, font mismatches, or layout shifts are visible
