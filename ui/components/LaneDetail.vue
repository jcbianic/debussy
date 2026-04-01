<template>
  <div
    v-if="!lane"
    class="flex h-full items-center justify-center"
  >
    <UIcon
      name="i-heroicons-arrow-path"
      class="text-content-muted size-5 animate-spin"
    />
  </div>
  <div
    v-else
    class="flex h-full flex-col"
  >
    <!-- Lane header -->
    <div
      class="border-line bg-surface-tinted flex flex-shrink-0 items-center justify-between border-b px-8 py-4"
    >
      <div class="flex items-center gap-3">
        <div
          class="size-2 flex-shrink-0 rounded-full"
          :class="
            lane.isActive
              ? 'bg-blue-500'
              : lane.checkedOutIn
                ? 'bg-blue-400'
                : 'bg-neutral-400'
          "
        />
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono text-sm font-medium">{{ lane.branch }}</span>
            <UBadge
              v-if="lane.state"
              :label="lane.state"
              :color="stateColor(lane.state)"
              variant="subtle"
              size="xs"
            />
            <UBadge
              v-if="lane.checkedOutIn === 'root'"
              :label="lane.isActive ? 'root · active' : 'root'"
              color="primary"
              variant="subtle"
              size="xs"
            />
            <UBadge
              v-else-if="lane.checkedOutIn === 'worktree'"
              :label="lane.isActive ? 'worktree · active' : 'worktree'"
              color="info"
              variant="subtle"
              size="xs"
            />
            <UBadge
              v-else-if="!lane.state"
              label="not checked out"
              color="neutral"
              variant="subtle"
              size="xs"
            />
          </div>
          <div
            class="text-content-muted mt-0.5 flex items-center gap-2 text-xs"
          >
            <span v-if="lane.checkedOutIn">{{ lane.path }}</span>
            <span
              v-else
              class="italic"
            >no working directory</span>
            <template v-if="status">
              <span class="text-content-subtle">&middot;</span>
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
                class="text-content-muted"
              >no remote</span>
            </template>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <template v-if="lane.orphaned">
          <UBadge
            label="orphaned"
            color="error"
            variant="subtle"
            size="xs"
          />
          <UButton
            label="Restore worktree"
            icon="i-heroicons-arrow-path"
            size="sm"
            color="primary"
            variant="outline"
            :loading="gitActioning"
            @click="doGitAction('restore')"
          />
          <UButton
            label="Delete"
            icon="i-heroicons-trash"
            size="sm"
            color="error"
            variant="outline"
            :loading="deleting"
            @click="doDelete"
          />
        </template>
        <template v-else>
          <UButton
            v-for="action in availableGitActions"
            :key="action"
            :label="gitActionLabelMap[action]"
            :icon="gitActionIconMap[action]"
            size="sm"
            color="neutral"
            variant="soft"
            :loading="gitActioning"
            @click="doGitAction(action)"
          />
          <div
            v-if="availableGitActions.length && availableActions.length"
            class="bg-line mx-1 h-5 w-px"
          />
          <UButton
            v-for="action in availableActions"
            :key="action"
            :label="actionLabel(action)"
            :icon="actionIcon(action)"
            size="sm"
            :color="actionColor(action)"
            variant="outline"
            :loading="transitioning"
            @click="doTransition(action)"
          />
          <template v-if="canStartWork">
            <div
              v-if="availableGitActions.length || availableActions.length"
              class="bg-line mx-1 h-5 w-px"
            />
            <UButton
              label="Start Work"
              icon="i-heroicons-rocket-launch"
              size="sm"
              color="primary"
              variant="solid"
              :loading="startingWork"
              @click="doStartWork"
            />
          </template>
        </template>
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
      <LaneScopeTab
        v-if="activeTab === 'scope'"
        :lane-id="laneId"
      />
      <LaneInboxTab
        v-else-if="activeTab === 'inbox'"
        :key="laneId"
        :lane-id="laneId"
      />
      <LaneWorkflowTab
        v-else-if="activeTab === 'workflow'"
        :lane-id="laneId"
      />
      <LaneSessionsTab
        v-else-if="activeTab === 'sessions'"
        :lane-id="laneId"
        :auto-open-session-id="lastStartedSessionId"
        @session-done="onCommitted"
        @session-opened="lastStartedSessionId = null"
      />
      <LaneCommitsTab
        v-else-if="activeTab === 'commits'"
        :lane-id="laneId"
        :commits="commits"
        :changes="status?.changes ?? null"
        @committed="onCommitted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { LANE_TRANSITIONS } from '~/shared/types/lanes'
