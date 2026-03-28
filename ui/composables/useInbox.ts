import type { Item, Review, Lane } from '~/shared/types/reviews'

const TYPE_ICONS: Record<string, string> = {
  feedback: 'i-heroicons-document-text',
  review: 'i-heroicons-document-magnifying-glass',
  workflow: 'i-heroicons-arrow-path',
  strategy: 'i-heroicons-adjustments-horizontal',
}

/** Provide all state and logic for the inbox page. */
export const useInbox = () => {
  const { lanes: allLanes, refresh } = useLanes()

  const typeFilters = computed(() => {
    const seen = new Set<string>()
    for (const lane of allLanes.value) {
      for (const review of lane.reviews) {
        if (review.items.length > 0) {
          seen.add(review.type)
        }
      }
    }
    const dynamic = [...seen].sort().map((t) => ({
      value: t,
      label: t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' '),
      icon: TYPE_ICONS[t] ?? 'i-heroicons-inbox',
    }))
    return [
      { value: 'all', label: 'All', icon: 'i-heroicons-funnel' },
      ...dynamic,
    ]
  })

  const activeTypeFilter = ref('all')
  const selectedId = ref<string | null>(null)
  const selectedLaneId = ref<string | null>(null)
  const activeIteration = ref(1)

  const filteredItems = (review: Review): Item[] => {
    if (activeTypeFilter.value === 'all') return review.items
    if (review.type !== activeTypeFilter.value) return []
    return review.items
  }

  const visibleLanes = computed(() =>
    allLanes.value.filter((l: Lane) =>
      l.reviews.some((r: Review) => filteredItems(r).length > 0)
    )
  )

  const totalPending = computed(
    () =>
      allLanes.value
        .flatMap((l: Lane) => l.reviews.flatMap((r: Review) => r.items))
        .filter((i: Item) => itemStatus(i) === 'pending').length
  )
  const totalItems = computed(
    () =>
      allLanes.value.flatMap((l: Lane) =>
        l.reviews.flatMap((r: Review) => r.items)
      ).length
  )
  const lanePendingCount = (lane: Lane) =>
    lane.reviews
      .flatMap((r: Review) => r.items)
      .filter((i: Item) => itemStatus(i) === 'pending').length

  // Start with empty set; expand new review IDs as data loads
  const { expanded, toggle: toggleGroup } = useExpandable([])
  watch(
    () =>
      allLanes.value.flatMap((l: Lane) => l.reviews.map((r: Review) => r.id)),
    (ids: string[]) => {
      let changed = false
      for (const id of ids) {
        if (!expanded.value.has(id)) {
          expanded.value.add(id)
          changed = true
        }
      }
      if (changed) expanded.value = new Set(expanded.value)
    },
    { immediate: true }
  )

  const pendingCount = (r: Review) =>
    r.items.filter((i: Item) => itemStatus(i) === 'pending').length

  const flatItems = computed(() => {
    const result: Array<{ item: Item; laneId: string }> = []
    for (const lane of visibleLanes.value) {
      for (const review of lane.reviews) {
        if (!expanded.value.has(review.id)) continue
        for (const item of filteredItems(review)) {
          result.push({ item, laneId: lane.id })
        }
      }
    }
    return result
  })

  const selectedIndex = computed(() =>
    flatItems.value.findIndex((x) => x.item.id === selectedId.value)
  )

  const allItems = computed(() =>
    allLanes.value.flatMap((l: Lane) =>
      l.reviews.flatMap((r: Review) => r.items)
    )
  )

  const selectItem = (id: string, laneId: string) => {
    selectedId.value = id
    selectedLaneId.value = laneId
    comment.value = ''
    commentError.value = ''
    const item = allItems.value.find((i: Item) => i.id === id)
    if (item) activeIteration.value = item.iterations.length
  }

  const navigateBy = (delta: number) => {
    const next = selectedIndex.value + delta
    if (next < 0 || next >= flatItems.value.length) return
    const entry = flatItems.value[next]
    if (!entry) return
    selectItem(entry.item.id, entry.laneId)
  }

  const selectedItem = computed(
    () => allItems.value.find((i: Item) => i.id === selectedId.value) ?? null
  )
  const selectedReview = computed(
    () =>
      allLanes.value
        .flatMap((l: Lane) => l.reviews)
        .find((r: Review) =>
          r.items.some((i: Item) => i.id === selectedId.value)
        ) ?? null
  )
  const selectedLane = computed(
    () =>
      allLanes.value.find((l: Lane) => l.id === selectedLaneId.value) ?? null
  )
  const pendingInLane = computed(
    () =>
      selectedLane.value?.reviews
        .flatMap((r: Review) => r.items)
        .filter((i: Item) => itemStatus(i) === 'pending').length ?? 0
  )
  const activeIterationData = computed(
    () =>
      selectedItem.value?.iterations.find(
        (it) => it.number === activeIteration.value
      ) ?? null
  )

  const comment = ref('')
  const commentError = ref('')
  const commentPlaceholder = computed(
    () => 'Add a comment… (required for Request changes)'
  )

  const navigateToNextPending = () => {
    const start = selectedIndex.value
    for (let i = start + 1; i < flatItems.value.length; i++) {
      const fwd = flatItems.value[i]
      if (fwd && itemStatus(fwd.item) === 'pending') {
        selectItem(fwd.item.id, fwd.laneId)
        return
      }
    }
    for (let i = 0; i < start; i++) {
      const fwd = flatItems.value[i]
      if (fwd && itemStatus(fwd.item) === 'pending') {
        selectItem(fwd.item.id, fwd.laneId)
        return
      }
    }
  }

  const submitting = ref(false)

  const submitAction = async (
    action: 'approved' | 'changes-requested' | 'rejected'
  ) => {
    commentError.value = ''
    if (action === 'changes-requested' && !comment.value.trim()) {
      commentError.value = 'A comment is required when requesting changes.'
      return
    }

    const item = selectedItem.value
    const review = selectedReview.value
    if (!item || !review) return

    submitting.value = true
    try {
      await $fetch(`/api/reviews/${review.id}`, {
        method: 'POST',
        body: {
          itemId: item.id,
          action,
          comment: comment.value.trim() || undefined,
        },
      })

      // Update local state optimistically — add feedback to last iteration
      const lastIteration = item.iterations.at(-1)
      if (lastIteration) {
        lastIteration.feedback = {
          decision: action,
          comment: comment.value.trim() || undefined,
          decidedAt: new Date().toISOString(),
        }
      }
    } catch {
      commentError.value = 'Failed to submit review. Try again.'
      submitting.value = false
      return
    }
    submitting.value = false

    comment.value = ''
    navigateToNextPending()
  }

  return {
    typeFilters,
    activeTypeFilter,
    selectedId,
    selectedLaneId,
    activeIteration,
    filteredItems,
    visibleLanes,
    totalPending,
    totalItems,
    lanePendingCount,
    expanded,
    toggleGroup,
    pendingCount,
    flatItems,
    selectedIndex,
    selectItem,
    navigateBy,
    selectedItem,
    selectedReview,
    selectedLane,
    pendingInLane,
    activeIterationData,
    comment,
    commentError,
    commentPlaceholder,
    submitting,
    submitAction,
    refreshLanes: refresh,
  }
}
