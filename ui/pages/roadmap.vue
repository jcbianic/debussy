<template>
  <div class="flex h-full">
    <!-- Main roadmap -->
    <div class="flex-1 overflow-auto px-8 py-8">
      <!-- Page header -->
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h1 class="text-xl font-semibold">Roadmap of debussy</h1>
          <p
            class="mt-1 font-mono text-sm text-neutral-500 dark:text-neutral-400"
          >
            ~/Projets/Libon-Data/debussy
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-3 text-xs text-neutral-400">
            <span class="flex items-center gap-1"
              ><UIcon
                name="i-heroicons-check-circle"
                class="size-3.5 text-green-500"
              />
              Merged</span
            >
            <span class="flex items-center gap-1"
              ><UIcon
                name="i-heroicons-arrow-path"
                class="size-3.5 text-blue-500"
              />
              In lane</span
            >
            <span class="flex items-center gap-1"
              ><UIcon
                name="i-heroicons-ellipsis-horizontal-circle"
                class="size-3.5 text-neutral-400"
              />
              Open</span
            >
            <span class="flex items-center gap-1"
              ><UIcon
                name="i-heroicons-minus-circle"
                class="size-3.5 text-neutral-300 dark:text-neutral-600"
              />
              Out of scope</span
            >
          </div>
          <UButton
            :label="syncing ? 'Syncing…' : 'Sync with GitHub'"
            icon="i-heroicons-arrow-path"
            :loading="syncing"
            size="sm"
            color="neutral"
            variant="outline"
            @click="triggerSync"
          />
        </div>
      </div>

      <!-- Summary bar -->
      <div
        class="mb-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-700"
      >
        <!-- Past -->
        <button
          class="flex items-center gap-4 bg-white px-5 py-4 text-left transition-colors hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/70"
          :class="
            activeFilter === 'shipped'
              ? 'ring-1 ring-neutral-300 ring-inset dark:ring-neutral-600'
              : ''
          "
          @click="activeFilter = activeFilter === 'shipped' ? 'all' : 'shipped'"
        >
          <div
            class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
          >
            <UIcon
              name="i-heroicons-check"
              class="size-4 text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <div class="text-lg font-semibold tabular-nums">
              {{ shippedReleases.length }}
            </div>
            <div class="text-xs text-neutral-400">
              release{{ shippedReleases.length === 1 ? '' : 's' }} shipped
            </div>
            <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {{ shippedReleases.map((r) => r.name).join(', ') }}
            </div>
          </div>
        </button>

        <!-- Current -->
        <div class="bg-white px-5 py-4 dark:bg-neutral-900">
          <div v-if="currentRelease">
            <div class="mb-2 flex items-center gap-2">
              <span class="text-sm font-semibold">{{
                currentRelease.name
              }}</span>
              <UBadge
                label="in progress"
                color="primary"
                variant="subtle"
                size="xs"
              />
            </div>
            <div class="mb-3 text-xs text-neutral-400">
              {{ currentRelease.theme }} · {{ doneCount(currentRelease) }}/{{
                meaningfulCount(currentRelease)
              }}
              done
            </div>
            <!-- Progress segments -->
            <div class="flex gap-0.5">
              <div
                v-for="intent in currentRelease.intents.filter(
                  (i) => i.state !== 'out-of-scope'
                )"
                :key="intent.id"
                class="h-1.5 flex-1 rounded-full transition-colors"
                :class="{
                  'bg-green-500': intent.state === 'done',
                  'bg-blue-500': intent.state === 'in-progress',
                  'bg-neutral-200 dark:bg-neutral-700': intent.state === 'open',
                }"
                :title="intent.title"
              />
            </div>
          </div>
          <div v-else class="text-sm text-neutral-400">No active release</div>
        </div>

        <!-- Ahead -->
        <button
          class="flex items-center justify-end gap-4 bg-white px-5 py-4 text-right transition-colors hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/70"
          :class="
            activeFilter === 'planned'
              ? 'ring-1 ring-neutral-300 ring-inset dark:ring-neutral-600'
              : ''
          "
          @click="activeFilter = activeFilter === 'planned' ? 'all' : 'planned'"
        >
          <div>
            <div class="text-lg font-semibold tabular-nums">
              {{ plannedReleases.length }}
            </div>
            <div class="text-xs text-neutral-400">
              release{{ plannedReleases.length === 1 ? '' : 's' }} planned
            </div>
            <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {{ plannedReleases.map((r) => r.name).join(', ') }}
            </div>
          </div>
          <div
            class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
          >
            <UIcon
              name="i-heroicons-arrow-right"
              class="size-4 text-neutral-400"
            />
          </div>
        </button>
      </div>

      <!-- Filter tabs -->
      <SegmentedControl
        v-model="activeFilter"
        :options="filterTabs"
        class="mb-6"
      />

      <!-- Releases -->
      <div class="space-y-6">
        <div v-for="release in visibleReleases" :key="release.id">
          <!-- Release header -->
          <div
            class="group flex cursor-pointer items-center gap-3"
            @click="toggleCollapse(release.id)"
          >
            <UIcon
              :name="
                collapsed.has(release.id)
                  ? 'i-heroicons-chevron-right'
                  : 'i-heroicons-chevron-down'
              "
              class="size-3.5 flex-shrink-0 text-neutral-400 transition-transform"
            />
            <span class="text-sm font-semibold">{{ release.name }}</span>
            <span class="text-sm text-neutral-400">—</span>
            <span class="text-sm text-neutral-500">{{ release.theme }}</span>
            <div class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            <span class="text-xs text-neutral-400"
              >{{ meaningfulCount(release) }} intents</span
            >
            <UBadge
              :label="releaseStatus(release)"
              :color="releaseStatusColor(release)"
              variant="subtle"
              size="xs"
            />
          </div>

          <!-- Intents (collapsible) -->
          <div
            v-if="!collapsed.has(release.id)"
            class="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
          >
            <div
              v-for="(intent, i) in release.intents"
              :key="intent.id"
              class="group/row flex cursor-pointer items-center gap-4 bg-white px-5 py-3.5 transition-colors hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/50"
              :class="[
                i < release.intents.length - 1
                  ? 'border-b border-neutral-100 dark:border-neutral-800'
                  : '',
                intent.state === 'out-of-scope' ? 'opacity-40' : '',
                selectedIntent?.id === intent.id &&
                selectedIntent?.title === intent.title
                  ? 'bg-neutral-50 dark:bg-neutral-800/50'
                  : '',
              ]"
              @click="
                selectedIntent =
                  selectedIntent?.id === intent.id &&
                  selectedIntent?.title === intent.title
                    ? null
                    : intent
              "
            >
              <UIcon
                :name="stateIcon(intent.state)"
                class="size-4 flex-shrink-0"
                :class="stateIconColor(intent.state)"
              />
              <span
                class="w-8 flex-shrink-0 font-mono text-xs text-neutral-400"
                >{{ intent.id }}</span
              >
              <div class="min-w-0 flex-1">
                <div
                  class="text-sm"
                  :class="
                    intent.state === 'done'
                      ? 'text-neutral-400 line-through'
                      : 'text-neutral-800 dark:text-neutral-200'
                  "
                >
                  {{ intent.title }}
                </div>
                <div class="mt-0.5 text-xs text-neutral-400">
                  {{ intent.addresses }}
                </div>
              </div>

              <NuxtLink
                v-if="intent.lane"
                :to="`/lane/${intent.laneId}`"
                class="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 font-mono text-xs text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50"
                @click.stop
              >
                <div class="size-1.5 rounded-full bg-blue-500" />
                {{ intent.lane }}
              </NuxtLink>

              <a
                v-if="intent.issue"
                :href="`https://github.com/jcbianic/debussy/issues/${intent.issue}`"
                class="font-mono text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
                @click.stop
                >#{{ intent.issue }}</a
              >

              <!-- Move to release (hover) -->
              <div
                class="opacity-0 transition-opacity group-hover/row:opacity-100"
              >
                <select
                  class="cursor-pointer rounded border border-neutral-200 bg-transparent px-1.5 py-0.5 text-xs text-neutral-400 transition-colors hover:border-neutral-400 dark:border-neutral-700"
                  :value="release.id"
                  @change.stop="
                    moveIntent(
                      intent,
                      release,
                      ($event.target as HTMLSelectElement).value
                    )
                  "
                  @click.stop
                >
                  <option v-for="r in releases" :key="r.id" :value="r.id">
                    {{ r.name }}
                  </option>
                </select>
              </div>

              <UBadge
                v-if="!intent.lane && intent.state !== 'in-progress'"
                :label="
                  intent.state === 'out-of-scope'
                    ? 'out of scope'
                    : intent.state
                "
                :color="intent.state === 'done' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail side panel -->
    <Transition name="slide">
      <div
        v-if="selectedIntent"
        class="flex w-96 flex-shrink-0 flex-col overflow-auto border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="flex flex-shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
        >
          <div class="flex items-center gap-2">
            <UIcon
              :name="stateIcon(selectedIntent.state)"
              class="size-4"
              :class="stateIconColor(selectedIntent.state)"
            />
            <span class="font-mono text-xs text-neutral-400">{{
              selectedIntent.id
            }}</span>
          </div>
          <button
            class="text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
            @click="selectedIntent = null"
          >
            <UIcon name="i-heroicons-x-mark" class="size-4" />
          </button>
        </div>

        <div class="flex-1 space-y-6 overflow-auto px-6 py-6">
          <div>
            <h2 class="mb-1 text-base leading-snug font-semibold">
              {{ selectedIntent.title }}
            </h2>
            <p class="text-xs text-neutral-400">
              {{ selectedIntent.addresses }}
            </p>
          </div>

          <div
            v-if="selectedIntent.description"
            class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
          >
            {{ selectedIntent.description }}
          </div>

          <div v-if="selectedIntent.doneWhen">
            <div
              class="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase"
            >
              Done when
            </div>
            <p
              class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              {{ selectedIntent.doneWhen }}
            </p>
          </div>

          <div class="space-y-2.5">
            <div
              v-if="selectedIntent.priority"
              class="flex items-center justify-between"
            >
              <span class="text-xs text-neutral-400">Priority</span>
              <UBadge
                :label="selectedIntent.priority"
                :color="
                  selectedIntent.priority === 'now' ||
                  selectedIntent.priority === 'next'
                    ? 'primary'
                    : 'neutral'
                "
                variant="subtle"
                size="xs"
              />
            </div>
            <div
              v-if="selectedIntent.lane"
              class="flex items-center justify-between"
            >
              <span class="text-xs text-neutral-400">Lane</span>
              <NuxtLink
                :to="`/lane/${selectedIntent.laneId}`"
                class="font-mono text-xs text-blue-500 hover:underline"
                >{{ selectedIntent.lane }}</NuxtLink
              >
            </div>
            <div
              v-if="selectedIntent.issue"
              class="flex items-center justify-between"
            >
              <span class="text-xs text-neutral-400">GitHub Issue</span>
              <a
                :href="`https://github.com/jcbianic/debussy/issues/${selectedIntent.issue}`"
                class="font-mono text-xs text-blue-500 hover:underline"
                >#{{ selectedIntent.issue }}</a
              >
            </div>
          </div>

          <div class="space-y-2 pt-2">
            <UButton
              label="Open in GitHub"
              icon="i-heroicons-arrow-top-right-on-square"
              size="sm"
              color="neutral"
              variant="outline"
              block
            />
            <UButton
              label="Move to lane"
              icon="i-heroicons-arrow-right"
              size="sm"
              color="primary"
              variant="outline"
              block
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Intent {
  id: string
  title: string
  addresses: string
  state: 'done' | 'in-progress' | 'open' | 'out-of-scope'
  lane?: string
  laneId?: string
  issue?: number
  priority?: string
  description?: string
  doneWhen?: string
}
interface Release {
  id: string
  name: string
  theme: string
  intents: Intent[]
}