import type { LaneState, LaneAction, GitAction } from '~/shared/types/lanes'

const props = defineProps<{
  laneId: string
  basePath: 'lane' | 'worktree'
}>()

const router = useRouter()
const toast = useToast()

const {
  getLane,
  laneUrl,
  getCommits,
  getStatus,
  transitionLane,
  gitAction,
  deleteLane,
  requestWork,
} = useLanes()

const lane = computed(() => getLane(props.laneId))
const reviews = computed(() => lane.value?.reviews ?? [])

const transitioning = ref(false)

const canStartWork = computed(() => {
  const l = lane.value
  if (!l || !l.state) return false
  return l.state === 'created' || l.state === 'working'
})

const availableActions = computed(() => {
  const state = lane.value?.state
  if (!state) return []
  const actions = LANE_TRANSITIONS[state] ?? []
  // Hide standalone "start" when "Start Work" button is shown
  if (canStartWork.value) return actions.filter((a) => a !== 'start')
  return actions
})

type UColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral'

const stateColorMap: Record<LaneState, UColor> = {
  created: 'neutral',
  working: 'primary',
  staged: 'warning',
  qa: 'warning',
  ready: 'success',
  merged: 'neutral',
}

const actionLabelMap: Record<LaneAction, string> = {
  start: 'Start',
  stage: 'Stage',
  qa: 'Send to QA',
  rework: 'Rework',
  ready: 'Mark ready',
  merge: 'Merge',
}

const actionIconMap: Record<LaneAction, string> = {
  start: 'i-heroicons-play',
  stage: 'i-heroicons-arrow-up-tray',
  qa: 'i-heroicons-clipboard-document-check',
  rework: 'i-heroicons-arrow-path',
  ready: 'i-heroicons-check-circle',
  merge: 'i-heroicons-code-bracket-square',
}

function stateColor(state: LaneState): UColor {
  return stateColorMap[state]
}

function actionLabel(action: LaneAction): string {
  return actionLabelMap[action]
}

function actionIcon(action: LaneAction): string {
  return actionIconMap[action]
}

function actionColor(action: LaneAction): UColor {
  if (action === 'merge' || action === 'ready') return 'success'
  if (action === 'rework') return 'warning'
  return 'primary'
}

async function doTransition(action: LaneAction) {
  transitioning.value = true
  try {
    await transitionLane(props.laneId, action)
    // Stage moves the branch to root — stay on same lane (branch name is the ID)
    if (action === 'stage') {
      await router.push(laneUrl(props.laneId))
    }
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'statusMessage' in err
        ? String((err as { statusMessage: string }).statusMessage)
        : 'Action failed'
    toast.add({ title: msg, color: 'error' })
  } finally {
    transitioning.value = false
  }
}

// ─── Git actions ──────────────────────────────────────────────────────────────

const gitActioning = ref(false)

const gitActionLabelMap: Record<GitAction, string> = {
  push: 'Push',
  pull: 'Pull',
  'to-worktree': 'To worktree',
  restore: 'Restore worktree',
}

const gitActionIconMap: Record<GitAction, string> = {
  push: 'i-heroicons-arrow-up-tray',
  pull: 'i-heroicons-arrow-down-tray',
  'to-worktree': 'i-heroicons-arrow-top-right-on-square',
  restore: 'i-heroicons-arrow-path',
}

const availableGitActions = computed(() => {
  const actions: GitAction[] = []
  const s = status.value
  if (s) {
    if (s.sync.ahead > 0 || !s.sync.remote) {
      actions.push('push')
    }
    if (s.sync.behind > 0) {
      actions.push('pull')
    }
  }
  const l = lane.value
  if (
    l &&
    l.checkedOutIn === 'root' &&
    l.branch !== 'main' &&
    l.branch !== 'master'
  ) {
    actions.push('to-worktree')
  }
  return actions
})

