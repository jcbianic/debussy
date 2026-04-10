---
description: >-
  Design or review Vue 3 / Nuxt components using the Orchestration-Presentation
  principle. Classifies components into tiers, defines their props/emits/composable
  interface, and flags tier violations and Nuxt convention issues.
license: MIT
metadata:
  author: jcbianic
  version: "0.2.0"
---

# Component Design Skill

Apply the **Orchestration-Presentation principle** to Vue 3 / Nuxt component work.
The full principle is in `.debussy/architecture/orchestration-presentation.md`.
Read that file before doing any design or review work.

## When to Activate

- User says "design a component for…", "what tier is this?", "should this be a composable?"
- User invokes `/component-design`
- User is splitting a page and asks how to structure the pieces
- User asks "how do I refactor this component?"
- User asks "review this component" or "audit this file"

## Usage

```
/component-design <description>       # Design mode: classify + define interface
/component-design --review <path>     # Review mode: full audit + propose refactors
```

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

1. If starts with `--review` → extract `<path>`, jump to **Review Mode**
2. Otherwise → treat full `$ARGUMENTS` as the description, jump to **Design Mode**

---

## Step 2: Read the Principle

Before either mode, read `.debussy/architecture/orchestration-presentation.md`.
This is the authoritative source. If it is missing, state that it was not found
and proceed from memory of the principle (three-tier: composable / orchestrator /
presenter; the core rule is "orchestrate OR render, not both").

Also read the current component file if in Review Mode (see below).

---

## Design Mode

### D1: Classify the Component

Based on the description, determine the tier:

| Question | Tier if YES |
|---|---|
| Does it fetch data, own domain state, or contain business logic? | Tier 1 — composable |
| Does it coordinate multiple sub-components or own cross-cutting UI state (keyboard, routing)? | Tier 2 — orchestrator |
| Does it render a specific UI region from props, with no domain knowledge? | Tier 3 — presenter |

If the description implies both tier-2 and tier-3 work: **propose a split** —
one orchestrator + one or more presenters.

### D2: Define the Interface

**Tier 1 — Composable**

```
Name:     use<Domain>  (e.g. useRoadmapIntents)
File:     composables/use<Domain>.ts
Returns:  (list reactive refs and handler functions with types)
Has NO:   template concerns, DOM access, or component imports
```

**Tier 2 — Orchestrator**

```
Name:     <Feature>.vue or pages/<route>.vue
Props:    identifiers or config only (not hydrated data — orchestrators fetch their own)
Calls:    (list composables it will call)
Emits:    (any events bubbled up to a parent, if applicable)
Composes: (list presenter components it will render)
```

**Tier 3 — Presenter**

```
Name:     <What It Renders>.vue  (e.g. ReviewItemRow.vue, IntentDetailPanel.vue)
Props:    (full typed objects, not IDs — receive the hydrated value)
Emits:    (all user interactions as typed events)
Has NO:   domain composable calls, useFetch, useRouter, useStore
```

### D3: Output

Present a component spec in this format:

```
## Component: <Name>

**Tier**: Tier N — <Composable | Orchestrator | Presenter>
**File**: <path>

### Interface
<props table or returns table: name | type | required | description>

### Emits / Handlers
<event or handler: name | payload type | description>

### Dependencies
<composables it calls, or child components it renders>

### Notes
<anything non-obvious — why this split, what a future refactor might look like>
```

---

## Review Mode

### R1: Read the File

Read the file at the path extracted from `$ARGUMENTS`.

### R2: Determine Current Tier

Inspect `<script setup>`:
- Calls `useFetch`, `$fetch`, `useStore`, `useRoute`, or domain `use*` composables → tier 2 signals
- Only calls UI-utility composables (`useExpandable`, `useState`) → tier 3 signals
- No template at all → tier 1

Inspect `<template>`:
- Delegates entirely to named child components → tier 2 (clean)
- Contains inline markup (tags, Tailwind classes, conditional rendering) → check line count
- Accepts `modelValue` / emits update → tier 3 signal

### R3: Architecture Checklist

Go through each check. Report only the violations found — skip passing checks.