const releases = reactive<Release[]>([
  {
    id: 'r0',
    name: 'Release 0.x',
    theme: 'Early exploration',
    intents: [
      {
        id: '—',
        title: 'Plugin scaffold and distribution model',
        addresses: 'Foundation',
        state: 'done',
        issue: 29,
        description:
          'Strip repo to plugin-only core, define distribution model via .claude-plugin/',
        doneWhen:
          'Plugin installs cleanly via npx claude code --install-plugin.',
      },
      {
        id: '—',
        title: 'Strategy skill — research + artifact generation',
        addresses: 'P1: Review Friction',
        state: 'done',
        issue: 30,
        description:
          'First end-to-end skill: research the landscape and audiences, generate vision/landscape/product artifacts, serve a browser review UI.',
        doneWhen:
          'Running /strategy produces all three artifacts without manual prompting.',
      },
      {
        id: '—',
        title: 'Roadmap skill — intents + GitHub Issue sync',
        addresses: 'P1: Review Friction',
        state: 'done',
        issue: 32,
        doneWhen:
          'Running /roadmap produces intents.md and syncs each intent to a GitHub Issue.',
      },
      {
        id: '—',
        title: 'GitHub Pages project site',
        addresses: 'Distribution',
        state: 'done',
        issue: 33,
        doneWhen: 'docs/ site live at jcbianic.github.io/debussy.',
      },
    ],
  },
  {
    id: 'r1',
    name: 'Release 1.0',
    theme: 'Foundation',
    intents: [
      {
        id: '001',
        title: 'Roadmap Skill Iteration',
        addresses: 'P1: Documentation Artifact Review Friction',
        state: 'done',
        issue: 34,
        priority: 'now',
        description:
          'Dogfood the roadmap skill on debussy, fix known bugs, validate the full loop works without manual workarounds.',
        doneWhen:
          'The skill runs end-to-end on debussy with no manual workarounds.',
      },
      {
        id: '002',
        title: 'Feedback UI Enhancement',
        addresses: 'P1: Documentation Artifact Review Friction',
        state: 'in-progress',
        issue: 38,
        priority: 'next',
        lane: 'feat/feedback-ui',
        laneId: 'wt-feedback',
        description:
          'Faster startup, keyboard navigation, no manual port management. Reduce a 20-item review to under 2 minutes.',
        doneWhen:
          'A 20-item review session takes under 2 minutes. Keyboard shortcuts handle approve/reject/discuss.',
      },
      {
        id: '003',
        title: 'Workflow Progress Monitoring',
        addresses: 'P2: Workflow Observability',
        state: 'open',
        issue: 40,
        priority: 'next',
        description:
          "Add live progress visibility: current step, elapsed time, what it's waiting on — without tailing a log file.",
        doneWhen:
          'During any workflow run, a status display shows current step and completed steps. Works for runs over 10 minutes.',
      },
      {
        id: '004',
        title: 'Unified UI',
        addresses: 'P1–P3: All friction points',
        state: 'in-progress',
        issue: 42,
        priority: 'next',
        lane: 'feat/42-unified-ui',
        laneId: 'root',
        description:
          'Replace per-skill browser UIs with a single Nuxt 4 app. Consolidates feedback review, workflow monitoring, roadmap, and product views.',
        doneWhen:
          'All existing skill UIs are replaced by routes in the unified app. Per-skill HTML files removed.',
      },
    ],
  },
  {
    id: 'r2',
    name: 'Release 2.0',
    theme: 'Parallel Work',
    intents: [
      {
        id: '005',
        title: 'Parallel Lanes',
        addresses: 'P3: Worktree Staging and Session Tracking',
        state: 'open',
        issue: 43,
        priority: 'later',
        description:
          'Worktree-aware task management: launch independent work in isolated git worktrees, switch between them, merge cleanly.',
        doneWhen:
          'Two independent tasks run in separate worktrees. Switching requires one command. No git conflicts at merge.',
      },
      {
        id: '006',
        title: 'Structured Project Documentation',
        addresses: 'P4: Structured Project Documentation',
        state: 'open',
        priority: 'later',
        description:
          'Standardized documentation structure covering features, architecture decisions, and testing strategy.',
        doneWhen:
          'After context compaction, Claude resumes correctly from the docs alone — no re-briefing required.',
      },
      {
        id: '007',
        title: 'Claude Setup Observability',
        addresses: 'P5: Claude Setup Observability',
        state: 'open',
        priority: 'later',
        description:
          'Single command listing all loaded plugins, skills, agents, hooks, and their active status. Detects conflicts.',
        doneWhen:
          'Running the command lists all active Claude Code extensions with context footprint. Conflicts detected and reported.',
      },
      {
        id: '008',
        title: 'Plugin compatibility management',
        addresses: 'Gap: Plugin conflicts',
        state: 'open',
        priority: 'later',
        description:
          'Detect and report conflicts between installed plugins. Suggest resolutions for common incompatibilities.',
      },
    ],
  },
  {
    id: 'backlog',
    name: 'Backlog',
    theme: 'Not yet scoped',
    intents: [
      {
        id: '—',
        title: 'Persistent preference learning from feedback loops',
        addresses: 'Gap: Human-to-agent feedback',
        state: 'out-of-scope',
      },
      {
        id: '—',
        title: 'Cost predictability and budget controls',
        addresses: 'Gap: Cost opacity',
        state: 'out-of-scope',
      },
      {
        id: '—',
        title: 'Plugin update mechanism',
        addresses: 'Gap: Plugin updates',
        state: 'out-of-scope',
      },
      {
        id: '—',
        title: 'Workflow audit trails',
        addresses: 'Gap: Observability',
        state: 'out-of-scope',
      },
      {
        id: '—',
        title: 'Collaborative multi-user workflows',
        addresses: 'Gap: Collaboration',
        state: 'out-of-scope',
      },
    ],
  },
])

