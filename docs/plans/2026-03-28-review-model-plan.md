# Plan: Refonte du modele Review (2026-03-28)

## Summary

Refactorer le systeme de reviews de Debussy : renommer `ReviewGroup` en
`Review`, `ReviewItem` en `Item`, remplacer `Round` par `Iteration` +
`Feedback`, unifier le stockage sous `.debussy/reviews/`, et adapter toute la
chaine (types, API, composables, composants, skills).

## Stakes Classification

**Level**: High
**Rationale**: Changement transversal touchant types, API, composables, 7+
composants Vue, 2 skills, et le format de stockage sur disque. Impact sur
toutes les fonctionnalites de review.

## Context

**Affected Areas**: Types serveur et client, API endpoints, composables
`useInbox`/`useLanes`, 9 composants Vue, skills `review-gate` et `feedback`,
format de stockage `.debussy/inbox/` et `.debussy/{strate}/.reviews/`

## Success Criteria

- [ ] Nouveau modele `Review > Item > Iteration > Feedback` en place
- [ ] Stockage unifie sous `.debussy/reviews/{reviewId}/`
- [ ] API `/api/reviews` remplace `/api/inbox`
- [ ] Tous les composants utilisent les nouveaux types
- [ ] Skill `review-gate` ecrit dans `.debussy/reviews/`
- [ ] Tests existants mis a jour et passants
- [ ] UI fonctionnellement identique (pas de regression visuelle)

## New Data Model

```typescript
// --- Core types ---

interface Feedback {
  decision: 'approved' | 'changes-requested' | 'rejected'
  comment?: string
  decidedAt: string
}

interface Iteration {
  number: number
  proposedAt: string
  content: string
  code?: string
  feedback?: Feedback
}

interface Item {
  id: string
  title: string
  subtitle: string
  iterations: Iteration[]
  // status is derived: last iteration's feedback?.decision ?? 'pending'
}

interface Review {
  id: string
  title: string
  icon: string
  source: string
  type: string
  createdAt: string
  items: Item[]
}

interface Lane {
  id: string
  branch: string
  path: string
  isActive: boolean
  intent?: string
  reviews: Review[]  // was: groups: ReviewGroup[]
}
```

**Derived status helper:**

```typescript
function itemStatus(item: Item): 'pending' | 'approved' | 'changes-requested' | 'rejected' {
  const last = item.iterations.at(-1)
  return last?.feedback?.decision ?? 'pending'
}
```

## Storage Format

```
.debussy/reviews/{reviewId}/
  review.json              # { id, title, icon, source, type, createdAt }
  items/{itemId}.json      # { id, title, subtitle, iterations: [...] }
```

**Compatibility**: The inbox API endpoint will read from `.debussy/reviews/`
instead of `.debussy/inbox/`. Old inbox sessions are not migrated (they are
ephemeral by design -- completed sessions are deleted by review-gate).

## Implementation Steps

### Phase 1: Types and Utilities

#### Step 1.1: Define new types in `ui/server/utils/reviews.ts`

- **Files**: `ui/server/utils/reviews.ts` (new)
- **Action**: Create `Feedback`, `Iteration`, `Item`, `Review` interfaces.
  Add `itemStatus()` helper. Add storage read/write utilities:
  `scanReviews()`, `readReview()`, `writeReviewDecision()`.
- **Verify**: File compiles with `npx nuxi typecheck`
- **Complexity**: Medium

#### Step 1.2: Update Lane type to use `reviews` instead of `groups`

- **Files**: `ui/server/utils/lanes.ts`
- **Action**: Change `groups: ReviewGroup[]` to `reviews: Review[]` in Lane
  interface. Remove `Round`, `ReviewItem`, `ReviewGroup` exports (keep them
  until Phase 2 consumers are updated). Update `parseLanesFromWorktrees` to
  initialize `reviews: []`.
- **Verify**: Typecheck passes
- **Complexity**: Small

#### Step 1.3: Mirror types in client composable

- **Files**: `ui/composables/useLanes.ts`
- **Action**: Replace `Round`, `ReviewItem`, `ReviewGroup` type definitions
  with `Feedback`, `Iteration`, `Item`, `Review`. Update `Lane.groups` to
  `Lane.reviews`. Update `ReviewDetail` to use new types. Update `getReview`
  to use `iterations` instead of `rounds`.
- **Verify**: Typecheck passes
- **Complexity**: Small

### Phase 2: Storage and API

#### Step 2.1: Create review storage utilities

- **Files**: `ui/server/utils/reviews.ts` (from Step 1.1)
- **Action**: Implement `scanReviews(reviewsDir)` that reads
  `.debussy/reviews/*/review.json` and their `items/*.json`. Implement
  `writeReviewDecision(reviewId, itemId, feedback)` that reads the item JSON,
  appends feedback to the last iteration (or creates a new iteration), and
  writes back atomically.
