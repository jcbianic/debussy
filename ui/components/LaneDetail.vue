<template>
  <div class="flex h-full flex-col">
    <!-- Lane header -->
    <div
      class="flex flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-8 py-4 dark:border-neutral-800 dark:bg-neutral-900/50"
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
      class="flex flex-shrink-0 items-center gap-0 border-b border-neutral-200 bg-white px-8 dark:border-neutral-800 dark:bg-neutral-900/30"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors"
        :class="
          activeTab === tab.key
            ? 'border-neutral-900 font-medium text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
            : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
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
      <!-- INBOX TAB -->
      <div v-if="activeTab === 'inbox'" class="px-8 py-6">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-sm font-semibold">Inbox</span>
          <span class="text-xs text-neutral-400"
            >{{ totalPending }} pending</span
          >
        </div>

        <EmptyState
          v-if="reviewGroups.length === 0"
          icon="i-heroicons-inbox"
          text="No pending reviews"
        />

        <div v-else class="space-y-3">
          <div
            v-for="group in reviewGroups"
            :key="group.id"
            class="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
          >
            <button
              class="flex w-full items-center gap-3 bg-white px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/50"
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
              <span class="mr-2 text-xs text-neutral-400">{{
                group.source
              }}</span>
              <UBadge
                :label="`${pendingCount(group)} pending`"
                color="warning"
                variant="subtle"
                size="xs"
              />
            </button>
            <div
              v-if="expanded.has(group.id)"
              class="border-t border-neutral-100 dark:border-neutral-800"
            >
              <NuxtLink
                v-for="(item, i) in group.items"
                :key="item.id"
                :to="`/${basePath}/${laneId}/review/${item.id}`"
                class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                :class="
                  i < group.items.length - 1
                    ? 'border-b border-neutral-100 dark:border-neutral-800'
                    : ''
                "
              >
                <div class="w-4 flex-shrink-0" />
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm">{{ item.title }}</div>
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
                  class="size-3.5 flex-shrink-0 text-neutral-300 dark:text-neutral-600"
                />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- WORKFLOW TAB -->
      <div v-else-if="activeTab === 'workflow'" class="px-8 py-6">
        <div v-if="workflow">
          <div class="mb-6 flex items-start justify-between">
            <div>
              <div class="mb-1 flex items-center gap-2">
                <UBadge
                  :label="workflow.status"
                  :color="
                    workflow.status === 'running'
                      ? 'primary'
                      : workflow.status === 'done'
                        ? 'success'
                        : 'neutral'
                  "
                  variant="subtle"
                  size="sm"
                />
                <span class="font-mono text-sm font-medium">{{
                  workflow.file
                }}</span>
              </div>
              <div class="text-xs text-neutral-400">
                Step {{ workflow.currentStep }} of {{ workflow.totalSteps }} ·
                {{ workflow.elapsed }} elapsed
              </div>
            </div>
            <div class="font-mono text-xs text-neutral-400">
              started {{ workflow.startedAt }}
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="step in workflow.steps"
              :key="step.name"
              class="flex items-center gap-4 rounded-lg border px-4 py-3"
              :class="{
                'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30':
                  step.state === 'running',
                'border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900':
                  step.state === 'done' || step.state === 'waiting',
                'border-neutral-100 bg-neutral-50 opacity-60 dark:border-neutral-800 dark:bg-neutral-900/50':
                  step.state === 'pending',
              }"
            >
              <UIcon
                :name="
                  step.state === 'done'
                    ? 'i-heroicons-check-circle'
                    : step.state === 'running'
                      ? 'i-heroicons-arrow-path'
                      : step.state === 'waiting'
                        ? 'i-heroicons-pause-circle'
                        : 'i-heroicons-ellipsis-horizontal-circle'
                "
                class="size-4 flex-shrink-0"
                :class="{
                  'text-green-500': step.state === 'done',
                  'animate-spin text-blue-500': step.state === 'running',
                  'text-yellow-500': step.state === 'waiting',
                  'text-neutral-300 dark:text-neutral-600':
                    step.state === 'pending',
                }"
              />
              <div class="min-w-0 flex-1">
                <div
                  class="text-sm font-medium"
                  :class="step.state === 'pending' ? 'text-neutral-400' : ''"
                >
                  {{ step.name }}
                </div>
                <div v-if="step.detail" class="mt-0.5 text-xs text-neutral-400">
                  {{ step.detail }}
                </div>
              </div>
              <div
                v-if="step.duration"
                class="font-mono text-xs text-neutral-400"
              >
                {{ step.duration }}
              </div>
              <UButton
                v-if="step.state === 'waiting'"
                label="Unblock"
                size="xs"
                color="primary"
                variant="outline"
              />
            </div>
          </div>
        </div>
        <EmptyState
          v-else
          icon="i-heroicons-arrow-path"
          text="No active workflow on this lane"
        />
      </div>

      <!-- COMMITS TAB -->
      <div v-else-if="activeTab === 'commits'" class="px-8 py-6">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-sm font-semibold">Commits</span>
          <span class="text-xs text-neutral-400"
            >{{ commits.length }} commits ahead of main</span
          >
        </div>
        <div
          class="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
        >
          <div
            v-for="(commit, i) in commits"
            :key="commit.hash"
            class="flex items-start gap-4 bg-white px-5 py-3.5 dark:bg-neutral-900"
            :class="
              i < commits.length - 1
                ? 'border-b border-neutral-100 dark:border-neutral-800'
                : ''
            "
          >
            <span
              class="mt-0.5 w-14 flex-shrink-0 font-mono text-xs text-neutral-400"
              >{{ commit.hash }}</span
            >
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm">{{ commit.message }}</div>
              <div class="mt-0.5 flex items-center gap-2">
                <span class="text-xs text-neutral-400">{{
                  commit.author
                }}</span>
                <span class="text-xs text-neutral-300 dark:text-neutral-600"
                  >·</span
                >
                <span class="text-xs text-neutral-400">{{ commit.date }}</span>
              </div>
            </div>
            <div v-if="commit.pr" class="flex-shrink-0">
              <UBadge
                :label="commit.pr"
                color="neutral"
                variant="subtle"
                size="xs"
              />
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

const { expanded, toggle: toggleGroup } = useExpandable(
  getLane(props.laneId).groups.map((g) => g.id)
)

const pendingCount = (g: ReviewGroup) =>
  g.items.filter((i) => i.status === 'pending').length
</script>
