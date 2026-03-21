<template>
  <div class="flex h-full">

    <!-- Left panel: grouped list -->
    <div class="w-96 flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800">

      <!-- Header + filters -->
      <div class="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h1 class="text-sm font-semibold">Inbox of debussy</h1>
            <p class="text-xs text-neutral-400 font-mono mt-0.5">{{ totalPending }} pending · {{ totalItems }} total</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-neutral-400">
            <UIcon name="i-heroicons-command-line" class="size-3.5" />
            <span class="font-mono">j/k · a · r</span>
          </div>
        </div>
        <!-- Type filter -->
        <div class="flex items-center gap-1">
          <button
            v-for="f in typeFilters"
            :key="f.value"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors"
            :class="activeTypeFilter === f.value
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'"
            @click="activeTypeFilter = f.value"
          >
            <UIcon :name="f.icon" class="size-3" />
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Items list -->
      <div ref="listEl" class="flex-1 overflow-y-auto">
        <div v-for="lane in visibleLanes" :key="lane.id">

          <!-- Lane separator -->
          <div class="sticky top-0 flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-100 dark:border-neutral-800 z-10">
            <div class="size-1.5 rounded-full" :class="lane.isActive ? 'bg-blue-500' : 'bg-neutral-400'" />
            <span class="font-mono text-xs font-medium text-neutral-500 dark:text-neutral-400">{{ lane.branch }}</span>
            <UBadge v-if="lane.isActive" label="staged" color="primary" variant="subtle" size="xs" />
            <span class="ml-auto text-xs text-neutral-400">{{ lanePendingCount(lane) }}</span>
          </div>

          <!-- Groups -->
          <div v-for="group in lane.groups" :key="group.id">

            <!-- Group header -->
            <button
              class="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left border-b border-neutral-100 dark:border-neutral-800"
              @click="toggleGroup(group.id)"
            >
              <UIcon :name="expanded.has(group.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="size-3 text-neutral-400 flex-shrink-0" />
              <UIcon :name="group.icon" class="size-3.5 text-neutral-400 flex-shrink-0" />
              <span class="flex-1 text-xs font-medium truncate">{{ group.title }}</span>
              <span class="text-xs text-neutral-400">{{ pendingCount(group) }}</span>
            </button>

            <!-- Items -->
            <div v-if="expanded.has(group.id)">
              <button
                v-for="item in filteredItems(group)"
                :key="item.id"
                class="group w-full flex items-start gap-3 px-4 py-3 transition-colors border-b border-neutral-100 dark:border-neutral-800 text-left"
                :class="selectedId === item.id
                  ? 'bg-neutral-100 dark:bg-neutral-800'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'"
                @click="selectItem(item.id, lane.id)"
              >
                <div class="w-3 flex-shrink-0" />
                <div class="flex-1 min-w-0 pt-0.5">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-medium truncate" :class="item.status === 'approved' ? 'text-neutral-400 line-through' : ''">{{ item.title }}</span>
                    <span v-if="item.rounds.length > 1" class="flex-shrink-0 font-mono text-xs text-blue-400">×{{ item.rounds.length }}</span>
                  </div>
                  <div class="text-xs text-neutral-400 mt-0.5 truncate">{{ item.subtitle }}</div>
                </div>
                <!-- Quick actions on hover -->
                <div v-if="item.status === 'pending'" class="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="size-5 rounded flex items-center justify-center text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors" title="Approve (a)">
                    <UIcon name="i-heroicons-check" class="size-3" />
                  </button>
                  <button class="size-5 rounded flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Reject (r)">
                    <UIcon name="i-heroicons-x-mark" class="size-3" />
                  </button>
                </div>
                <UBadge v-else :label="item.status" :color="statusColor(item.status)" variant="subtle" size="xs" />
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- Right panel: item detail -->
    <div class="flex-1 flex flex-col min-h-0">

      <!-- Sticky lane strip -->
      <div
        v-if="selectedItem"
        class="flex-shrink-0 flex items-center gap-2.5 px-6 py-2.5 border-b bg-white dark:bg-neutral-900"
        :class="selectedLane?.isActive
          ? 'border-blue-200 dark:border-blue-900/50'
          : 'border-neutral-200 dark:border-neutral-800'"
      >
        <div
          class="size-2 rounded-full flex-shrink-0"
          :class="selectedLane?.isActive ? 'bg-blue-500' : 'bg-neutral-400'"
        />
        <span
          class="font-mono text-xs font-medium truncate"
          :class="selectedLane?.isActive ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-500 dark:text-neutral-400'"
        >{{ selectedLane?.branch }}</span>
        <UBadge v-if="selectedLane?.isActive" label="staged" color="primary" variant="subtle" size="xs" class="flex-shrink-0" />
        <div class="flex-1" />
        <span class="font-mono text-xs text-neutral-400">{{ pendingInLane }} pending in lane</span>
      </div>

      <!-- Scrollable area -->
      <div class="flex-1 overflow-auto">

      <!-- Empty state -->
      <div v-if="!selectedItem" class="flex flex-col items-center justify-center h-full text-center px-8">
        <UIcon name="i-heroicons-inbox" class="size-10 text-neutral-300 dark:text-neutral-600 mb-4" />
        <p class="text-sm font-medium text-neutral-500">Select an item to review</p>
        <p class="text-xs text-neutral-400 mt-1">Use <span class="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">j</span> / <span class="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">k</span> to navigate</p>
      </div>

      <!-- Item detail -->
      <div v-else class="px-8 py-8">

        <!-- Breadcrumb + navigation -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-1.5 text-xs text-neutral-400">
            <span>{{ selectedGroup?.title }}</span>
          </div>
          <!-- Prev / Next -->
          <div class="flex items-center gap-1">
            <button
              class="size-6 rounded flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              :disabled="selectedIndex === 0"
              title="Previous (k)"
              @click="navigateBy(-1)"
            >
              <UIcon name="i-heroicons-chevron-up" class="size-3.5" />
            </button>
            <span class="font-mono text-xs text-neutral-400 w-12 text-center">{{ selectedIndex + 1 }} / {{ flatItems.length }}</span>
            <button
              class="size-6 rounded flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              :disabled="selectedIndex === flatItems.length - 1"
              title="Next (j)"
              @click="navigateBy(1)"
            >
              <UIcon name="i-heroicons-chevron-down" class="size-3.5" />
            </button>
          </div>
        </div>

        <!-- Title + status -->
        <div class="flex items-start justify-between gap-4 mb-4">
          <h2 class="text-lg font-semibold leading-snug">{{ selectedItem.title }}</h2>
          <UBadge :label="selectedItem.status" :color="statusColor(selectedItem.status)" variant="subtle" size="sm" class="flex-shrink-0 mt-1" />
        </div>

        <!-- Context chips -->
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-6 text-xs text-neutral-400">
          <div class="flex items-center gap-1.5">
            <UIcon :name="selectedGroup?.icon || 'i-heroicons-document-text'" class="size-3.5" />
            <span>{{ selectedGroup?.source }}</span>
          </div>
          <span class="text-neutral-300 dark:text-neutral-700">·</span>
          <div class="flex items-center gap-1.5">
            <UIcon name="i-heroicons-code-bracket" class="size-3.5" />
            <span class="font-mono">{{ selectedLaneId }}</span>
          </div>
          <span class="text-neutral-300 dark:text-neutral-700">·</span>
          <div class="flex items-center gap-1.5">
            <UIcon name="i-heroicons-clock" class="size-3.5" />
            <span>{{ selectedItem.createdAt }}</span>
          </div>
          <template v-if="selectedItem.rounds.length > 1">
            <span class="text-neutral-300 dark:text-neutral-700">·</span>
            <div class="flex items-center gap-1.5 text-blue-500">
              <UIcon name="i-heroicons-arrow-path" class="size-3.5" />
              <span>{{ selectedItem.rounds.length }} rounds</span>
            </div>
          </template>
        </div>

        <!-- Round selector (only when multiple rounds) -->
        <div v-if="selectedItem.rounds.length > 1" class="flex items-center gap-1 mb-5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
          <button
            v-for="round in selectedItem.rounds"
            :key="round.roundNumber"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            :class="activeRound === round.roundNumber
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'"
            @click="activeRound = round.roundNumber"
          >
            <span>Round {{ round.roundNumber }}</span>
            <span
              v-if="round.roundNumber === selectedItem.rounds.length"
              class="size-1.5 rounded-full"
              :class="selectedItem.status === 'pending' ? 'bg-amber-400' : selectedItem.status === 'approved' ? 'bg-green-400' : 'bg-red-400'"
            />
          </button>
        </div>

        <!-- Round content -->
        <template v-if="activeRoundData">

          <!-- Proposed content -->
          <div class="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 mb-4 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
              <span class="text-xs font-medium text-neutral-500">
                {{ selectedItem.rounds.length > 1 ? `Proposal — Round ${activeRoundData.roundNumber}` : 'Proposal' }}
              </span>
              <span class="text-xs text-neutral-400 font-mono">{{ activeRoundData.proposedAt }}</span>
            </div>
            <div class="p-5">
              <p class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{{ activeRoundData.content }}</p>
              <pre v-if="activeRoundData.code" class="mt-4 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-md p-4 overflow-auto font-mono leading-relaxed"><code>{{ activeRoundData.code }}</code></pre>
            </div>
          </div>

          <!-- Feedback from that round (if it's a past round) -->
          <div v-if="activeRoundData.feedback" class="rounded-lg border mb-5 overflow-hidden"
            :class="activeRoundData.feedbackStatus === 'changes-requested'
              ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10'
              : activeRoundData.feedbackStatus === 'approved'
              ? 'border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/10'
              : 'border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10'"
          >
            <div class="flex items-center justify-between px-4 py-2.5 border-b"
              :class="activeRoundData.feedbackStatus === 'changes-requested'
                ? 'border-amber-200 dark:border-amber-900/40'
                : activeRoundData.feedbackStatus === 'approved'
                ? 'border-green-200 dark:border-green-900/40'
                : 'border-red-200 dark:border-red-900/40'"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="activeRoundData.feedbackStatus === 'approved' ? 'i-heroicons-check-circle' : activeRoundData.feedbackStatus === 'changes-requested' ? 'i-heroicons-pencil-square' : 'i-heroicons-x-circle'"
                  class="size-3.5"
                  :class="activeRoundData.feedbackStatus === 'approved' ? 'text-green-500' : activeRoundData.feedbackStatus === 'changes-requested' ? 'text-amber-500' : 'text-red-500'"
                />
                <span class="text-xs font-medium"
                  :class="activeRoundData.feedbackStatus === 'approved' ? 'text-green-700 dark:text-green-400' : activeRoundData.feedbackStatus === 'changes-requested' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'"
                >
                  {{ activeRoundData.feedbackStatus === 'approved' ? 'Approved' : activeRoundData.feedbackStatus === 'changes-requested' ? 'Changes requested' : 'Rejected' }}
                </span>
              </div>
              <span class="text-xs text-neutral-400 font-mono">{{ activeRoundData.feedbackAt }}</span>
            </div>
            <div class="p-5">
              <p class="text-sm leading-relaxed"
                :class="activeRoundData.feedbackStatus === 'changes-requested'
                  ? 'text-amber-800 dark:text-amber-300'
                  : activeRoundData.feedbackStatus === 'approved'
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-red-800 dark:text-red-300'"
              >{{ activeRoundData.feedback }}</p>
            </div>
          </div>

        </template>

        <!-- Comment + actions (only for current pending round) -->
        <div v-if="selectedItem.status === 'pending' && activeRound === selectedItem.rounds.length">
          <UTextarea
            v-model="comment"
            :placeholder="commentPlaceholder"
            class="w-full"
            :rows="3"
            :class="commentError ? 'ring-1 ring-red-400' : ''"
          />
          <p v-if="commentError" class="mt-1 text-xs text-red-500">{{ commentError }}</p>
          <div class="mt-3 flex gap-2">
            <UButton label="Approve" icon="i-heroicons-check" color="success" variant="outline" class="flex-1" @click="submitAction('approved')" />
            <UButton label="Request changes" icon="i-heroicons-pencil" color="warning" variant="outline" class="flex-1" @click="submitAction('changes-requested')" />
            <UButton label="Reject" icon="i-heroicons-x-mark" color="error" variant="outline" class="flex-1" @click="submitAction('rejected')" />
          </div>
        </div>

      </div>

      </div><!-- /scrollable area -->
    </div><!-- /right panel -->

  </div>
</template>

<script setup lang="ts">
interface Round {
  roundNumber: number
  proposedAt: string
  content: string
  code?: string
  feedback?: string
  feedbackAt?: string
  feedbackStatus?: 'approved' | 'changes-requested' | 'rejected'
}

interface ReviewItem {
  id: string; title: string; subtitle: string; status: 'pending' | 'approved' | 'rejected'
  type: 'feedback' | 'code-review' | 'workflow'
  createdAt: string
  rounds: Round[]
}
interface ReviewGroup { id: string; title: string; icon: string; source: string; type: string; items: ReviewItem[] }
interface Lane { id: string; branch: string; isActive: boolean; groups: ReviewGroup[] }

const allLanes: Lane[] = [
  {
    id: 'root', branch: 'feat/42-unified-ui', isActive: true,
    groups: [
      { id: 'rg-1', title: 'Unified UI — Implementation Plan', icon: 'i-heroicons-document-text', source: '/feedback session', type: 'feedback', items: [
        { id: 'r-1', title: 'Layout structure and sidebar navigation', subtitle: 'Round 2 pending', status: 'pending', type: 'feedback', createdAt: '2h ago',
          rounds: [
            {
              roundNumber: 1,
              proposedAt: '3h ago',
              content: 'The layout uses a persistent left sidebar (w-60) with a project header, a lane list, and a separator above the Overview link. The main area fills remaining space and scrolls independently. Dark mode follows system preference.',
              feedback: 'The sidebar width feels too narrow for lane names that include branch names. Can we bump it to w-72 and add a collapsed state?',
              feedbackAt: '2h 30m ago',
              feedbackStatus: 'changes-requested',
            },
            {
              roundNumber: 2,
              proposedAt: '2h ago',
              content: 'Updated: sidebar is now w-72 with a collapse toggle in the header. Collapsed state shows only icons. Branch names truncate with ellipsis and show a tooltip on hover. Dark mode still follows system preference.',
            },
          ],
        },
        { id: 'r-2', title: 'Lane stage/unstage interaction model', subtitle: 'Approve or request changes', status: 'pending', type: 'feedback', createdAt: '2h ago',
          rounds: [
            {
              roundNumber: 1,
              proposedAt: '2h ago',
              content: 'The staged lane is marked with a filled blue dot in the sidebar. Non-staged lanes show a faint Stage button on hover. The lane detail page shows a prominent "Stage" or "Push back" button in its header.',
            },
          ],
        },
        { id: 'r-3', title: 'Inbox hierarchy and review groups', subtitle: 'Approved 10m ago', status: 'approved', type: 'feedback', createdAt: '4h ago',
          rounds: [
            {
              roundNumber: 1,
              proposedAt: '4h ago',
              content: 'Reviews are grouped by session or PR. Each group is collapsible. Individual items within a group link to the review detail page.',
              feedback: 'LGTM — this matches the mental model I had in mind.',
              feedbackAt: '10m ago',
              feedbackStatus: 'approved',
            },
          ],
        },
      ]},
      { id: 'rg-2', title: 'PR #42 — feat/42-unified-ui', icon: 'i-heroicons-code-bracket', source: 'code review', type: 'code-review', items: [
        { id: 'r-4', title: 'Nuxt layout structure', subtitle: 'layouts/default.vue', status: 'pending', type: 'code-review', createdAt: '1h ago',
          rounds: [
            {
              roundNumber: 1,
              proposedAt: '1h ago',
              content: 'The layout wraps everything in a full-height flex container. Sidebar is w-60 with flex-col. Main area is flex-1 overflow-auto.',
              code: `// layouts/default.vue\n<aside class="w-60 flex-shrink-0 flex flex-col ...">\n  <!-- project header, nav, lanes -->\n</aside>\n<main class="flex-1 overflow-auto">\n  <slot />\n</main>`,
              feedback: 'Use w-72 per the updated layout spec. Also missing aria-label on <aside>.',
              feedbackAt: '45m ago',
              feedbackStatus: 'changes-requested',
            },
            {
              roundNumber: 2,
              proposedAt: '30m ago',
              content: 'Updated sidebar width to w-72, added aria-label="Sidebar navigation", and added role="main" to the main element.',
              code: `// layouts/default.vue\n<aside aria-label="Sidebar navigation" class="w-72 flex-shrink-0 flex flex-col ...">\n  <!-- project header, nav, lanes -->\n</aside>\n<main role="main" class="flex-1 overflow-auto">\n  <slot />\n</main>`,
            },
          ],
        },
        { id: 'r-5', title: 'NavItem component', subtitle: 'components/NavItem.vue', status: 'approved', type: 'code-review', createdAt: '2h ago',
          rounds: [
            {
              roundNumber: 1,
              proposedAt: '2h ago',
              content: 'Simple component wrapping NuxtLink with active state detection and optional badge.',
              feedback: 'Good. Approved as-is.',
              feedbackAt: '1h ago',
              feedbackStatus: 'approved',
            },
          ],
        },
      ]},
    ],
  },
  {
    id: 'wt-feedback', branch: 'feat/feedback-ui', isActive: false,
    groups: [
      { id: 'rg-3', title: 'Feedback UI Enhancement — Spec', icon: 'i-heroicons-document-text', source: '/feedback session', type: 'feedback', items: [
        { id: 'r-6', title: 'Keyboard navigation shortcuts', subtitle: '⌘K / j·k / Enter', status: 'pending', type: 'feedback', createdAt: '5h ago',
          rounds: [
            {
              roundNumber: 1,
              proposedAt: '5h ago',
              content: 'Proposed shortcuts: j/k to move between items, Enter to open, a to approve, r to request changes, x to reject, ? for help. ⌘K opens a command palette.',
            },
          ],
        },
        { id: 'r-7', title: 'Server startup sequence', subtitle: 'Port detection + auto-open', status: 'pending', type: 'feedback', createdAt: '5h ago',
          rounds: [
            {
              roundNumber: 1,
              proposedAt: '5h ago',
              content: 'On skill invocation: scan for available port starting at 3001, write port to .port file, start Nitro server, open browser to that port. On skill exit: kill server, delete .port file.',
            },
          ],
        },
      ]},
    ],
  },
  {
    id: 'wt-fix', branch: 'fix/review-server', isActive: false,
    groups: [
      { id: 'rg-4', title: 'Fix: review server startup crash', icon: 'i-heroicons-bug-ant', source: 'workflow gate', type: 'workflow', items: [
        { id: 'r-8', title: 'Root cause — port conflict on 3001', subtitle: 'Proposed fix: dynamic port allocation', status: 'pending', type: 'workflow', createdAt: '6h ago',
          rounds: [
            {
              roundNumber: 1,
              proposedAt: '6h ago',
              content: 'The review server crashes on startup when port 3001 is already in use from a previous session that was not cleanly terminated. Fix: scan for a free port starting at 3001, use the first available, write it to .port file.',
            },
          ],
        },
      ]},
    ],
  },
]

const typeFilters = [
  { value: 'all',          label: 'All',      icon: 'i-heroicons-funnel' },
  { value: 'feedback',     label: 'Feedback', icon: 'i-heroicons-document-text' },
  { value: 'code-review',  label: 'Code',     icon: 'i-heroicons-code-bracket' },
  { value: 'workflow',     label: 'Workflow', icon: 'i-heroicons-arrow-path' },
]

const activeTypeFilter = ref('all')
const selectedId = ref<string | null>(null)
const selectedLaneId = ref<string | null>(null)
const activeRound = ref(1)
const listEl = ref<HTMLElement | null>(null)

const filteredItems = (group: ReviewGroup) =>
  activeTypeFilter.value === 'all'
    ? group.items
    : group.items.filter(i => i.type === activeTypeFilter.value)

const visibleLanes = computed(() =>
  allLanes.filter(l => l.groups.some(g => filteredItems(g).length > 0)),
)

const totalPending = computed(() => allLanes.flatMap(l => l.groups.flatMap(g => g.items)).filter(i => i.status === 'pending').length)
const totalItems = computed(() => allLanes.flatMap(l => l.groups.flatMap(g => g.items)).length)
const lanePendingCount = (lane: Lane) => lane.groups.flatMap(g => g.items).filter(i => i.status === 'pending').length

const allGroupIds = allLanes.flatMap(l => l.groups.map(g => g.id))
const expanded = ref(new Set(allGroupIds))
const toggleGroup = (id: string) => {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
  expanded.value = new Set(expanded.value)
}

const pendingCount = (g: ReviewGroup) => g.items.filter(i => i.status === 'pending').length

// Flat ordered list of visible items (respects filter + expanded groups)
const flatItems = computed(() => {
  const result: Array<{ item: ReviewItem; laneId: string }> = []
  for (const lane of visibleLanes.value) {
    for (const group of lane.groups) {
      if (!expanded.value.has(group.id)) continue
      for (const item of filteredItems(group)) {
        result.push({ item, laneId: lane.id })
      }
    }
  }
  return result
})

const selectedIndex = computed(() => flatItems.value.findIndex(x => x.item.id === selectedId.value))

const selectItem = (id: string, laneId: string) => {
  selectedId.value = id
  selectedLaneId.value = laneId
  comment.value = ''
  commentError.value = ''
  const item = allLanes.flatMap(l => l.groups.flatMap(g => g.items)).find(i => i.id === id)
  if (item) activeRound.value = item.rounds.length
}

const navigateBy = (delta: number) => {
  const next = selectedIndex.value + delta
  if (next < 0 || next >= flatItems.value.length) return
  const { item, laneId } = flatItems.value[next]
  selectItem(item.id, laneId)
}

const allItems = computed(() => allLanes.flatMap(l => l.groups.flatMap(g => g.items)))
const selectedItem = computed(() => allItems.value.find(i => i.id === selectedId.value) ?? null)
const selectedGroup = computed(() => allLanes.flatMap(l => l.groups).find(g => g.items.some(i => i.id === selectedId.value)) ?? null)
const selectedLane = computed(() => allLanes.find(l => l.id === selectedLaneId.value) ?? null)
const pendingInLane = computed(() => selectedLane.value?.groups.flatMap(g => g.items).filter(i => i.status === 'pending').length ?? 0)
const activeRoundData = computed(() => selectedItem.value?.rounds.find(r => r.roundNumber === activeRound.value) ?? null)

const statusColor = (s: string) => s === 'approved' ? 'success' as const : s === 'rejected' ? 'error' as const : 'warning' as const

const comment = ref('')
const commentError = ref('')
const commentPlaceholder = computed(() => {
  return 'Add a comment… (required for Request changes)'
})

const navigateToNextPending = () => {
  const start = selectedIndex.value
  for (let i = start + 1; i < flatItems.value.length; i++) {
    if (flatItems.value[i].item.status === 'pending') {
      const { item, laneId } = flatItems.value[i]
      selectItem(item.id, laneId)
      return
    }
  }
  // wrap around from beginning
  for (let i = 0; i < start; i++) {
    if (flatItems.value[i].item.status === 'pending') {
      const { item, laneId } = flatItems.value[i]
      selectItem(item.id, laneId)
      return
    }
  }
  // nothing left — stay on current
}

const submitAction = (action: 'approved' | 'changes-requested' | 'rejected') => {
  commentError.value = ''
  if (action === 'changes-requested' && !comment.value.trim()) {
    commentError.value = 'A comment is required when requesting changes.'
    return
  }
  // In a real app: persist the decision + comment here
  comment.value = ''
  navigateToNextPending()
}

// Keyboard navigation
onMounted(() => {
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})

const onKey = (e: KeyboardEvent) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.key === 'j') { e.preventDefault(); navigateBy(1) }
  if (e.key === 'k') { e.preventDefault(); navigateBy(-1) }
}
</script>