- **Test cases**:
  - `scanReviews` with empty directory returns `[]`
  - `scanReviews` with one review returns correct structure
  - `writeReviewDecision` adds feedback to last iteration
  - `writeReviewDecision` signals completion when all items have feedback
- **Verify**: Unit tests pass
- **Complexity**: Medium

#### Step 2.2: Create `/api/reviews/[reviewId].post.ts` endpoint

- **Files**: `ui/server/api/reviews/[reviewId].post.ts` (new)
- **Action**: Accept `{ itemId, action, comment? }`. Call
  `writeReviewDecision()`. Return `{ ok, complete }`. This replaces
  `/api/inbox/[sessionId].post.ts`.
- **Test cases**:
  - POST with valid item and action returns `{ ok: true }`
  - POST with missing fields returns 400
  - POST returns `complete: true` when all items decided
- **Verify**: Manual test with curl
- **Complexity**: Small

#### Step 2.3: Update `/api/lanes/index.get.ts` to read from `.debussy/reviews/`

- **Files**: `ui/server/api/lanes/index.get.ts`
- **Action**: Replace `scanInboxSessions` + `inboxSessionToReviewGroup` with
  `scanReviews`. Attach to root lane as `reviews` (not `groups`). Keep
  workflow card reading but convert output to `Review` format.
- **Verify**: `GET /api/lanes` returns new structure
- **Complexity**: Medium

#### Step 2.4: Remove old inbox utilities

- **Files**: `ui/server/utils/inbox.ts`, `ui/server/api/inbox/[sessionId].post.ts`
- **Action**: Delete both files. Remove imports from lanes API.
- **Verify**: No import errors, typecheck passes
- **Complexity**: Small

### Phase 3: Composables

#### Step 3.1: Update `useInbox` composable

- **Files**: `ui/composables/useInbox.ts`
- **Action**: Replace all `ReviewGroup` references with `Review`, `ReviewItem`
  with `Item`, `Round` with `Iteration`. Change `lane.groups` to
  `lane.reviews`, `group.items` to `review.items`, `item.rounds` to
  `item.iterations`. Replace `item.status` checks with `itemStatus(item)`
  calls. Update `activeRoundData` to `activeIterationData`. Update
  `selectedGroup` to `selectedReview`. Update `submitAction` to POST to
  `/api/reviews/{reviewId}` instead of `/api/inbox/{sessionId}`.
  Remove `inboxSessionId` references.
- **Verify**: Typecheck passes
- **Complexity**: Medium

#### Step 3.2: Update `useLanes` composable

- **Files**: `ui/composables/useLanes.ts`
- **Action**: Update `lanesWithPending` to use `lane.reviews` and
  `itemStatus()`. Update `getReview` to navigate `lane.reviews` and use
  `iterations`. Update `pendingCount` helper.
- **Verify**: Typecheck passes
- **Complexity**: Small

### Phase 4: Components

#### Step 4.1: Update `InboxListPanel.vue`

- **Files**: `ui/components/InboxListPanel.vue`
- **Action**: Replace prop types `ReviewGroup` -> `Review`, `Lane` -> `Lane`
  (same). Rename prop callbacks: `filteredItems(group)` ->
  `filteredItems(review)`. Update `lanePendingCount` and `pendingCount`
  signatures.
- **Verify**: No template errors, renders correctly
- **Complexity**: Small

#### Step 4.2: Update `InboxGroupSection.vue`

- **Files**: `ui/components/InboxGroupSection.vue`
- **Action**: Rename prop `groups` to `reviews`. Update type from
  `ReviewGroup[]` to `Review[]`. Replace `item.rounds.length` with
  `item.iterations.length`. Replace `item.status` with `itemStatus(item)`.
- **Verify**: Renders correctly
- **Complexity**: Small

#### Step 4.3: Update `ReviewItemDetail.vue`

- **Files**: `ui/components/ReviewItemDetail.vue`
- **Action**: Update prop types: `ReviewItem` -> `Item`, `ReviewGroup` ->
  `Review`. Replace `selectedItem.rounds` with `selectedItem.iterations`.
  Replace `activeRoundData.roundNumber` with `activeIterationData.number`.
  Replace `activeRoundData.feedback` with `activeIterationData.feedback`.
  Use `itemStatus()` for status checks. Rename `selectedGroup` to
  `selectedReview`.
- **Verify**: Renders correctly with iteration/feedback display
- **Complexity**: Medium

#### Step 4.4: Update `ReviewRoundSelector.vue` -> `ReviewIterationSelector.vue`

- **Files**: `ui/components/ReviewRoundSelector.vue`
- **Action**: Rename file to `ReviewIterationSelector.vue`. Update props:
  `rounds` -> `iterations` (type `Iteration[]`). Replace
  `round.roundNumber` with `iteration.number`. Update labels: "Round N" ->
  "Iteration N". Update status dot to use `itemStatus()`.
- **Verify**: Renders iteration tabs correctly
- **Complexity**: Small

