# DO NOT MODIFY SCENARIOS
# These .feature files define expected behavior derived from requirements.
# During implementation:
#   - Write step definitions to match these scenarios
#   - Fix code to pass tests, don't modify .feature files
#   - If requirements change, re-run /iikit-04-testify

@US-005 @welcome-page
Feature: Polished First Impression
  As a new user,
  I want to see a polished welcome page with clear entry points,
  So that I immediately understand what Debussy does and where to start.

  @TS-013 @FR-300 @SC-007 @acceptance @P2
  Scenario: Welcome page displays headline and CTAs
    Given a user navigates to the app root
    When the page loads
    Then they see a welcome page with a headline, feature callouts, and primary/secondary CTAs

  @TS-014 @FR-300 @acceptance @P2
  Scenario: New Session CTA navigates to session creation
    Given the welcome page is displayed
    When the user clicks "New Session"
    Then they navigate to the session creation flow

  @TS-015 @FR-300 @SC-007 @acceptance @P2
  Scenario: Welcome page is mobile-responsive
    Given the welcome page is rendered
    When viewed on mobile
    Then the layout adapts and all buttons are accessible
