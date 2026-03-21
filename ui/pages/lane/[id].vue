<template>
  <div class="flex flex-col h-full">

    <!-- Lane header -->
    <div class="flex items-center justify-between px-8 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="size-2 rounded-full flex-shrink-0" :class="lane.isActive ? 'bg-blue-500' : 'bg-neutral-400'" />
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono text-sm font-medium">{{ lane.branch }}</span>
            <UBadge v-if="lane.isActive" label="staged" color="primary" variant="subtle" size="xs" />
          </div>
          <div class="text-xs text-neutral-400 mt-0.5">{{ lane.path }}</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton v-if="!lane.isActive" label="Stage" icon="i-heroicons-arrow-up-tray" size="sm" color="primary" variant="outline" />
        <UButton v-else label="Push back" icon="i-heroicons-arrow-down-tray" size="sm" color="neutral" variant="outline" />
      </div>
    </div>

    <!-- Tab bar -->
    <div class="flex items-center gap-0 px-8 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 flex-shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors"
        :class="activeTab === tab.key
          ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-medium'
          : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'"
        @click="activeTab = tab.key"
      >
        <UIcon :name="tab.icon" class="size-4" />
        {{ tab.label }}
        <UBadge v-if="tab.badge" :label="String(tab.badge)" color="warning" variant="subtle" size="xs" />
      </button>
    </div>

    <!-- Tab content -->
    <div class="flex-1 overflow-auto">

      <!-- INBOX TAB -->
      <div v-if="activeTab === 'inbox'" class="px-8 py-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-semibold">Inbox</span>
          <span class="text-xs text-neutral-400">{{ totalPending }} pending</span>
        </div>

        <div v-if="reviewGroups.length === 0" class="rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 px-6 py-12 text-center">
          <UIcon name="i-heroicons-inbox" class="size-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p class="text-sm text-neutral-400">No pending reviews</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="group in reviewGroups" :key="group.id" class="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <button
              class="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left"
              @click="toggleGroup(group.id)"
            >
              <UIcon :name="expanded.has(group.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="size-3.5 text-neutral-400 flex-shrink-0" />
              <UIcon :name="group.icon" class="size-4 text-neutral-400 flex-shrink-0" />
              <span class="flex-1 text-sm font-medium">{{ group.title }}</span>
              <span class="text-xs text-neutral-400 mr-2">{{ group.source }}</span>
              <UBadge :label="`${pendingCount(group)} pending`" color="warning" variant="subtle" size="xs" />
            </button>
            <div v-if="expanded.has(group.id)" class="border-t border-neutral-100 dark:border-neutral-800">
              <NuxtLink
                v-for="(item, i) in group.items"
                :key="item.id"
                :to="`/lane/${lane.id}/review/${item.id}`"
                class="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                :class="i < group.items.length - 1 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''"
              >
                <div class="w-4 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm truncate">{{ item.title }}</div>
                  <div class="text-xs text-neutral-400 mt-0.5">{{ item.subtitle }}</div>
                </div>
                <UBadge :label="item.status" :color="statusColor(item.status)" variant="subtle" size="xs" />
                <UIcon name="i-heroicons-chevron-right" class="size-3.5 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- WORKFLOW TAB -->
      <div v-else-if="activeTab === 'workflow'" class="px-8 py-6">
        <div v-if="workflow">
          <div class="flex items-start justify-between mb-6">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <UBadge :label="workflow.status" :color="workflow.status === 'running' ? 'primary' : workflow.status === 'done' ? 'success' : 'neutral'" variant="subtle" size="sm" />
                <span class="font-mono text-sm font-medium">{{ workflow.file }}</span>
              </div>
              <div class="text-xs text-neutral-400">Step {{ workflow.currentStep }} of {{ workflow.totalSteps }} · {{ workflow.elapsed }} elapsed</div>
            </div>
            <div class="text-xs text-neutral-400 font-mono">started {{ workflow.startedAt }}</div>
          </div>

          <!-- Steps -->
          <div class="space-y-2">
            <div
              v-for="step in workflow.steps"
              :key="step.name"
              class="flex items-center gap-4 rounded-lg border px-4 py-3"
              :class="{
                'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30': step.state === 'running',
                'border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900': step.state === 'done' || step.state === 'waiting',
                'border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 opacity-60': step.state === 'pending',
              }"
            >
              <UIcon
                :name="step.state === 'done' ? 'i-heroicons-check-circle' : step.state === 'running' ? 'i-heroicons-arrow-path' : step.state === 'waiting' ? 'i-heroicons-pause-circle' : 'i-heroicons-ellipsis-horizontal-circle'"
                class="size-4 flex-shrink-0"
                :class="{
                  'text-green-500': step.state === 'done',
                  'text-blue-500 animate-spin': step.state === 'running',
                  'text-yellow-500': step.state === 'waiting',
                  'text-neutral-300 dark:text-neutral-600': step.state === 'pending',
                }"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium" :class="step.state === 'pending' ? 'text-neutral-400' : ''">{{ step.name }}</div>
                <div v-if="step.detail" class="text-xs text-neutral-400 mt-0.5">{{ step.detail }}</div>
              </div>
              <div v-if="step.duration" class="text-xs text-neutral-400 font-mono">{{ step.duration }}</div>
              <UButton v-if="step.state === 'waiting'" label="Unblock" size="xs" color="primary" variant="outline" />
            </div>
          </div>
        </div>
        <div v-else class="rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 px-6 py-12 text-center">
          <UIcon name="i-heroicons-arrow-path" class="size-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p class="text-sm text-neutral-400">No active workflow on this lane</p>
        </div>
      </div>

      <!-- COMMITS TAB -->
      <div v-else-if="activeTab === 'commits'" class="px-8 py-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-semibold">Commits</span>
          <span class="text-xs text-neutral-400">{{ commits.length }} commits ahead of main</span>
        </div>
        <div class="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div
            v-for="(commit, i) in commits"
            :key="commit.hash"
            class="flex items-start gap-4 px-5 py-3.5 bg-white dark:bg-neutral-900"
            :class="i < commits.length - 1 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''"
          >
            <span class="font-mono text-xs text-neutral-400 flex-shrink-0 mt-0.5 w-14">{{ commit.hash }}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm truncate">{{ commit.message }}</div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs text-neutral-400">{{ commit.author }}</span>
                <span class="text-xs text-neutral-300 dark:text-neutral-600">·</span>
                <span class="text-xs text-neutral-400">{{ commit.date }}</span>
              </div>
            </div>
            <div v-if="commit.pr" class="flex-shrink-0">
              <UBadge :label="commit.pr" color="neutral" variant="subtle" size="xs" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const laneData: Record<string, { id: string; branch: string; path: string; isActive: boolean }> = {
  root:          { id: 'root',        branch: 'feat/42-unified-ui', path: '~/debussy',                     isActive: true },
  'wt-feedback': { id: 'wt-feedback', branch: 'feat/feedback-ui',   path: '~/debussy/.worktrees/feedback',  isActive: false },
  'wt-workflow': { id: 'wt-workflow', branch: 'feat/workflow-mon',  path: '~/debussy/.worktrees/workflow',  isActive: false },
  'wt-fix':      { id: 'wt-fix',      branch: 'fix/review-server',  path: '~/debussy/.worktrees/fix',       isActive: false },
}