| # | Check | Threshold |
|---|---|---|
| 1 | Template size | `<template>` > 80 lines of inline markup (not a component tree) |
| 2 | Presentation purity | Tier-3 component calling domain composables or `useFetch` |
| 3 | Orchestrator fatness | Tier-2 page with inline render blocks > 80 lines |
| 4 | Computed scope | Computed value used only inside one deeply-nested sub-region |
| 5 | Prop-drilling | Same prop passed > 2 levels without transformation |
| 6 | Inline types | `interface` or `type` defined in `.vue` that should live in a composable |
| 7 | Orphaned handlers | Event handler doing data transformation (should delegate to composable) |

For each violation: cite the specific lines and explain the concrete impact
(testability, reuse, cognitive load).

### R4: Nuxt Conventions Checklist

Run these checks in addition to R3. Report only violations.

| # | Check | What to look for |
|---|---|---|
| 8 | Naming | Components: PascalCase filename; composables: `use*` camelCase; pages/layouts: kebab-case |
| 9 | Auto-imports | Explicit imports for Vue APIs (`ref`, `computed`, `watch`), Nuxt APIs (`useRoute`, `useFetch`), or local components / composables from `~/` |
| 10 | Accessibility | Interactive elements without `aria-label` or accessible text; non-button/anchor elements handling clicks without `role`; images without `alt`; form inputs without associated labels; custom interactive widgets without keyboard handler (`@keydown`) |
| 11 | Documentation | Exported composable return values undocumented (no JSDoc `/** */`); props with non-obvious types undescribed; complex derived logic (>3 lines) without an explanatory comment |
| 12 | Semantic tokens | Hardcoded arbitrary Tailwind values (e.g. `text-[#3B82F6]`, `bg-[#fff]`) where design token aliases should be used; inline `style` with hardcoded colors or pixel values that belong in the token layer |
| 13 | Testability | Tier-3 presenter with internal state that cannot be controlled via props; composable with side effects (DOM manipulation, `document.*`) that are not injectable or mockable |

For check 9 (auto-imports): Nuxt auto-imports everything from `composables/`, `utils/`, and all of Vue's Composition API. Any explicit import of these is redundant and can mask missing exports. Flag them.

For check 12 (semantic tokens): If the project has no design token layer yet, note that as a finding rather than a per-file violation.

### R5: Propose Refactors

For each violation (from both R3 and R4), propose a concrete action:

**Architecture violations (1–7):**
- **Extract a presenter**: name the new file, define its props and emits
- **Extract to composable**: name the new composable, define its return surface
- **Inline split**: show the before/after boundary in the template

**Convention violations (8–13):**
- **Rename file**: show old → new name
- **Remove import**: cite the line; explain it is auto-imported
- **Add ARIA**: show the specific attribute to add and on which element
- **Add JSDoc**: show the doc comment to add above the return statement
- **Replace arbitrary value**: show the Tailwind token alias or suggest creating one
- **Expose via props**: show how to convert internal state to a controlled prop

Prioritize by impact. Lead with the highest-value refactor.

### R6: Output

```
## Review: <FileName>

**Assessed tier**: Tier N — <what it currently is>
**Target tier**: <what it should be, if different>

### Architecture Violations
<numbered list, each with: check #, line reference, description, impact>

### Convention Violations
<numbered list, each with: check #, line reference, description, fix>

### Proposed Refactors
<for each violation group, a concrete suggestion>

### What is Already Correct
<brief acknowledgement of patterns that follow the principle — do not skip this>
```

---

## Heuristics for This Codebase

These are derived from the current state of `ui/` in this repo and should
guide prioritization when reviewing:

- `pages/` files are orchestrators and should stay thin: `inbox.vue` is 86 lines,
  `roadmap.vue` is 103 lines — these are the target for new pages
- The data layer (`useMockData.ts`) is correct tier-1; when API calls replace
  mock data, they belong here, not in pages
- `SegmentedControl.vue` is the reference implementation of a correct tier-3
- `LaneDetail.vue` is the reference implementation of a correct tier-2
- New pages should target < 60 lines of template (mostly component tags)
- New presenters should have zero domain composable imports
- All Vue / Nuxt APIs (`ref`, `computed`, `useRoute`, `useFetch`) are auto-imported;
  any explicit import of these is a check-9 violation
- A semantic token layer exists in `ui/assets/css/main.css` (`@theme inline`);
  flag any hardcoded color values or arbitrary Tailwind values as check-12 violations
