<template>
  <div class="px-8 py-6">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm font-semibold">Inbox</span>
      <span class="text-xs text-neutral-400">{{ totalPending }} pending</span>
    </div>

    <EmptyState
      v-if="reviewGroups.length === 0"
      icon="i-heroicons-inbox"
      text="No pending reviews"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="group in reviewGroups"
        :key="group.id"
        class="border-line overflow-hidden rounded-lg border"
      >
        <button
          class="bg-surface flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          @click="toggleGroup(group.id)"
        >
          <UIcon
            :name="
              expanded.has(group.id)
                ? 'i-heroicons-chevron-down'
                : 'i-heroicons-chevron-right'
            "
            class="size-3.5 flex-shrink-0 text-neutral-400"
          />
          <UIcon
            :name="group.icon"
            class="size-4 flex-shrink-0 text-neutral-400"
          />
          <span class="flex-1 text-sm font-medium">{{ group.title }}</span>
          <span class="mr-2 text-xs text-neutral-400">{{ group.source }}</span>
          <UBadge
            :label="`${pendingCount(group)} pending`"
            color="warning"
            variant="subtle"
            size="xs"
          />
        </button>
        <div
          v-if="expanded.has(group.id)"
          class="border-line-subtle border-t"
        >
          <NuxtLink
            v-for="(item, i) in group.items"
            :key="item.id"
            :to="`/${basePath}/${laneId}/review/${encodeURIComponent(item.id)}`"
            class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            :class="
              i < group.items.length - 1 ? 'border-line-subtle border-b' : ''
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
              :label="item.status"
              :color="statusColor(item.status)"
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
import type { ReviewGroup } from '~/composables/useLanes'

const props = defineProps<{
  laneId: string
  basePath: 'lane' | 'worktree'
  reviewGroups: ReviewGroup[]
}>()

const pendingCount = (g: ReviewGroup) =>
  g.items.filter((i) => i.status === 'pending').length

const totalPending = computed(
  () =>
    props.reviewGroups
      .flatMap((g) => g.items)
      .filter((i) => i.status === 'pending').length
)

const { expanded, toggle: toggleGroup } = useExpandable(
  props.reviewGroups.map((g) => g.id)
)
</script>