async function doGitAction(action: GitAction) {
  gitActioning.value = true
  try {
    const result = await gitAction(props.laneId, action)
    // Refresh status after git operation
    status.value = (await getStatus(props.laneId)) ?? null
    // Navigate to new lane after to-worktree
    if (
      action === 'to-worktree' &&
      result &&
      typeof result === 'object' &&
      'id' in result
    ) {
      // After to-worktree, the result contains the new lane record.
      // The lane ID is the branch name — navigate using the current lane's branch.
      await router.push(laneUrl(props.laneId))
    }
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'statusMessage' in err
        ? String((err as { statusMessage: string }).statusMessage)
        : 'Action failed'
    toast.add({ title: msg, color: 'error' })
  } finally {
    gitActioning.value = false
  }
}

// ─── Delete (orphaned lanes) ─────────────────────────────────────────────────

const deleting = ref(false)

async function doDelete() {
  deleting.value = true
  try {
    await deleteLane(props.laneId)
    await router.push('/')
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'statusMessage' in err
        ? String((err as { statusMessage: string }).statusMessage)
        : 'Delete failed'
    toast.add({ title: msg, color: 'error' })
  } finally {
    deleting.value = false
  }
}

// ─── Start work ─────────────────────────────────────────────────────────────

const startingWork = ref(false)
const WORKFLOW = '.claude/workflows/rpikit-complete.yml'

async function doStartWork() {
  startingWork.value = true
  try {
    // Auto-transition created → working
    if (lane.value?.state === 'created') {
      await transitionLane(props.laneId, 'start')
    }
    const result = await requestWork(props.laneId, WORKFLOW)
    toast.add({
      title: 'Workflow dispatched',
      color: 'success',
    })
    activeTab.value = 'sessions'
    // Auto-open the session slideover if sessionId is returned
    if (result?.sessionId) {
      lastStartedSessionId.value = result.sessionId
    }
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'statusMessage' in err
        ? String((err as { statusMessage: string }).statusMessage)
        : 'Failed to start work'
    toast.add({ title: msg, color: 'error' })
  } finally {
    startingWork.value = false
  }
}

const lastStartedSessionId = ref<string | null>(null)

async function onCommitted() {
  const [c, s] = await Promise.all([
    getCommits(props.laneId),
    getStatus(props.laneId),
  ])
  commits.value = c
  status.value = s ?? null
}

const commits = ref<Commit[]>([])
const status = ref<LaneStatus | null>(null)

watch(
  () => props.laneId,
  async (id) => {
    const [c, s] = await Promise.all([getCommits(id), getStatus(id)])
    commits.value = c
    status.value = s ?? null
  },
  { immediate: true }
)

const totalPending = computed(
  () =>
    reviews.value
      .flatMap((r) => r.items)
      .filter((i) => itemStatus(i) === 'pending').length
)

const isFeatureLane = computed(() => {
  const l = lane.value
  if (!l) return false
  // A lane with a record (state exists) is a feature lane,
  // even when checked out at root (staged)
  return l.branch !== 'main' && l.branch !== 'master'
})

const tabs = computed(() => [
  ...(isFeatureLane.value
    ? [
        {
          key: 'scope',
          label: 'Scope',
          icon: 'i-heroicons-document-text',
          badge: 0,
        },
      ]
    : []),
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
    key: 'sessions',
    label: 'Sessions',
    icon: 'i-heroicons-bolt',
    badge: 0,
  },
  {
    key: 'commits',
    label: 'Commits',
    icon: 'i-heroicons-queue-list',
    badge: 0,
  },
])

const route = useRoute()
const validTabs = ['scope', 'inbox', 'workflow', 'sessions', 'commits'] as const
const tabMemory = useState<Record<string, string>>(
  'lane-tab-memory',
  () => ({})
)

const defaultTab = computed(() => (isFeatureLane.value ? 'scope' : 'inbox'))

const activeTab = computed({
  get: () => {
    const tab = route.query.tab as string
    if (validTabs.includes(tab as (typeof validTabs)[number])) return tab
    return tabMemory.value[props.laneId] ?? defaultTab.value
  },
  set: (value: string) => {
    tabMemory.value[props.laneId] = value
    router.replace({ query: { ...route.query, tab: value } })
  },
})

watch(
  activeTab,
  (tab) => {
    tabMemory.value[props.laneId] = tab
  },
  { immediate: true }
)
</script>
