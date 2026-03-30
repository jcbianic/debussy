<template>
  <div class="flex h-full">
    <InboxListPanel
      :visible-lanes="visibleLanes"
      :selected-id="selectedId"
      :expanded="expanded"
      :active-type-filter="activeTypeFilter"
      :type-filters="typeFilters"
      :filtered-items="filteredItems"
      :lane-pending-count="lanePendingCount"
      :pending-count="pendingCount"
      :total-pending="totalPending"
      :total-items="totalItems"
      :single-lane="!!laneId"
      @select="selectItem"
      @toggle-group="toggleGroup"
      @update-filter="activeTypeFilter = $event"
    />
    <ReviewItemDetail
      v-model:comment="comment"
      v-model:comment-error="commentError"
      :selected-item="selectedItem"
      :selected-review="selectedReview"
      :selected-lane="selectedLane"
      :selected-lane-id="selectedLaneId"
      :selected-index="selectedIndex"
      :flat-items-length="flatItems.length"
      :active-iteration="activeIteration"
      :active-iteration-data="activeIterationData"
      :pending-in-lane="pendingInLane"
      :comment-placeholder="commentPlaceholder"
      @navigate="navigateBy"
      @set-iteration="activeIteration = $event"
      @submit="submitAction"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  laneId?: string
}>()

const {
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
  submitAction,
  refreshLanes,
} = useInbox({ laneId: props.laneId })

// Live reload when review files change
useWatchSSE(() => refreshLanes())

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

const onKey = (e: KeyboardEvent) => {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  )
    return
  if (e.key === 'j') {
    e.preventDefault()
    navigateBy(1)
  }
  if (e.key === 'k') {
    e.preventDefault()
    navigateBy(-1)
  }
}
</script>
