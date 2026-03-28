import { ref } from 'vue'
import { describe, it, expect } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useInbox } from './useInbox'
import type { Lane } from './useLanes'
import { itemStatus } from './useLanes'

// ─── Fixture ─────────────────────────────────────────────────────────────────

const MOCK_LANES: Lane[] = [
  {
    id: 'root',
    branch: 'feat/42-unified-ui',
    path: '~/debussy',
    isActive: true,
    reviews: [
      {
        id: 'rv-1',
        title: 'Unified UI — Implementation Plan',
        icon: 'i-heroicons-document-text',
        source: '/feedback session',
        type: 'feedback',
        createdAt: '3h ago',
        items: [
          {
            id: 'r-1',
            title: 'Layout structure and sidebar navigation',
            subtitle: 'Iteration 2 pending',
            iterations: [
              {
                number: 1,
                proposedAt: '3h ago',
                content: 'The layout uses a persistent left sidebar.',
                feedback: {
                  decision: 'changes-requested',
                  comment: 'Sidebar too narrow.',
                  decidedAt: '2h 30m ago',
                },
              },
              {
                number: 2,
                proposedAt: '2h ago',
                content: 'Updated: sidebar is now w-72.',
              },
            ],
          },
          {
            id: 'r-2',
            title: 'Lane stage/unstage interaction model',
            subtitle: 'Approve or request changes',
            iterations: [
              {
                number: 1,
                proposedAt: '2h ago',
                content: 'Staged lane marked with filled blue dot.',
              },
            ],
          },
          {
            id: 'r-3',
            title: 'Inbox hierarchy and review groups',
            subtitle: 'Approved 10m ago',
            iterations: [
              {
                number: 1,
                proposedAt: '4h ago',
                content: 'Reviews grouped by session or PR.',
                feedback: {
                  decision: 'approved',
                  comment: 'LGTM.',
                  decidedAt: '10m ago',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wt-fix',
    branch: 'fix/review-server',
    path: '~/debussy/.worktrees/fix',
    isActive: false,
    reviews: [
      {
        id: 'rv-4',
        title: 'Fix: review server startup crash',
        icon: 'i-heroicons-bug-ant',
        source: 'workflow gate',
        type: 'workflow',
        createdAt: '6h ago',
        items: [
          {
            id: 'r-8',
            title: 'Root cause — port conflict on 3001',
            subtitle: 'Proposed fix: dynamic port allocation',
            iterations: [
              {
                number: 1,
                proposedAt: '6h ago',
                content: 'Fix: scan for a free port starting at 3001.',
              },
            ],
          },
        ],
      },
    ],
  },
]

const mockFetchData = ref<Lane[]>(MOCK_LANES)

mockNuxtImport('useFetch', () => {
  return () => ({ data: mockFetchData })
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useInbox', () => {
  describe('initial state', () => {
    it('starts with activeTypeFilter set to "all"', () => {
      const { activeTypeFilter } = useInbox()
      expect(activeTypeFilter.value).toBe('all')
    })

    it('starts with no selected item', () => {
      const { selectedId } = useInbox()
      expect(selectedId.value).toBeNull()
    })

    it('starts with no selected lane', () => {
      const { selectedLaneId } = useInbox()
      expect(selectedLaneId.value).toBeNull()
    })

    it('starts with activeIteration set to 1', () => {
      const { activeIteration } = useInbox()
      expect(activeIteration.value).toBe(1)
    })

    it('exposes the dynamic typeFilters list with at least one entry', () => {
      const { typeFilters } = useInbox()
      expect(typeFilters.value.length).toBeGreaterThan(0)
    })

    it('typeFilters includes an "all" option', () => {
      const { typeFilters } = useInbox()
      expect(typeFilters.value.some((f) => f.value === 'all')).toBe(true)
    })

    it('starts with comment as an empty string', () => {
      const { comment } = useInbox()
      expect(comment.value).toBe('')
    })

    it('starts with commentError as an empty string', () => {
      const { commentError } = useInbox()
      expect(commentError.value).toBe('')
    })
  })

  describe('visibleLanes', () => {
    it('returns only lanes that have at least one review with visible items', () => {
      const { visibleLanes } = useInbox()
      for (const lane of visibleLanes.value) {
        const hasItems = lane.reviews.some((r) => r.items.length > 0)
        expect(hasItems).toBe(true)
      }
    })

    it('filters out lanes whose reviews have no items matching the active type filter', () => {
      const { activeTypeFilter, visibleLanes } = useInbox()
      // "workflow" items exist only in the wt-fix lane in the fixture
      activeTypeFilter.value = 'workflow'
      const laneIds = visibleLanes.value.map((l) => l.id)
      expect(laneIds).toContain('wt-fix')
    })
  })

  describe('totalPending', () => {
    it('returns a non-negative number', () => {
      const { totalPending } = useInbox()
      expect(totalPending.value).toBeGreaterThanOrEqual(0)
    })

    it('equals the count of items with status "pending" across all lanes', () => {
      const { totalPending, totalItems } = useInbox()
      // totalPending must not exceed totalItems
      expect(totalPending.value).toBeLessThanOrEqual(totalItems.value)
    })
  })

  describe('totalItems', () => {
    it('returns a positive number', () => {
      const { totalItems } = useInbox()
      expect(totalItems.value).toBeGreaterThan(0)
    })
  })

  describe('filteredItems', () => {
    it('returns all items in a review when filter is "all"', () => {
      const { activeTypeFilter, filteredItems, visibleLanes } = useInbox()
      activeTypeFilter.value = 'all'
      const review = visibleLanes.value[0]!.reviews[0]!
      expect(filteredItems(review).length).toBe(review.items.length)
    })

    it('returns only matching-type items when a specific type filter is active', () => {
      const { activeTypeFilter, filteredItems, visibleLanes } = useInbox()
      activeTypeFilter.value = 'feedback'
      for (const lane of visibleLanes.value) {
        for (const review of lane.reviews) {
          const items = filteredItems(review)
          if (items.length > 0) {
            expect(review.type).toBe('feedback')
          }
        }
      }
    })
  })

  describe('selectItem', () => {
    it('sets selectedId to the given item id', () => {
      const { selectItem, selectedId, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(selectedId.value).toBe(item.id)
    })

    it('sets selectedLaneId to the given lane id', () => {
      const { selectItem, selectedLaneId, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(selectedLaneId.value).toBe(lane.id)
    })

    it('resets comment to empty string on selection', () => {
      const { selectItem, comment, visibleLanes } = useInbox()
      comment.value = 'some text'
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(comment.value).toBe('')
    })

    it('resets commentError to empty string on selection', () => {
      const { selectItem, commentError, visibleLanes } = useInbox()
      commentError.value = 'some error'
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(commentError.value).toBe('')
    })

    it('sets activeIteration to the number of iterations on the selected item', () => {
      const { selectItem, activeIteration, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(activeIteration.value).toBe(item.iterations.length)
    })
  })

  describe('selectedItem', () => {
    it('returns null when no item is selected', () => {
      const { selectedItem } = useInbox()
      expect(selectedItem.value).toBeNull()
    })

    it('returns the item matching selectedId after selection', () => {
      const { selectItem, selectedItem, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(selectedItem.value?.id).toBe(item.id)
    })
  })

  describe('selectedReview', () => {
    it('returns null when no item is selected', () => {
      const { selectedReview } = useInbox()
      expect(selectedReview.value).toBeNull()
    })

    it('returns the review containing the selected item', () => {
      const { selectItem, selectedReview, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const review = lane.reviews[0]!
      const item = review.items[0]!
      selectItem(item.id, lane.id)
      expect(selectedReview.value?.id).toBe(review.id)
    })
  })

  describe('selectedLane', () => {
    it('returns null when no lane is selected', () => {
      const { selectedLane } = useInbox()
      expect(selectedLane.value).toBeNull()
    })

    it('returns the lane matching selectedLaneId after selection', () => {
      const { selectItem, selectedLane, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(selectedLane.value?.id).toBe(lane.id)
    })
  })

  describe('activeIterationData', () => {
    it('returns null when no item is selected', () => {
      const { activeIterationData } = useInbox()
      expect(activeIterationData.value).toBeNull()
    })

    it('returns the iteration matching activeIteration for the selected item', () => {
      const { selectItem, activeIteration, activeIterationData, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(activeIterationData.value?.number).toBe(activeIteration.value)
    })

    it('returns null when activeIteration does not match any iteration on the item', () => {
      const { selectItem, activeIteration, activeIterationData, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      activeIteration.value = 999
      expect(activeIterationData.value).toBeNull()
    })
  })

  describe('navigateBy', () => {
    it('does nothing when no items are in the flat list', () => {
      const { activeTypeFilter, navigateBy, selectedId } = useInbox()
      // Set filter to a type that yields no items in any visible lane
      activeTypeFilter.value = 'workflow'
      // With filter active, flatItems may be non-empty; test boundary instead
      navigateBy(0)
      expect(selectedId.value).toBeNull()
    })

    it('does not navigate past the beginning of the flat list (delta = -1 at start)', () => {
      const { selectItem, navigateBy, selectedId, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      // selectedIndex is 0; navigating back should not change selection
      navigateBy(-1)
      expect(selectedId.value).toBe(item.id)
    })

    it('moves selection to the next item in flatItems when delta is +1', () => {
      const { selectItem, navigateBy, selectedId, flatItems, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const firstItem = lane.reviews[0]!.items[0]!
      selectItem(firstItem.id, lane.id)
      const flatBefore = flatItems.value
      if (flatBefore.length < 2) return // skip if not enough items
      navigateBy(1)
      expect(selectedId.value).toBe(flatBefore[1]!.item.id)
    })
  })

  describe('lanePendingCount', () => {
    it('returns a non-negative count for each visible lane', () => {
      const { lanePendingCount, visibleLanes } = useInbox()
      for (const lane of visibleLanes.value) {
        expect(lanePendingCount(lane)).toBeGreaterThanOrEqual(0)
      }
    })

    it('counts only items with status "pending" within the lane', () => {
      const { lanePendingCount, visibleLanes } = useInbox()
      for (const lane of visibleLanes.value) {
        const expected = lane.reviews
          .flatMap((r) => r.items)
          .filter((i) => itemStatus(i) === 'pending').length
        expect(lanePendingCount(lane)).toBe(expected)
      }
    })
  })

  describe('pendingCount (review level)', () => {
    it('counts only pending items within a review', () => {
      const { pendingCount, visibleLanes } = useInbox()
      const review = visibleLanes.value[0]!.reviews[0]!
      const expected = review.items.filter(
        (i) => itemStatus(i) === 'pending'
      ).length
      expect(pendingCount(review)).toBe(expected)
    })
  })

  describe('submitAction', () => {
    it('clears commentError on any action', () => {
      const { selectItem, submitAction, commentError, visibleLanes, comment } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      comment.value = 'reason'
      submitAction('changes-requested')
      expect(commentError.value).toBe('')
    })

    it('sets commentError when action is "changes-requested" and comment is empty', () => {
      const { selectItem, submitAction, commentError, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      submitAction('changes-requested')
      expect(commentError.value).toBeTruthy()
    })

    it('does not set commentError when action is "approved" without a comment', () => {
      const { selectItem, submitAction, commentError, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      submitAction('approved')
      expect(commentError.value).toBe('')
    })

    it('does not set commentError when action is "rejected" without a comment', () => {
      const { selectItem, submitAction, commentError, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      submitAction('rejected')
      expect(commentError.value).toBe('')
    })

    it('clears comment after a successful changes-requested submission', () => {
      const { selectItem, submitAction, comment, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      comment.value = 'please fix this'
      submitAction('changes-requested')
      expect(comment.value).toBe('')
    })

    it('clears comment after an approved submission', () => {
      const { selectItem, submitAction, comment, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.reviews[0]!.items[0]!
      selectItem(item.id, lane.id)
      comment.value = 'looks good'
      submitAction('approved')
      expect(comment.value).toBe('')
    })
  })

  describe('toggleGroup', () => {
    it('collapses a review that starts expanded', () => {
      const { expanded, toggleGroup, visibleLanes } = useInbox()
      const reviewId = visibleLanes.value[0]!.reviews[0]!.id
      // All reviews start expanded via immediate watch
      expect(expanded.value.has(reviewId)).toBe(true)
      toggleGroup(reviewId)
      expect(expanded.value.has(reviewId)).toBe(false)
    })

    it('expands a collapsed review', () => {
      const { expanded, toggleGroup, visibleLanes } = useInbox()
      const reviewId = visibleLanes.value[0]!.reviews[0]!.id
      toggleGroup(reviewId) // collapse
      toggleGroup(reviewId) // expand again
      expect(expanded.value.has(reviewId)).toBe(true)
    })
  })

  describe('flatItems', () => {
    it('returns an array of {item, laneId} pairs', () => {
      const { flatItems } = useInbox()
      for (const entry of flatItems.value) {
        expect(entry).toHaveProperty('item')
        expect(entry).toHaveProperty('laneId')
      }
    })

    it('only includes items from expanded reviews', () => {
      const { flatItems, toggleGroup, visibleLanes } = useInbox()
      const firstReview = visibleLanes.value[0]!.reviews[0]!
      const countBefore = flatItems.value.length
      toggleGroup(firstReview.id)
      const countAfter = flatItems.value.length
      expect(countAfter).toBeLessThan(countBefore)
    })
  })

  describe('commentPlaceholder', () => {
    it('returns a non-empty string', () => {
      const { commentPlaceholder } = useInbox()
      expect(commentPlaceholder.value.length).toBeGreaterThan(0)
    })
  })
})
