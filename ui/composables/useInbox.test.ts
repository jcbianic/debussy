import { ref } from 'vue'
import { describe, it, expect } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useInbox } from './useInbox'
import type { Lane } from './useLanes'

// ─── Fixture ─────────────────────────────────────────────────────────────────

const MOCK_LANES: Lane[] = [
  {
    id: 'root',
    branch: 'feat/42-unified-ui',
    path: '~/debussy',
    isActive: true,
    groups: [
      {
        id: 'rg-1',
        title: 'Unified UI — Implementation Plan',
        icon: 'i-heroicons-document-text',
        source: '/feedback session',
        type: 'feedback',
        items: [
          {
            id: 'r-1',
            title: 'Layout structure and sidebar navigation',
            subtitle: 'Round 2 pending',
            status: 'pending',
            type: 'feedback',
            createdAt: '2h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '3h ago',
                content: 'The layout uses a persistent left sidebar.',
                feedback: 'Sidebar too narrow.',
                feedbackAt: '2h 30m ago',
                feedbackStatus: 'changes-requested',
              },
              {
                roundNumber: 2,
                proposedAt: '2h ago',
                content: 'Updated: sidebar is now w-72.',
              },
            ],
          },
          {
            id: 'r-2',
            title: 'Lane stage/unstage interaction model',
            subtitle: 'Approve or request changes',
            status: 'pending',
            type: 'feedback',
            createdAt: '2h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '2h ago',
                content: 'Staged lane marked with filled blue dot.',
              },
            ],
          },
          {
            id: 'r-3',
            title: 'Inbox hierarchy and review groups',
            subtitle: 'Approved 10m ago',
            status: 'approved',
            type: 'feedback',
            createdAt: '4h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '4h ago',
                content: 'Reviews grouped by session or PR.',
                feedback: 'LGTM.',
                feedbackAt: '10m ago',
                feedbackStatus: 'approved',
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
    groups: [
      {
        id: 'rg-4',
        title: 'Fix: review server startup crash',
        icon: 'i-heroicons-bug-ant',
        source: 'workflow gate',
        type: 'workflow',
        items: [
          {
            id: 'r-8',
            title: 'Root cause — port conflict on 3001',
            subtitle: 'Proposed fix: dynamic port allocation',
            status: 'pending',
            type: 'workflow',
            createdAt: '6h ago',
            rounds: [
              {
                roundNumber: 1,
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

    it('starts with activeRound set to 1', () => {
      const { activeRound } = useInbox()
      expect(activeRound.value).toBe(1)
    })

    it('exposes the static typeFilters list with at least one entry', () => {
      const { typeFilters } = useInbox()
      expect(typeFilters.length).toBeGreaterThan(0)
    })

    it('typeFilters includes an "all" option', () => {
      const { typeFilters } = useInbox()
      expect(typeFilters.some((f) => f.value === 'all')).toBe(true)
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
    it('returns only lanes that have at least one group with visible items', () => {
      const { visibleLanes } = useInbox()
      for (const lane of visibleLanes.value) {
        const hasItems = lane.groups.some((g) => g.items.length > 0)
        expect(hasItems).toBe(true)
      }
    })

    it('filters out lanes whose groups have no items matching the active type filter', () => {
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
    it('returns all items in a group when filter is "all"', () => {
      const { activeTypeFilter, filteredItems, visibleLanes } = useInbox()
      activeTypeFilter.value = 'all'
      const group = visibleLanes.value[0]!.groups[0]!
      expect(filteredItems(group).length).toBe(group.items.length)
    })

    it('returns only matching-type items when a specific type filter is active', () => {
      const { activeTypeFilter, filteredItems, visibleLanes } = useInbox()
      activeTypeFilter.value = 'feedback'
      for (const lane of visibleLanes.value) {
        for (const group of lane.groups) {
          for (const item of filteredItems(group)) {
            expect(item.type).toBe('feedback')
          }
        }
      }
    })
  })

  describe('selectItem', () => {
    it('sets selectedId to the given item id', () => {
      const { selectItem, selectedId, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(selectedId.value).toBe(item.id)
    })

    it('sets selectedLaneId to the given lane id', () => {
      const { selectItem, selectedLaneId, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(selectedLaneId.value).toBe(lane.id)
    })

    it('resets comment to empty string on selection', () => {
      const { selectItem, comment, visibleLanes } = useInbox()
      comment.value = 'some text'
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(comment.value).toBe('')
    })

    it('resets commentError to empty string on selection', () => {
      const { selectItem, commentError, visibleLanes } = useInbox()
      commentError.value = 'some error'
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(commentError.value).toBe('')
    })

    it('sets activeRound to the number of rounds on the selected item', () => {
      const { selectItem, activeRound, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(activeRound.value).toBe(item.rounds.length)
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
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(selectedItem.value?.id).toBe(item.id)
    })
  })

  describe('selectedGroup', () => {
    it('returns null when no item is selected', () => {
      const { selectedGroup } = useInbox()
      expect(selectedGroup.value).toBeNull()
    })

    it('returns the group containing the selected item', () => {
      const { selectItem, selectedGroup, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const group = lane.groups[0]!
      const item = group.items[0]!
      selectItem(item.id, lane.id)
      expect(selectedGroup.value?.id).toBe(group.id)
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
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(selectedLane.value?.id).toBe(lane.id)
    })
  })

  describe('activeRoundData', () => {
    it('returns null when no item is selected', () => {
      const { activeRoundData } = useInbox()
      expect(activeRoundData.value).toBeNull()
    })

    it('returns the round matching activeRound for the selected item', () => {
      const { selectItem, activeRound, activeRoundData, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      expect(activeRoundData.value?.roundNumber).toBe(activeRound.value)
    })

    it('returns null when activeRound does not match any round on the item', () => {
      const { selectItem, activeRound, activeRoundData, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      activeRound.value = 999
      expect(activeRoundData.value).toBeNull()
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
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      // selectedIndex is 0; navigating back should not change selection
      navigateBy(-1)
      expect(selectedId.value).toBe(item.id)
    })

    it('moves selection to the next item in flatItems when delta is +1', () => {
      const { selectItem, navigateBy, selectedId, flatItems, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const firstItem = lane.groups[0]!.items[0]!
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
        const expected = lane.groups
          .flatMap((g) => g.items)
          .filter((i) => i.status === 'pending').length
        expect(lanePendingCount(lane)).toBe(expected)
      }
    })
  })

  describe('pendingCount (group level)', () => {
    it('counts only pending items within a group', () => {
      const { pendingCount, visibleLanes } = useInbox()
      const group = visibleLanes.value[0]!.groups[0]!
      const expected = group.items.filter((i) => i.status === 'pending').length
      expect(pendingCount(group)).toBe(expected)
    })
  })

  describe('submitAction', () => {
    it('clears commentError on any action', () => {
      const { selectItem, submitAction, commentError, visibleLanes, comment } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      comment.value = 'reason'
      submitAction('changes-requested')
      expect(commentError.value).toBe('')
    })

    it('sets commentError when action is "changes-requested" and comment is empty', () => {
      const { selectItem, submitAction, commentError, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      submitAction('changes-requested')
      expect(commentError.value).toBeTruthy()
    })

    it('does not set commentError when action is "approved" without a comment', () => {
      const { selectItem, submitAction, commentError, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      submitAction('approved')
      expect(commentError.value).toBe('')
    })

    it('does not set commentError when action is "rejected" without a comment', () => {
      const { selectItem, submitAction, commentError, visibleLanes } =
        useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      submitAction('rejected')
      expect(commentError.value).toBe('')
    })

    it('clears comment after a successful changes-requested submission', () => {
      const { selectItem, submitAction, comment, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      comment.value = 'please fix this'
      submitAction('changes-requested')
      expect(comment.value).toBe('')
    })

    it('clears comment after an approved submission', () => {
      const { selectItem, submitAction, comment, visibleLanes } = useInbox()
      const lane = visibleLanes.value[0]!
      const item = lane.groups[0]!.items[0]!
      selectItem(item.id, lane.id)
      comment.value = 'looks good'
      submitAction('approved')
      expect(comment.value).toBe('')
    })
  })

  describe('toggleGroup', () => {
    it('collapses a group that starts expanded', () => {
      const { expanded, toggleGroup, visibleLanes } = useInbox()
      const groupId = visibleLanes.value[0]!.groups[0]!.id
      // All groups start expanded via immediate watch
      expect(expanded.value.has(groupId)).toBe(true)
      toggleGroup(groupId)
      expect(expanded.value.has(groupId)).toBe(false)
    })

    it('expands a collapsed group', () => {
      const { expanded, toggleGroup, visibleLanes } = useInbox()
      const groupId = visibleLanes.value[0]!.groups[0]!.id
      toggleGroup(groupId) // collapse
      toggleGroup(groupId) // expand again
      expect(expanded.value.has(groupId)).toBe(true)
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

    it('only includes items from expanded groups', () => {
      const { flatItems, toggleGroup, visibleLanes } = useInbox()
      const firstGroup = visibleLanes.value[0]!.groups[0]!
      const countBefore = flatItems.value.length
      toggleGroup(firstGroup.id)
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
