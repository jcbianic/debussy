<!-- Sync Impact Report
Version: 1.0.0 (initial ratification)
Modified principles: none (initial)
Added sections: Core Principles (6), Quality Standards, Governance
Removed sections: none
Follow-up TODOs: none
-->

# Debussy Constitution

## Core Principles

### I. Specification-Driven Development

Every feature follows a structured phase sequence. No production code
is written without a specification, plan, and task breakdown in place.

- Each feature begins with a specification that defines user stories,
  acceptance scenarios, and functional requirements
- A technical plan must be reviewed before implementation begins
- Tasks are derived from the plan and tracked to completion
- Skipping phases is not permitted; each phase validates its own
  prerequisites before proceeding

**Rationale**: Structured phases prevent scope drift, ensure
requirements are captured before code is written, and provide clear
checkpoints for validation.

### II. Test-First Development (NON-NEGOTIABLE)

All features MUST follow TDD with Red-Green-Refactor discipline.
Tests are written before production code. No exceptions.

- Tests MUST be written and verified to fail before implementation
- Production code is written only to make failing tests pass
- Test assertions MUST never be modified to make failing tests pass;
  fix the production code instead
- Refactoring occurs only after tests are green

**Rationale**: Test-first development catches defects early, serves
as living documentation, and ensures every behavior is verified
before being considered complete.

### III. Assertion Integrity

Test assertions are hash-verified and immutable. The integrity chain
from specification to test to implementation must remain unbroken.

- Test specification files are generated, never hand-edited
- Assertion hashes in context files are the integrity anchor and
  must never be deleted or overwritten manually
- Hash mismatches block commits; the correct fix is to regenerate
  test specifications, not to bypass the check
- Pre-commit hooks enforcing integrity must never be skipped

**Rationale**: Assertion integrity ensures that what was specified is
what gets tested and what gets built. Breaking the hash chain means
the implementation can silently diverge from the specification.

### IV. Local-First Privacy

Debussy runs entirely on the developer's machine. No data leaves
the local environment without explicit user action.

- No telemetry, analytics, or usage tracking of any kind
- No cloud dependencies for core functionality
- No user accounts, authentication services, or remote storage
- All session data, artifacts, and metadata remain on the local
  filesystem
- Network access is limited to localhost and user-initiated
  subprocess operations

**Rationale**: Developer tools that phone home erode trust. A
local-first architecture gives developers full control over their
data and eliminates privacy concerns.

### V. Intent Sequencing

Features are delivered as numbered intents, each building on the
previous. Intents are merged in strict sequential order.

- Each intent has a unique numeric identifier and short name
- Later intents may depend on earlier ones; merge order matters
- Parallel research and planning on future intents is permitted,
  but implementation merges follow the sequence
- Each intent is developed in isolation to prevent cross-intent
  interference

**Rationale**: Sequential delivery reduces integration risk,
provides clear milestones, and ensures each increment is stable
before the next one builds on it.

### VI. Architectural Stewardship

Changes to inherited architecture must be additive and justified.
Breaking changes require explicit documentation and approval.

- Preserve existing patterns and conventions unless there is a
  clear, documented reason to change them
- New features extend the architecture rather than replacing
  working subsystems
- Breaking changes to interfaces, data models, or service
  contracts require a migration plan
- Complexity must be justified; prefer the simplest solution
  that meets the requirement

**Rationale**: The project inherits a proven foundation. Reckless
refactoring destroys working infrastructure and introduces risk
without delivering user value.

## Quality Standards

- All code changes must pass existing tests before merge
- New features must include tests covering acceptance scenarios
- Code review is required for all changes to shared interfaces
- Documentation updates accompany user-facing changes
- Linting and formatting rules are enforced automatically

## Governance

This constitution supersedes all other development guidance when
conflicts arise. Amendments follow this process:

- **Proposing changes**: Any contributor may propose an amendment
  with a rationale and impact assessment
- **Approval**: Amendments require explicit user approval before
  adoption
- **Versioning**: MAJOR for principle removal or redefinition,
  MINOR for new principles, PATCH for clarifications
- **Migration**: Breaking amendments include a migration plan for
  affected artifacts
- **Compliance**: All code reviews and phase transitions must
  verify constitutional compliance

**Version**: 1.0.0 | **Ratified**: 2026-03-10 | **Last Amended**: 2026-03-10
