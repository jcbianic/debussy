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

        <EmptyState v-if="reviewGroups.length === 0" icon="i-heroicons-inbox" text="No pending reviews" />

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
                :to="`/${basePath}/${laneId}/review/${item.id}`"
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
        <EmptyState v-else icon="i-heroicons-arrow-path" text="No active workflow on this lane" />
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
import type { ReviewGroup } from '~/composables/useMockData'

const props = defineProps<{
  laneId: string
  basePath: 'lane' | 'worktree'
}>()

const { getLane, getWorkflow, getCommits } = useMockData()

const lane = computed(() => getLane(props.laneId))
const reviewGroups = computed(() => getLane(props.laneId).groups)
const workflow = computed(() => getWorkflow(props.laneId))
const commits = computed(() => getCommits(props.laneId))

const totalPending = computed(() =>
  reviewGroups.value.flatMap(g => g.items).filter(i => i.status === 'pending').length,
)

const tabs = computed(() => [
  { key: 'inbox',    label: 'Inbox',    icon: 'i-heroicons-inbox',     badge: totalPending.value || 0 },
  { key: 'workflow', label: 'Workflow', icon: 'i-heroicons-arrow-path', badge: 0 },
  { key: 'commits',  label: 'Commits',  icon: 'i-heroicons-queue-list', badge: 0 },
])

const activeTab = ref('inbox')

const { expanded, toggle: toggleGroup } = useExpandable(
  getLane(props.laneId).groups.map(g => g.id),
)

const pendingCount = (g: ReviewGroup) => g.items.filter(i => i.status === 'pending').length
</script>