interface ReviewItem  { id: string; title: string; subtitle: string; status: 'pending' | 'approved' | 'rejected' }
interface ReviewGroup { id: string; title: string; icon: string; source: string; items: ReviewItem[] }

const reviewGroupsData: Record<string, ReviewGroup[]> = {
  root: [
    { id: 'rg-1', title: 'Unified UI — Implementation Plan', icon: 'i-heroicons-document-text', source: '/feedback session', items: [
      { id: 'r-1', title: 'Layout structure and sidebar navigation', subtitle: 'Approve or request changes', status: 'pending' },
      { id: 'r-2', title: 'Worktree stage/unstage interaction model', subtitle: 'Approve or request changes', status: 'pending' },
      { id: 'r-3', title: 'Inbox hierarchy and review groups', subtitle: 'Approve or request changes', status: 'approved' },
    ]},
    { id: 'rg-2', title: 'PR #42 — feat/42-unified-ui', icon: 'i-heroicons-code-bracket', source: 'code review', items: [
      { id: 'r-4', title: 'Nuxt layout structure', subtitle: 'layouts/default.vue', status: 'pending' },
      { id: 'r-5', title: 'Mock data composable', subtitle: 'composables/useMockData.ts', status: 'approved' },
    ]},
  ],
  'wt-feedback': [
    { id: 'rg-3', title: 'Feedback UI Enhancement — Spec', icon: 'i-heroicons-document-text', source: '/feedback session', items: [
      { id: 'r-6', title: 'Keyboard navigation shortcuts', subtitle: '⌘K / j·k / Enter', status: 'pending' },
      { id: 'r-7', title: 'Server startup sequence', subtitle: 'Port detection + auto-open', status: 'pending' },
    ]},
  ],
  'wt-workflow': [],
  'wt-fix': [
    { id: 'rg-4', title: 'Fix: review server startup crash', icon: 'i-heroicons-bug-ant', source: 'workflow gate', items: [
      { id: 'r-8', title: 'Root cause — port conflict on 3001', subtitle: 'Proposed fix: dynamic port allocation', status: 'pending' },
    ]},
  ],
}

interface WorkflowStep { name: string; state: 'done' | 'running' | 'waiting' | 'pending'; detail?: string; duration?: string }
interface WorkflowRun  { file: string; status: string; currentStep: number; totalSteps: number; elapsed: string; startedAt: string; steps: WorkflowStep[] }

