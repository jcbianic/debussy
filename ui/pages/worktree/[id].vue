<template>
  <div class="flex flex-col h-full">

    <!-- Worktree header -->
    <div class="flex items-center justify-between px-8 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
      <div class="flex items-center gap-3">
        <div
          class="size-2 rounded-full flex-shrink-0"
          :class="worktree.isStaged ? 'bg-blue-500' : 'bg-neutral-400'"
        />
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono text-sm font-medium">{{ worktree.branch }}</span>
            <UBadge v-if="worktree.isStaged" label="staged" color="primary" variant="subtle" size="xs" />
          </div>
          <div class="text-xs text-neutral-400 mt-0.5">{{ worktree.path }}</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="!worktree.isStaged"
          label="Stage"
          icon="i-heroicons-arrow-up-tray"
          size="sm"
          color="primary"
          variant="outline"
        />
        <UButton
          v-else
          label="Push back"
          icon="i-heroicons-arrow-down-tray"
          size="sm"
          color="neutral"
          variant="outline"
        />
      </div>
    </div>

    <!-- Inbox -->
    <div class="flex-1 overflow-auto px-8 py-6">
      <div class="max-w-3xl">

        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold">Inbox</h2>
          <span class="text-xs text-neutral-400">{{ totalPending }} pending</span>
        </div>

        <!-- Empty state -->
        <div
          v-if="reviewGroups.length === 0"
          class="rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 px-6 py-12 text-center"
        >
          <UIcon name="i-heroicons-inbox" class="size-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p class="text-sm text-neutral-400">No pending reviews</p>
        </div>

        <!-- Review groups -->
        <div v-else class="space-y-3">
          <div
            v-for="group in reviewGroups"
            :key="group.id"
            class="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
          >
            <!-- Group header -->
            <button
              class="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left"
              @click="toggleGroup(group.id)"
            >
              <UIcon
                :name="expanded.has(group.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                class="size-3.5 text-neutral-400 flex-shrink-0"
              />
              <UIcon :name="group.icon" class="size-4 text-neutral-400 flex-shrink-0" />
              <span class="flex-1 text-sm font-medium">{{ group.title }}</span>
              <span class="text-xs text-neutral-400 mr-2">{{ group.source }}</span>
              <UBadge
                :label="`${pendingCount(group)} pending`"
                color="warning"
                variant="subtle"
                size="xs"
              />
            </button>

            <!-- Group items -->
            <div v-if="expanded.has(group.id)" class="border-t border-neutral-100 dark:border-neutral-800">
              <NuxtLink
                v-for="(item, i) in group.items"
                :key="item.id"
                :to="`/worktree/${worktree.id}/review/${item.id}`"
                class="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                :class="i < group.items.length - 1 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''"
              >
                <div class="w-4 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm truncate">{{ item.title }}</div>
                  <div class="text-xs text-neutral-400 mt-0.5">{{ item.subtitle }}</div>
                </div>
                <UBadge
                  :label="item.status"
                  :color="statusColor(item.status)"
                  variant="subtle"
                  size="xs"
                />
                <UIcon name="i-heroicons-chevron-right" class="size-3.5 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
              </NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { ReviewGroup } from '~/composables/useMockData'

const route = useRoute()
const id = route.params.id as string

const { getLane } = useMockData()

const worktree = computed(() => {
  const lane = getLane(id)
  return { ...lane, isStaged: lane.isActive }
})
const reviewGroups = computed(() => getLane(id).groups)

const totalPending = computed(() =>
  reviewGroups.value.flatMap(g => g.items).filter(i => i.status === 'pending').length,
)

const pendingCount = (group: ReviewGroup) =>
  group.items.filter(i => i.status === 'pending').length

const expanded = ref(new Set(reviewGroups.value.map(g => g.id)))

const toggleGroup = (groupId: string) => {
  if (expanded.value.has(groupId)) {
    expanded.value.delete(groupId)
  } else {
    expanded.value.add(groupId)
  }
  expanded.value = new Set(expanded.value)
}

const statusColor = (s: string) => {
  if (s === 'approved') return 'success' as const
  if (s === 'rejected') return 'error' as const
  return 'warning' as const
}
</script>