// Collapse state — past and backlog collapsed by default
const collapsed = ref(new Set(['r0', 'backlog']))
const toggleCollapse = (id: string) => {
  if (collapsed.value.has(id)) collapsed.value.delete(id)
  else collapsed.value.add(id)
  collapsed.value = new Set(collapsed.value)
}

const releaseStatus = (r: Release) => {
  const active = r.intents.filter((i) => i.state !== 'out-of-scope')
  if (active.every((i) => i.state === 'done')) return 'shipped'
  if (active.some((i) => i.state === 'in-progress')) return 'in progress'
  if (r.id === 'backlog') return 'backlog'
  return 'planned'
}
const releaseStatusColor = (r: Release) => {
  const s = releaseStatus(r)
  if (s === 'shipped') return 'success' as const
  if (s === 'in progress') return 'primary' as const
  return 'neutral' as const
}

const doneCount = (r: Release) =>
  r.intents.filter((i) => i.state === 'done').length
const meaningfulCount = (r: Release) =>
  r.intents.filter((i) => i.state !== 'out-of-scope').length

const shippedReleases = computed(() =>
  releases.filter((r) => releaseStatus(r) === 'shipped')
)
const currentRelease = computed(
  () => releases.find((r) => releaseStatus(r) === 'in progress') ?? null
)
const plannedReleases = computed(() =>
  releases.filter((r) => releaseStatus(r) === 'planned')
)