const workflowData: Record<string, WorkflowRun | null> = {
  root: {
    file: 'feat-delivery.yml', status: 'running', currentStep: 4, totalSteps: 7, elapsed: '12m 34s', startedAt: '14:22',
    steps: [
      { name: 'Setup environment',   state: 'done',    duration: '8s' },
      { name: 'Install dependencies', state: 'done',   duration: '42s' },
      { name: 'Lint & typecheck',     state: 'done',   duration: '18s' },
      { name: 'Run tests',            state: 'running', detail: 'ui/pages/roadmap.test.ts — 14/32 passing' },
      { name: 'Build UI',             state: 'pending' },
      { name: 'Human review gate',    state: 'pending', detail: 'Will pause for approval before continuing' },
      { name: 'Commit & push',        state: 'pending' },
    ],
  },
  'wt-feedback': {
    file: 'feedback-spec.yml', status: 'done', currentStep: 5, totalSteps: 5, elapsed: '6m 02s', startedAt: '11:45',
    steps: [
      { name: 'Research keyboard nav patterns', state: 'done', duration: '1m 12s' },
      { name: 'Draft spec',                     state: 'done', duration: '2m 44s' },
      { name: 'Generate feedback session',      state: 'done', duration: '38s' },
      { name: 'Human review gate',              state: 'done', duration: '1m 28s', detail: '2 items approved, 1 pending' },
      { name: 'Write spec to disk',             state: 'done', duration: '0s' },
    ],
  },
  'wt-workflow': {
    file: 'workflow-monitoring.yml', status: 'running', currentStep: 2, totalSteps: 6, elapsed: '3m 11s', startedAt: '14:31',
    steps: [
      { name: 'Research Nitro SSE patterns', state: 'done',    duration: '1m 55s' },
      { name: 'Design progress API',         state: 'running', detail: 'Drafting server/api/workflow/progress.get.ts' },
      { name: 'Implement SSE endpoint',      state: 'pending' },
      { name: 'Wire up UI component',        state: 'pending' },
      { name: 'Human review gate',           state: 'pending', detail: 'Review progress panel design' },
      { name: 'Write implementation',        state: 'pending' },
    ],
  },
  'wt-fix': null,
}

const commitsData: Record<string, Array<{ hash: string; message: string; author: string; date: string; pr?: string }>> = {
  root: [
    { hash: 'a1b2c3d', message: 'feat(ui): add architecture + policy + feature pages', author: 'jcbianic', date: '1h ago', pr: '#42' },
    { hash: 'e4f5a6b', message: 'feat(ui): add product two-panel layout with strategy artifacts', author: 'jcbianic', date: '2h ago', pr: '#42' },
    { hash: 'c7d8e9f', message: 'feat(ui): restructure sidebar nav with lanes and overview', author: 'jcbianic', date: '3h ago', pr: '#42' },
    { hash: 'f1a2b3c', message: 'chore(ui): init Nuxt 4 app with @nuxt/ui and i18n', author: 'jcbianic', date: '5h ago', pr: '#42' },
  ],
  'wt-feedback': [
    { hash: 'b4c5d6e', message: 'feat(feedback): draft keyboard nav spec', author: 'jcbianic', date: '2h ago' },
    { hash: 'a7b8c9d', message: 'chore(feedback): branch setup', author: 'jcbianic', date: '3h ago' },
  ],
  'wt-workflow': [
    { hash: 'e1f2a3b', message: 'feat(workflow): draft SSE progress endpoint design', author: 'jcbianic', date: '45m ago' },
    { hash: 'c4d5e6f', message: 'chore(workflow): branch setup', author: 'jcbianic', date: '3h ago' },
  ],
  'wt-fix': [
    { hash: 'a7b8c9e', message: 'fix(server): dynamic port allocation to avoid conflicts', author: 'jcbianic', date: '30m ago' },
    { hash: 'f1a2b4c', message: 'debug(server): reproduce port 3001 conflict', author: 'jcbianic', date: '1h ago' },
  ],
}

const lane = computed(() => laneData[id] ?? laneData.root)
const reviewGroups = computed(() => reviewGroupsData[id] ?? [])
const workflow = computed(() => workflowData[id] ?? null)
const commits = computed(() => commitsData[id] ?? [])

const totalPending = computed(() => reviewGroups.value.flatMap(g => g.items).filter(i => i.status === 'pending').length)

const tabs = computed(() => [
  { key: 'inbox',    label: 'Inbox',    icon: 'i-heroicons-inbox',      badge: totalPending.value || 0 },
  { key: 'workflow', label: 'Workflow', icon: 'i-heroicons-arrow-path',  badge: 0 },
  { key: 'commits',  label: 'Commits',  icon: 'i-heroicons-queue-list',  badge: 0 },
])

const activeTab = ref('inbox')

const allIds = reviewGroupsData[id]?.map(g => g.id) ?? []
const expanded = ref(new Set(allIds))
const toggleGroup = (gid: string) => {
  if (expanded.value.has(gid)) expanded.value.delete(gid)
  else expanded.value.add(gid)
  expanded.value = new Set(expanded.value)
}

const pendingCount = (g: ReviewGroup) => g.items.filter(i => i.status === 'pending').length
const statusColor = (s: string) => s === 'approved' ? 'success' as const : s === 'rejected' ? 'error' as const : 'warning' as const
</script>
