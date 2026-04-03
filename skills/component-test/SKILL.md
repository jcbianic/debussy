---
description: >-
  Generate Vitest tests for Vue 3 / Nuxt components and composables.
  Tier-1 composables get pure unit tests; tier-3 presenters get component tests;
  tier-2 orchestrators get integration tests with mocked composables.
license: MIT
metadata:
  author: jcbianic
  version: "0.1.0"
---

# Component Test Skill

Generate Vitest test files for composables and Vue components.
Tests are co-located with source files as `<name>.test.ts`.

## When to Activate

- User invokes `/component-test`
- User says "write tests for", "generate tests for", "add tests to"
- User asks "which files are untested?"

## Usage

```
/component-test <path>        # Generate tests for a specific file
/component-test --untested    # List all untested files from inventory
```

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

1. `--untested` → jump to **Untested Mode**
2. Otherwise → treat `$ARGUMENTS` as a file path, jump to **Generate Mode**

---

## Step 2: Read Setup

Before generating tests, check the project's testing setup:

1. Read `ui/vitest.config.ts` to understand the environment and any global setup
2. Check `ui/package.json` for testing dependencies (`@nuxt/test-utils`, `@vue/test-utils`, `vitest`)
3. Look for existing test files in `ui/` (excluding `node_modules`) to discover patterns

The project uses `@nuxt/test-utils` with `environment: 'nuxt'`, which provides
auto-imports and full Nuxt context inside tests.

---

## Generate Mode

### G1: Read the Source File

Read the file at the given path. Determine:
- Its tier using the same heuristics as the component-design review (R2)
- Its public interface: exported composable return values, component props, emits

Also read `docs/architecture/orchestration-presentation.md` for tier definitions.

### G2: Select Test Strategy by Tier

**Tier 1 — Composable** (`composables/use*.ts`, `utils/*.ts`)

Strategy: pure unit tests with Vitest.
- No mount, no DOM
- Test each returned ref's initial state
- Test each returned function's effect on state
- Test computed values derived from state changes
- Test edge cases: empty input, invalid input, boundary values
- If the composable uses `useFetch` or `$fetch`, mock with `vi.mock`

**Tier 3 — Presenter** (`components/*.vue` with no domain composable calls)

Strategy: component tests with `@vue/test-utils` `mount`.
- Test rendering with minimal valid props
- Test all prop variants that affect visual output (conditional classes, slots, v-if)
- Test each emitted event: trigger the interaction, assert `wrapper.emitted()`
- Test accessibility: verify ARIA attributes are present, interactive elements are focusable
- Do NOT test internal implementation — test from the outside (props in, emits out)

**Tier 2 — Orchestrator** (`pages/*.vue`, domain `components/*.vue` calling composables)

Strategy: integration tests with composable mocks.
- Mock all domain composables with `vi.mock` at the module level
- Mount the component with `mountSuspense` if it uses async composables
- Test that the correct child components are rendered given mocked data
- Test that composable handlers are called when the user interacts
- Do NOT test the composable logic itself — test the wiring

### G3: Discover Existing Test File

Check if `<source-dir>/<filename>.test.ts` already exists.
- If it exists: read it and extend it (add missing cases, do not remove existing ones)
- If it does not exist: generate a new file from scratch

### G4: Write Tests

Follow this structure for new test files:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
// For component tests: import { mount, mountSuspense } from '@vue/test-utils'
// For component tests: import ComponentName from './ComponentName.vue'
// For composable tests: import { useMyComposable } from './useMyComposable'

