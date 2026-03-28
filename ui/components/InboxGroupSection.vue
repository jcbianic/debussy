<template>
  <div
    v-for="review in reviews"
    :key="review.id"
  >
    <!-- Review header -->
    <button
      class="hover:bg-surface-hover-subtle border-line-subtle flex w-full items-center gap-2.5 border-b px-4 py-2.5 text-left transition-colors"
      @click="emit('toggleGroup', review.id)"
    >
      <UIcon
        :name="
          expanded.has(review.id)
            ? 'i-heroicons-chevron-down'
            : 'i-heroicons-chevron-right'
        "
        class="text-content-faint size-3 flex-shrink-0"
      />
      <UIcon
        :name="review.icon"
        class="text-content-faint size-3.5 flex-shrink-0"
      />
      <span class="flex-1 truncate text-xs font-medium">{{
        review.title
      }}</span>
      <span class="text-content-faint text-xs">{{ pendingCount(review) }}</span>
    </button>

    <!-- Items -->
    <div v-if="expanded.has(review.id)">
      <button
        v-for="item in filteredItems(review)"
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
                derivedStatus(item) === 'approved'
                  ? 'text-content-faint line-through'
                  : ''
              "
            >{{ item.title }}</span>
            <span
              v-if="item.iterations.length > 1"
              class="flex-shrink-0 font-mono text-xs text-blue-400"
            >×{{ item.iterations.length }}</span>
          </div>
          <div class="text-content-faint mt-0.5 truncate text-xs">
            {{ item.subtitle }}
          </div>
        </div>
        <!-- Quick actions on hover -->
        <div
          v-if="derivedStatus(item) === 'pending'"
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
          :label="derivedStatus(item)"
          :color="statusColor(derivedStatus(item))"
          variant="subtle"
          size="xs"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Review, Item } from '~/shared/types/reviews'

defineProps<{
  reviews: Review[]
  laneId: string
  selectedId: string | null
  expanded: Set<string>
  filteredItems: (review: Review) => Item[]
  pendingCount: (review: Review) => number
}>()

const emit = defineEmits<{
  select: [id: string, laneId: string]
  toggleGroup: [id: string]
}>()

const derivedStatus = (item: Item) => itemStatus(item)
</script>
