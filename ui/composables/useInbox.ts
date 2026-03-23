import type { ReviewItem, ReviewGroup, Lane } from '~/composables/useLanes'

/** Provide all state and logic for the inbox page. */
export const useInbox = () => {
  const { lanes: allLanes } = useLanes()

  const typeFilters = [
    { value: 'all', label: 'All', icon: 'i-heroicons-funnel' },
    {
      value: 'feedback',
      label: 'Feedback',
      icon: 'i-heroicons-document-text',
    },
    {
      value: 'code-review',
      label: 'Code',
      icon: 'i-heroicons-code-bracket',
    },
    { value: 'workflow', label: 'Workflow', icon: 'i-heroicons-arrow-path' },
  ]

  const activeTypeFilter = ref('all')
  const selectedId = ref<string | null>(null)
  const selectedLaneId = ref<string | null>(null)
  const activeRound = ref(1)

  const filteredItems = (group: ReviewGroup) =>
    activeTypeFilter.value === 'all'
      ? group.items
      : group.items.filter((i) => i.type === activeTypeFilter.value)

  const visibleLanes = computed(() =>
    allLanes.value.filter((l: Lane) =>
      l.groups.some((g: ReviewGroup) => filteredItems(g).length > 0)
    )
  )

  const totalPending = computed(
    () =>
      allLanes.value
        .flatMap((l: Lane) => l.groups.flatMap((g: ReviewGroup) => g.items))
        .filter((i: ReviewItem) => i.status === 'pending').length
  )
  const totalItems = computed(
    () =>
      allLanes.value.flatMap((l: Lane) =>
        l.groups.flatMap((g: ReviewGroup) => g.items)
      ).length
  )
  const lanePendingCount = (lane: Lane) =>
    lane.groups
      .flatMap((g: ReviewGroup) => g.items)
      .filter((i: ReviewItem) => i.status === 'pending').length

  // Start with empty set; expand new group IDs as data loads
  const { expanded, toggle: toggleGroup } = useExpandable([])
  watch(
    () =>
      allLanes.value.flatMap((l: Lane) =>
        l.groups.map((g: ReviewGroup) => g.id)
      ),
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

  const pendingCount = (g: ReviewGroup) =>
    g.items.filter((i: ReviewItem) => i.status === 'pending').length

  const flatItems = computed(() => {
    const result: Array<{ item: ReviewItem; laneId: string }> = []
    for (const lane of visibleLanes.value) {
      for (const group of lane.groups) {
        if (!expanded.value.has(group.id)) continue
        for (const item of filteredItems(group)) {
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
      l.groups.flatMap((g: ReviewGroup) => g.items)
    )
  )

  const selectItem = (id: string, laneId: string) => {
    selectedId.value = id
    selectedLaneId.value = laneId
    comment.value = ''
    commentError.value = ''
    const item = allItems.value.find((i: ReviewItem) => i.id === id)
    if (item) activeRound.value = item.rounds.length
  }

  const navigateBy = (delta: number) => {
    const next = selectedIndex.value + delta
    if (next < 0 || next >= flatItems.value.length) return
    const entry = flatItems.value[next]
    if (!entry) return
    selectItem(entry.item.id, entry.laneId)
  }

  const selectedItem = computed(
    () =>
      allItems.value.find((i: ReviewItem) => i.id === selectedId.value) ?? null
  )
  const selectedGroup = computed(
    () =>
      allLanes.value
        .flatMap((l: Lane) => l.groups)
        .find((g: ReviewGroup) =>
          g.items.some((i: ReviewItem) => i.id === selectedId.value)
        ) ?? null
  )
  const selectedLane = computed(
    () =>
      allLanes.value.find((l: Lane) => l.id === selectedLaneId.value) ?? null
  )
  const pendingInLane = computed(
    () =>
      selectedLane.value?.groups
        .flatMap((g: ReviewGroup) => g.items)
        .filter((i: ReviewItem) => i.status === 'pending').length ?? 0
  )
  const activeRoundData = computed(
    () =>
      selectedItem.value?.rounds.find(
        (r) => r.roundNumber === activeRound.value
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
      if (fwd?.item.status === 'pending') {
        selectItem(fwd.item.id, fwd.laneId)
        return
      }
    }
    for (let i = 0; i < start; i++) {
      const fwd = flatItems.value[i]
      if (fwd?.item.status === 'pending') {
        selectItem(fwd.item.id, fwd.laneId)
        return
      }
    }
  }

  const submitAction = (
    action: 'approved' | 'changes-requested' | 'rejected'
  ) => {
    commentError.value = ''
    if (action === 'changes-requested' && !comment.value.trim()) {
      commentError.value = 'A comment is required when requesting changes.'
      return
    }
    comment.value = ''
    navigateToNextPending()
  }

  return {
    typeFilters,
    activeTypeFilter,
    selectedId,
    selectedLaneId,
    activeRound,
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
    selectedGroup,
    selectedLane,
    pendingInLane,
    activeRoundData,
    comment,
    commentError,
    commentPlaceholder,
    submitAction,
  }
}