describe('<Name>', () => {
  // Group: initial state
  describe('initial state', () => {
    it('...', () => { ... })
  })

  // Group: interactions (for composables: each handler; for components: each user action)
  describe('<action or handler>', () => {
    it('...', () => { ... })
  })

  // Group: edge cases
  describe('edge cases', () => {
    it('...', () => { ... })
  })
})
```

#### Rules for test quality

1. Each test has exactly one assertion per logical claim (split multi-claims into separate `it` blocks)
2. Test names read as sentences: `it('emits select event when row is clicked')`
3. Use `beforeEach` only for shared setup that is identical across all tests in a group
4. Do not test private implementation details — only observable behavior (returned values, emits, DOM)
5. For async composables, use `await nextTick()` or `flushPromises()` from `@vue/test-utils`
6. Mock `useFetch` responses using `vi.mock('nuxt/app', () => ({ useFetch: vi.fn().mockResolvedValue({ data: ref(mockData) }) }))`

#### Composable test template

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { use<Name> } from './use<Name>'

describe('use<Name>', () => {
  describe('initial state', () => {
    it('returns expected default values', () => {
      const result = use<Name>(<args>)
      expect(result.<field>.value).toBe(<expected>)
    })
  })

  describe('<handlerName>', () => {
    it('<what it does>', () => {
      const { <field>, <handler> } = use<Name>(<args>)
      <handler>(<input>)
      expect(<field>.value).toBe(<expected>)
    })
  })
})
```

#### Presenter component test template

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import <ComponentName> from './<ComponentName>.vue'

const defaultProps = {
  // minimum valid props
}

describe('<ComponentName>', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(<ComponentName>, { props: defaultProps })
      expect(wrapper.exists()).toBe(true)
    })

    it('<describes a conditional rendering case>', () => {
      const wrapper = mount(<ComponentName>, { props: { ...defaultProps, <prop>: <value> } })
      expect(wrapper.find('<selector>').exists()).toBe(<bool>)
    })
  })

  describe('events', () => {
    it('emits <eventName> when <element> is <interaction>', async () => {
      const wrapper = mount(<ComponentName>, { props: defaultProps })
      await wrapper.find('<selector>').trigger('<event>')
      expect(wrapper.emitted('<eventName>')?.[0]).toEqual([<expected-payload>])
    })
  })

  describe('accessibility', () => {
    it('interactive elements have accessible labels', () => {
      const wrapper = mount(<ComponentName>, { props: defaultProps })
      wrapper.findAll('button, [role="button"]').forEach(el => {
        const label = el.attributes('aria-label') || el.text()
        expect(label).toBeTruthy()
      })
    })
  })
})
```

### G5: Output

Write the test file to `<source-dir>/<filename>.test.ts`.

After writing, output:

```
## Tests written: <path>

**Strategy**: Tier <N> — <Composable | Presenter | Orchestrator>
**Test file**: <output-path>

### Cases covered
<bullet list of describe/it names>

### Not covered
<any cases that could not be auto-generated, e.g. visual snapshots, server-side behavior>

### Next step
Run: `cd ui && pnpm vitest run <test-file>`
```

Update `.debussy/component-inventory.json` if it exists: set `testStatus: "partial"` for this file
(the user should upgrade to `"covered"` after reviewing the generated tests).

---

## Untested Mode

### U1: Load Inventory

Read `.debussy/component-inventory.json`.
If it does not exist, output:
```
No inventory found. Run `/component-inventory --scan` first.
```

### U2: Filter and Display

Find all items with `testStatus: "untested"` or `testStatus: "partial"`.
Sort by tier: tier 1 first (composables are easiest and highest value to test).

Output:

```
## Untested Files

### Tier 1 — Composables (highest priority)
- ui/composables/useExpandable.ts      [untested]
- ui/composables/useMockData.ts        [untested]

### Tier 3 — Presenters
- ui/components/SegmentedControl.vue   [untested]
- ui/components/EmptyState.vue         [untested]

### Tier 2 — Orchestrators
- ui/pages/inbox.vue                   [untested]

Run `/component-test <path>` to generate tests for any file.
```

---

## Test File Location Convention

| Source file | Test file |
|---|---|
| `ui/composables/useExpandable.ts` | `ui/composables/useExpandable.test.ts` |
| `ui/components/SegmentedControl.vue` | `ui/components/SegmentedControl.test.ts` |
| `ui/pages/inbox.vue` | `ui/pages/inbox.test.ts` |
| `ui/utils/statusColor.ts` | `ui/utils/statusColor.test.ts` |

Co-locate tests with source. Do not create a separate `tests/` directory unless one already exists.
