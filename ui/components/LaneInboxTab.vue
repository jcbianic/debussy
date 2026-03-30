<template>
  <div class="px-8 py-6">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-sm font-semibold">Inbox</span>
        <div class="flex items-center gap-1">
          <button
            v-for="f in filters"
            :key="f.key"
            class="rounded-md px-2 py-0.5 text-xs transition-colors"
            :class="
              activeFilter === f.key
                ? 'bg-primary-500/15 text-primary-400 font-medium'
                : 'text-content-subtle hover:text-content-strong hover:bg-surface-tinted'
            "
            @click="activeFilter = f.key"
          >
            {{ f.label }}
            <span
              v-if="f.count > 0"
              class="ml-0.5 text-[10px] opacity-60"
            >{{
              f.count
            }}</span>
          </button>
        </div>
      </div>
    </div>

    <EmptyState
      v-if="filteredReviews.length === 0"
      icon="i-heroicons-inbox"
      :text="
        activeFilter === 'all' ? 'No reviews yet' : `No ${activeFilter} reviews`
      "
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="review in filteredReviews"
        :key="review.id"
        class="border-line overflow-hidden rounded-lg border"
      >
        <button
          class="bg-surface flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          @click="toggleGroup(review.id)"
        >
          <UIcon
            :name="
              expanded.has(review.id)
                ? 'i-heroicons-chevron-down'
                : 'i-heroicons-chevron-right'
            "
            class="size-3.5 flex-shrink-0 text-neutral-400"
          />
          <UIcon
            :name="review.icon"
            class="size-4 flex-shrink-0 text-neutral-400"
          />
          <span class="flex-1 text-sm font-medium">{{ review.title }}</span>
          <span class="mr-2 text-xs text-neutral-400">{{ review.source }}</span>
          <UBadge
            v-if="pendingCount(review) > 0"
            :label="`${pendingCount(review)} pending`"
            color="warning"
            variant="subtle"
            size="xs"
          />
          <UBadge
            v-else
            label="done"
            color="success"
            variant="subtle"
            size="xs"
          />
        </button>
        <div
          v-if="expanded.has(review.id)"
          class="border-line-subtle border-t"
        >
          <NuxtLink
            v-for="(item, i) in filterItems(review.items)"
            :key="item.id"
            :to="`/${basePath}/${laneId}/review/${encodeURIComponent(item.id)}`"
            class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            :class="
              i < filterItems(review.items).length - 1
                ? 'border-line-subtle border-b'
                : ''
            "
          >
            <div class="w-4 flex-shrink-0" />
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm">
                {{ item.title }}
              </div>
              <div class="mt-0.5 text-xs text-neutral-400">
                {{ item.subtitle }}
              </div>
            </div>
            <UBadge
              :label="derivedStatus(item)"
              :color="statusColor(derivedStatus(item))"
              variant="subtle"
              size="xs"
            />
            <UIcon
              name="i-heroicons-chevron-right"
              class="text-content-ghost size-3.5 flex-shrink-0"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Review, Item } from '~/shared/types/reviews'

const props = defineProps<{
  laneId: string
  basePath: 'lane' | 'worktree'
  reviews: Review[]
}>()

const activeFilter = ref<'all' | 'pending' | 'done'>('all')

const derivedStatus = (item: Item) => itemStatus(item)

const isPending = (item: Item) => itemStatus(item) === 'pending'

const pendingCount = (r: Review) => r.items.filter((i) => isPending(i)).length

const totalPending = computed(
  () => props.reviews.flatMap((r) => r.items).filter((i) => isPending(i)).length
)

const totalDone = computed(
  () =>
    props.reviews.flatMap((r) => r.items).filter((i) => !isPending(i)).length
)

const filters = computed(() => [
  {
    key: 'all' as const,
    label: 'All',
    count: props.reviews.flatMap((r) => r.items).length,
  },
  { key: 'pending' as const, label: 'Pending', count: totalPending.value },
  { key: 'done' as const, label: 'Done', count: totalDone.value },
])

function filterItems(items: Item[]): Item[] {
  if (activeFilter.value === 'pending') return items.filter((i) => isPending(i))
  if (activeFilter.value === 'done') return items.filter((i) => !isPending(i))
  return items
}

const filteredReviews = computed(() => {
  if (activeFilter.value === 'all') return props.reviews
  return props.reviews.filter((r) => filterItems(r.items).length > 0)
})

const { expanded, toggle: toggleGroup } = useExpandable(
  props.reviews.map((r) => r.id)
)
</script>