// Filter
const activeFilter = ref('all')
const filterTabs = computed(() => [
  { value: 'all', label: 'All', count: releases.length },
  { value: 'shipped', label: 'Shipped', count: shippedReleases.value.length },
  { value: 'current', label: 'Current', count: currentRelease.value ? 1 : 0 },
  { value: 'planned', label: 'Planned', count: plannedReleases.value.length },
])

const visibleReleases = computed(() => {
  if (activeFilter.value === 'all') return releases
  if (activeFilter.value === 'shipped') return shippedReleases.value
  if (activeFilter.value === 'current')
    return currentRelease.value ? [currentRelease.value] : []
  if (activeFilter.value === 'planned') return plannedReleases.value
  return releases
})

const selectedIntent = ref<Intent | null>(null)
const syncing = ref(false)
const triggerSync = async () => {
  syncing.value = true
  await new Promise((r) => setTimeout(r, 1800))
  syncing.value = false
}

const moveIntent = (
  intent: Intent,
  sourceRelease: Release,
  targetId: string
) => {
  const target = releases.find((r) => r.id === targetId)
  if (!target || target === sourceRelease) return
  sourceRelease.intents.splice(sourceRelease.intents.indexOf(intent), 1)
  target.intents.push(intent)
}

const stateIcon = (s: string) => {
  if (s === 'done') return 'i-heroicons-check-circle'
  if (s === 'in-progress') return 'i-heroicons-arrow-path'
  if (s === 'open') return 'i-heroicons-ellipsis-horizontal-circle'
  return 'i-heroicons-minus-circle'
}
const stateIconColor = (s: string) => {
  if (s === 'done') return 'text-green-500'
  if (s === 'in-progress') return 'text-blue-500'
  if (s === 'open') return 'text-neutral-400'
  return 'text-neutral-300 dark:text-neutral-600'
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(24px);
  opacity: 0;
}
</style>
