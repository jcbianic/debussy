<template>
  <div class="border-line flex w-96 flex-shrink-0 flex-col border-r">
    <!-- Header + filters -->
    <div class="border-line bg-surface border-b px-5 py-4">
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h1 class="text-sm font-semibold">
            Inbox of {{ projectName }}
          </h1>
          <p class="text-content-faint mt-0.5 font-mono text-xs">
            {{ totalPending }} pending · {{ totalItems }} total
          </p>
        </div>
        <div class="text-content-faint flex items-center gap-1.5 text-xs">
          <UIcon
            name="i-heroicons-command-line"
            class="size-3.5"
          />
          <span class="font-mono">j/k · a · r</span>
        </div>
      </div>
      <SegmentedControl
        :model-value="activeTypeFilter"
        :options="typeFilters"
        @update:model-value="emit('updateFilter', $event)"
      />
    </div>

    <!-- Items list -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="lane in visibleLanes"
        :key="lane.id"
      >
        <!-- Lane separator -->
        <div
          class="bg-surface-hover-subtle border-line-subtle sticky top-0 z-10 flex items-center gap-2 border-b px-4 py-2 backdrop-blur-sm"
        >
          <div
            class="size-1.5 rounded-full"
            :class="lane.isActive ? 'bg-blue-500' : 'bg-neutral-400'"
          />
          <span class="text-content-subtle font-mono text-xs font-medium">{{
            lane.branch
          }}</span>
          <UBadge
            v-if="lane.isActive"
            label="staged"
            color="primary"
            variant="subtle"
            size="xs"
          />
          <span class="text-content-faint ml-auto text-xs">{{
            lanePendingCount(lane)
          }}</span>
        </div>

        <InboxGroupSection
          :reviews="lane.reviews"
          :lane-id="lane.id"
          :selected-id="selectedId"
          :expanded="expanded"
          :filtered-items="filteredItems"
          :pending-count="pendingCount"
          @select="(id, laneId) => emit('select', id, laneId)"
          @toggle-group="emit('toggleGroup', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Review } from '~/shared/types/reviews'
import type { Lane } from '~/composables/useLanes'

const { name: projectName } = useProjectConfig()

defineProps<{
  visibleLanes: Lane[]
  selectedId: string | null
  expanded: Set<string>
  activeTypeFilter: string
  typeFilters: { value: string; label: string; icon: string }[]
  filteredItems: (review: Review) => typeof review.items
  lanePendingCount: (lane: Lane) => number
  pendingCount: (review: Review) => number
  totalPending: number
  totalItems: number
}>()

const emit = defineEmits<{
  select: [id: string, laneId: string]
  toggleGroup: [id: string]
  updateFilter: [value: string]
}>()
</script>
