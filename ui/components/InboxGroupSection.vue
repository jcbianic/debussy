<template>
  <div
    v-for="group in groups"
    :key="group.id"
  >
    <!-- Group header -->
    <button
      class="hover:bg-surface-hover-subtle border-line-subtle flex w-full items-center gap-2.5 border-b px-4 py-2.5 text-left transition-colors"
      @click="emit('toggleGroup', group.id)"
    >
      <UIcon
        :name="
          expanded.has(group.id)
            ? 'i-heroicons-chevron-down'
            : 'i-heroicons-chevron-right'
        "
        class="text-content-faint size-3 flex-shrink-0"
      />
      <UIcon
        :name="group.icon"
        class="text-content-faint size-3.5 flex-shrink-0"
      />
      <span class="flex-1 truncate text-xs font-medium">{{ group.title }}</span>
      <span class="text-content-faint text-xs">{{ pendingCount(group) }}</span>
    </button>

    <!-- Items -->
    <div v-if="expanded.has(group.id)">
      <button
        v-for="item in filteredItems(group)"
        :key="item.id"
        class="group border-line-subtle flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors"
        :class="
          selectedId === item.id
            ? 'bg-surface-sunken'
            : 'hover:bg-surface-hover-subtle'
        "
        @click="emit('select', item.id, laneId)"
      >
        <div class="w-3 flex-shrink-0" />
        <div class="min-w-0 flex-1 pt-0.5">
          <div class="flex items-center gap-1.5">
            <span
              class="truncate text-xs font-medium"
              :class="
                item.status === 'approved'
                  ? 'text-content-faint line-through'
                  : ''
              "
            >{{ item.title }}</span>
            <span
              v-if="item.rounds.length > 1"
              class="flex-shrink-0 font-mono text-xs text-blue-400"
            >×{{ item.rounds.length }}</span>
          </div>
          <div class="text-content-faint mt-0.5 truncate text-xs">
            {{ item.subtitle }}
          </div>
        </div>
        <!-- Quick actions on hover -->
        <div
          v-if="item.status === 'pending'"
          class="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <button
            class="flex size-5 items-center justify-center rounded text-green-600 transition-colors hover:bg-green-100 dark:hover:bg-green-900/30"
            title="Approve (a)"
          >
            <UIcon
              name="i-heroicons-check"
              class="size-3"
            />
          </button>
          <button
            class="flex size-5 items-center justify-center rounded text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
            title="Reject (r)"
          >
            <UIcon
              name="i-heroicons-x-mark"
              class="size-3"
            />
          </button>
        </div>
        <UBadge
          v-else
          :label="item.status"
          :color="statusColor(item.status)"
          variant="subtle"
          size="xs"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReviewGroup } from '~/composables/useLanes'

defineProps<{
  groups: ReviewGroup[]
  laneId: string
  selectedId: string | null
  expanded: Set<string>
  filteredItems: (group: ReviewGroup) => typeof group.items
  pendingCount: (group: ReviewGroup) => number
}>()

const emit = defineEmits<{
  select: [id: string, laneId: string]
  toggleGroup: [id: string]
}>()
</script>
