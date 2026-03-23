# Orchestration-Presentation Principle
## Vue 3 / Nuxt Component Architecture

The Composition API changes where the "smart/dumb" boundary lives. Business
logic no longer lives in container components — it lives in composables. This
creates a clean three-tier stack:

```
Tier 1 — Data Layer       composables/use*.ts
Tier 2 — Orchestration    pages/*.vue, domain components
Tier 3 — Presentation     components/*.vue (leaf components)
```

---

## The Three Tiers

### Tier 1 — Data Layer (`composables/`)

- Owns data types, interfaces, and reactive state
- Performs data fetching (`useFetch`, `$fetch`, Pinia stores)
- Contains domain business logic: filtering, sorting, aggregations, transformations
- Returns typed reactive refs and handler functions
- Has NO template concerns, NO DOM side effects

```ts
// Good — data layer owns its interface and logic
export function useInboxItems(laneId: Ref<string>) {
  const items = ref<ReviewItem[]>([])
  const pending = computed(() => items.value.filter(i => i.status === 'pending'))
  const approve = (id: string) => { /* mutate or call API */ }
  return { items, pending, approve }
}
```

### Tier 2 — Orchestration (`pages/`, domain components)

- Calls composables to acquire reactive data and handlers
- Owns UI coordination: routing, keyboard shortcuts, inter-component state
- Composes presentation components into layouts
- Passes data **down** via typed props
- Routes child emits **up** to composable handlers
- Template is thin: mostly `<ComponentName :prop="val" @event="handler" />`

```vue
<!-- Good — orchestrator delegates rendering, owns coordination -->
<script setup>
const { lanes, pending, approve } = useInboxItems(laneId)
const { expanded, toggle } = useExpandable(lanes.value.map(l => l.id))
</script>
<template>
  <InboxPanel :lanes="lanes" :expanded="expanded" @toggle="toggle" @approve="approve" />
</template>
```

### Tier 3 — Presentation (`components/`)

- Accepts typed props only (no domain composable calls)
- Emits typed events for all user interactions
- May use UI-utility composables (`useExpandable`, `useState`, `useMotion`)
- Contains all rendering detail: Tailwind classes, icons, conditional markup
- Completely reusable and testable in isolation

```vue
<!-- Good — presentation owns rendering, nothing else -->
<script setup lang="ts">
defineProps<{ item: ReviewItem; isSelected: boolean }>()
defineEmits<{ select: [id: string]; approve: [id: string] }>()
</script>
```

---

## The Core Rule

> **A component orchestrates OR renders — not both.**

Orchestrators have thin templates (mostly component trees).
Presenters have no business logic and no domain data calls.

---

## Nuxt Filesystem Conventions

| Directory | Default tier | Notes |
|---|---|---|
| `pages/` | Tier 2 — always orchestrators | Route is their contract; never inline large render blocks |
| `layouts/` | Tier 3 — structural presenters | Slot-based, no data |
| `components/` | Tier 2 or 3 | Domain components (e.g. `LaneDetail`) can be tier 2 |
| `composables/` | Tier 1 — always | No DOM, no template |
| `server/api/` | Below tier 1 | The actual data source; composables call it |

---

## Violation Signals

### Orchestrator bleeding into presentation

A component that is supposed to render is also reaching for data:

- A `components/` file calling `useFetch`, `useRoute`, or domain composables
- A component accepting a bare `id` prop and fetching its own data (it should receive the full typed object)
- Computed properties defined in a component where the result is only ever used in one deeply-nested sub-region

### Presentation bleeding into orchestration

A page or domain component is doing too much inline rendering:

- A `pages/` file with a `<template>` exceeding ~80 lines of raw markup (not a component tree)
- Business logic (filters, derived sums, state machines) defined inside a file that also has complex nested markup
- Event handlers doing data transformation rather than delegating to a composable method

### The prop-horizon signal

When the same prop is threaded through more than 2 component levels:
- Either promote the bottom consumer to an orchestrator that calls the composable directly
- Or move the data to a shared composable / store accessible at the right level

Prop-drilling beyond 2 levels signals a tier boundary is in the wrong place.

---

## Applying the Principle

### Designing a new component

1. Identify its responsibility: does it *coordinate* or *render*?
2. If it coordinates → define the composables it calls; keep the template as a component tree
3. If it renders → start with its props interface; define all interactions as typed emits
4. If it does both → split it: extract the rendering into a presenter, keep coordination in the orchestrator

### Reviewing an existing component

Work through this checklist in order:

| # | Check | What to look for |
|---|---|---|
| 1 | Template size | `<template>` > 80 lines of inline markup (not component trees) |
| 2 | Presentation purity | Tier-3 component calling domain composables or `useFetch` |
| 3 | Orchestrator fatness | Tier-2 page with > 80 lines of inline render markup |
| 4 | Computed scope | Computed properties whose result is used only in one deeply-nested region |
| 5 | Prop-drilling | Same prop passed > 2 levels without transformation |
| 6 | Inline types | Interfaces defined in a `.vue` file that belong in a composable |
| 7 | Orphaned handlers | Event handlers doing complex data transformation (should be in a composable) |

---

## Worked Examples from This Codebase

### `SegmentedControl.vue` — correct tier-3

Props-in (`modelValue`, `options`, `stretch`), emit-out (`update:modelValue`),
no composable calls. Can be used anywhere. No changes needed.

### `useExpandable.ts` — correct tier-1

Owns expand/collapse state, returns `expanded`, `toggle`, `has`. No DOM,
no template knowledge. No changes needed.

### `inbox.vue` — tier-2, but template is too fat

The script is correctly tier-2: calls `useMockData()`, `useExpandable()`,
owns keyboard shortcuts and navigation. The violation is the template (280+ lines)
with two full panel implementations inlined. Should extract:

- `InboxListPanel.vue` (tier 3) — left panel: filter bar + grouped item list
- `ReviewItemDetail.vue` (tier 3) — right panel: title, round selector, proposal, feedback, actions
- `InboxGroupRow.vue` (tier 3) — a single collapsible group header + its items

### `roadmap.vue` — tier-2, but data belongs in a composable

Defines `releases` as a `reactive<Release[]>` inline with ~40 items of mock data,
plus all business logic (`releaseStatus`, `doneCount`, `moveIntent`). When real
data arrives, this needs to move to `useRoadmap()`. The template also has a
side panel (`selectedIntent` drawer) that can become `IntentDetailPanel.vue`.

### `LaneDetail.vue` — correct tier-2 pattern

Calls `useMockData()`, derives `lane`, `reviewGroups`, `workflow`, `commits` via
computed. Owns `activeTab` and `useExpandable`. The three tab panes (inbox,
workflow, commits) are candidates for extraction into presenters once they grow,
but are acceptable at current size.
