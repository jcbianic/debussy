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
          <div class="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
            <span>{{ lane.path }}</span>
            <template v-if="status">
              <span class="text-neutral-600">&middot;</span>
              <template v-if="status.sync.remote">
                <span
                  v-if="status.sync.ahead === 0 && status.sync.behind === 0"
                  class="text-green-400"
                >in sync</span>
                <span
                  v-if="status.sync.ahead"
                  class="text-blue-400"
                >&uarr;{{ status.sync.ahead }}</span>
                <span
                  v-if="status.sync.behind"
                  class="text-orange-400"
                >&darr;{{ status.sync.behind }}</span>
              </template>
              <span
                v-else
                class="text-neutral-500"
              >no remote</span>
            </template>
          </div>
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
        <UIcon
          :name="tab.icon"
          class="size-4"
        />
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
        :reviews="reviews"
      />
      <LaneWorkflowTab
        v-else-if="activeTab === 'workflow'"
        :workflow="workflow"
      />
      <LaneCommitsTab
        v-else-if="activeTab === 'commits'"
        :commits="commits"
        :changes="status?.changes ?? null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  laneId: string
  basePath: 'lane' | 'worktree'
}>()

const { getLane, getWorkflow, getCommits, getStatus } = useLanes()

const lane = computed(() => getLane(props.laneId))
const reviews = computed(() => lane.value.reviews)

const workflow = ref<Awaited<ReturnType<typeof getWorkflow>>>(null)
const commits = ref<Commit[]>([])
const status = ref<LaneStatus | null>(null)

watch(
  () => props.laneId,
  async (id) => {
    const [c, w, s] = await Promise.all([
      getCommits(id),
      getWorkflow(id),
      getStatus(id),
    ])
    commits.value = c
    workflow.value = w
    status.value = s
  },
  { immediate: true }
)

const totalPending = computed(
  () =>
    reviews.value
      .flatMap((r) => r.items)
      .filter((i) => itemStatus(i) === 'pending').length
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