#### Step 4.5: Update `ReviewFeedbackCard.vue`

- **Files**: `ui/components/ReviewFeedbackCard.vue`
- **Action**: Update prop type from `ReviewItem['rounds'][number]` to
  `Feedback`. Access `feedback.decision` instead of
  `roundData.feedbackStatus`. Access `feedback.comment` instead of
  `roundData.feedback`. Access `feedback.decidedAt` instead of
  `roundData.feedbackAt`.
- **Verify**: Renders feedback cards correctly
- **Complexity**: Small

#### Step 4.6: Update `LaneInboxTab.vue`

- **Files**: `ui/components/LaneInboxTab.vue`
- **Action**: Replace `ReviewGroup` with `Review`. Update prop
  `reviewGroups` to `reviews`. Update pending count to use `itemStatus()`.
- **Verify**: Lane inbox tab renders correctly
- **Complexity**: Small

#### Step 4.7: Update `LaneDetail.vue`

- **Files**: `ui/components/LaneDetail.vue`
- **Action**: Update any `groups` references to `reviews`. Update pending
  count computation.
- **Verify**: Lane detail page renders correctly
- **Complexity**: Small

#### Step 4.8: Update `inbox.vue` page

- **Files**: `ui/pages/inbox.vue`
- **Action**: Update any remaining template references to use new composable
  return values (`selectedReview` instead of `selectedGroup`,
  `activeIterationData` instead of `activeRoundData`, etc.).
- **Verify**: Inbox page functions end-to-end
- **Complexity**: Small

### Phase 5: Tests

#### Step 5.1: Update `lanes.test.ts`

- **Files**: `ui/server/utils/lanes.test.ts`
- **Action**: Update assertion `groups` -> `reviews` in
  `parseLanesFromWorktrees` tests.
- **Verify**: `npx vitest run ui/server/utils/lanes.test.ts`
- **Complexity**: Small

#### Step 5.2: Update `useInbox.test.ts`

- **Files**: `ui/composables/useInbox.test.ts`
- **Action**: Update `MOCK_LANES` fixture to use `reviews` instead of
  `groups`, `iterations` instead of `rounds`, `Feedback` objects instead of
  inline feedback fields. Update all assertions to use new property names.
  Rename `selectedGroup` references to `selectedReview`.
  Rename `activeRoundData` to `activeIterationData`.
- **Verify**: `npx vitest run ui/composables/useInbox.test.ts`
- **Complexity**: Medium

#### Step 5.3: Add unit tests for `reviews.ts` utilities

- **Files**: `ui/server/utils/reviews.test.ts` (new)
- **Action**: Test `itemStatus()`, `scanReviews()`,
  `writeReviewDecision()` with fixture data.
- **Test cases**:
  - `itemStatus` returns 'pending' when no feedback on last iteration
  - `itemStatus` returns 'approved' when last feedback is approved
  - `itemStatus` returns 'changes-requested' when last feedback is changes-requested
  - `scanReviews` returns empty array for missing directory
  - `scanReviews` parses review.json and items correctly
- **Verify**: `npx vitest run ui/server/utils/reviews.test.ts`
- **Complexity**: Medium

### Phase 6: Skills

#### Step 6.1: Update `review-gate` skill

- **Files**: `.claude/skills/review-gate/SKILL.md`
- **Action**: Update Step 5 to write to `.debussy/reviews/{session-id}/`
  instead of `.debussy/inbox/{session-id}/`. Write `review.json` (meta) and
  `items/{itemId}.json` (with single iteration). Update Step 6 filewatch
  path. Update Step 7 response format to read feedback from item JSON files.
  Update Step 9 cleanup path.
- **Verify**: Manual test of review-gate flow
- **Complexity**: Medium

#### Step 6.2: Update inbox page reference in skills

- **Files**: `.claude/skills/review-gate/SKILL.md`
- **Action**: Verify URL reference stays `localhost:4321/inbox` (page name
  unchanged).
- **Verify**: Check skill text
- **Complexity**: Small

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| In-flight inbox sessions lost during migration | Low | Old sessions are ephemeral and cleaned up by review-gate. No migration needed. |
| Component prop renames break template bindings | Medium | Phase 4 updates all consumers. Run typecheck after each step. |
| Workflow card integration breaks | Medium | Keep workflow card conversion in lanes API, adapt to Review format. |
| Review-gate skill fails with new storage format | High | Test manually after skill update. Skill is declarative (markdown), easy to fix. |

## Rollback Strategy

All changes are on a feature branch. If issues arise:
1. Revert the branch
2. Old `.debussy/inbox/` storage remains functional
3. No data migration means no data loss risk

## Execution Order

Phases 1-2 (types + storage) must be done first. Phases 3-4 (composables +
components) can be done together. Phase 5 (tests) interleaved with each
phase. Phase 6 (skills) last.

## Status

- [ ] Plan approved
- [ ] Implementation started
- [ ] Implementation complete
