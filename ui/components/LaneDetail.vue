<template>
  <div class="flex h-full flex-col">
    <!-- Lane header -->
    <div
      class="border-line bg-surface-tinted flex flex-shrink-0 items-center justify-between border-b px-8 py-4"
    >
      <div class="flex items-center gap-3">
        <div
          class="size-2 flex-shrink-0 rounded-full"
          :class="lane.isActive ? 'bg-blue-500' : 'bg-neutral-400'"
        />
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono text-sm font-medium">{{ lane.branch }}</span>
            <UBadge
              v-if="lane.isActive"
              label="staged"
              color="primary"
              variant="subtle"
              size="xs"
            />
          </div>
          <div class="mt-0.5 text-xs text-neutral-400">{{ lane.path }}</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="!lane.isActive"
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

    <!-- Tab bar -->
    <div
      class="border-line bg-surface-tinted flex flex-shrink-0 items-center gap-0 border-b px-8"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors"
        :class="
          activeTab === tab.key
            ? 'text-content border-line-indicator font-medium'
            : 'text-content-subtle hover:text-content-strong border-transparent'
        "
        @click="activeTab = tab.key"
      >
        <UIcon :name="tab.icon" class="size-4" />
        {{ tab.label }}
        <UBadge
          v-if="tab.badge"
          :label="String(tab.badge)"
          color="warning"
          variant="subtle"
          size="xs"
        />
      </button>
    </div>

    <!-- Tab content -->
    <div class="flex-1 overflow-auto">
      <LaneInboxTab
        v-if="activeTab === 'inbox'"
        :lane-id="laneId"
        :base-path="basePath"
        :review-groups="reviewGroups"
      />
      <LaneWorkflowTab
        v-else-if="activeTab === 'workflow'"
        :workflow="workflow"
      />
      <LaneCommitsTab v-else-if="activeTab === 'commits'" :commits="commits" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  laneId: string
  basePath: 'lane' | 'worktree'
}>()

const { getLane, getWorkflow, getCommits } = useMockData()

const lane = computed(() => getLane(props.laneId))
const reviewGroups = computed(() => lane.value.groups)
const workflow = computed(() => getWorkflow(props.laneId))
const commits = computed(() => getCommits(props.laneId))

const totalPending = computed(
  () =>
    reviewGroups.value
      .flatMap((g) => g.items)
      .filter((i) => i.status === 'pending').length
)

const tabs = computed(() => [
  {
    key: 'inbox',
    label: 'Inbox',
    icon: 'i-heroicons-inbox',
    badge: totalPending.value,
  },
  {
    key: 'workflow',
    label: 'Workflow',
    icon: 'i-heroicons-arrow-path',
    badge: 0,
  },
  {
    key: 'commits',
    label: 'Commits',
    icon: 'i-heroicons-queue-list',
    badge: 0,
  },
])

const activeTab = ref('inbox')
</script>
