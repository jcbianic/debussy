<template>
  <div class="flex h-full">

    <!-- Left panel: grouped list -->
    <div class="w-96 flex-shrink-0 flex flex-col border-r border-line">

      <!-- Header + filters -->
      <div class="px-5 py-4 border-b border-line bg-surface">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h1 class="text-sm font-semibold">Inbox of debussy</h1>
            <p class="text-xs text-content-faint font-mono mt-0.5">{{ totalPending }} pending · {{ totalItems }} total</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-content-faint">
            <UIcon name="i-heroicons-command-line" class="size-3.5" />
            <span class="font-mono">j/k · a · r</span>
          </div>
        </div>
        <!-- Type filter -->
        <SegmentedControl v-model="activeTypeFilter" :options="typeFilters" />
      </div>

      <!-- Items list -->
      <div ref="listEl" class="flex-1 overflow-y-auto">
        <div v-for="lane in visibleLanes" :key="lane.id">

          <!-- Lane separator -->
          <div class="sticky top-0 flex items-center gap-2 px-4 py-2 bg-surface-hover-subtle backdrop-blur-sm border-b border-line-subtle z-10">
            <div class="size-1.5 rounded-full" :class="lane.isActive ? 'bg-blue-500' : 'bg-neutral-400'" />
            <span class="font-mono text-xs font-medium text-content-subtle">{{ lane.branch }}</span>
            <UBadge v-if="lane.isActive" label="staged" color="primary" variant="subtle" size="xs" />
            <span class="ml-auto text-xs text-content-faint">{{ lanePendingCount(lane) }}</span>
          </div>

          <!-- Groups -->
          <div v-for="group in lane.groups" :key="group.id">

            <!-- Group header -->
            <button
              class="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-surface-hover-subtle transition-colors text-left border-b border-line-subtle"
              @click="toggleGroup(group.id)"
            >
              <UIcon :name="expanded.has(group.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="size-3 text-content-faint flex-shrink-0" />
              <UIcon :name="group.icon" class="size-3.5 text-content-faint flex-shrink-0" />
              <span class="flex-1 text-xs font-medium truncate">{{ group.title }}</span>
              <span class="text-xs text-content-faint">{{ pendingCount(group) }}</span>
            </button>

            <!-- Items -->
            <div v-if="expanded.has(group.id)">
              <button
                v-for="item in filteredItems(group)"
                :key="item.id"
                class="group w-full flex items-start gap-3 px-4 py-3 transition-colors border-b border-line-subtle text-left"
                :class="selectedId === item.id
                  ? 'bg-surface-sunken'
                  : 'hover:bg-surface-hover-subtle'"
                @click="selectItem(item.id, lane.id)"
              >
                <div class="w-3 flex-shrink-0" />
                <div class="flex-1 min-w-0 pt-0.5">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-medium truncate" :class="item.status === 'approved' ? 'text-content-faint line-through' : ''">{{ item.title }}</span>
                    <span v-if="item.rounds.length > 1" class="flex-shrink-0 font-mono text-xs text-blue-400">×{{ item.rounds.length }}</span>
                  </div>
                  <div class="text-xs text-content-faint mt-0.5 truncate">{{ item.subtitle }}</div>
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
        class="flex-shrink-0 flex items-center gap-2.5 px-6 py-2.5 border-b bg-surface"
        :class="selectedLane?.isActive
          ? 'border-blue-200 dark:border-blue-900/50'
          : 'border-line'"
      >
        <div
          class="size-2 rounded-full flex-shrink-0"
          :class="selectedLane?.isActive ? 'bg-status-active' : 'bg-neutral-400'"
        />
        <span
          class="font-mono text-xs font-medium truncate"
          :class="selectedLane?.isActive ? 'text-blue-700 dark:text-blue-300' : 'text-content-subtle'"
        >{{ selectedLane?.branch }}</span>
        <UBadge v-if="selectedLane?.isActive" label="staged" color="primary" variant="subtle" size="xs" class="flex-shrink-0" />
        <div class="flex-1" />
        <span class="font-mono text-xs text-content-faint">{{ pendingInLane }} pending in lane</span>
      </div>

      <!-- Scrollable area -->
      <div class="flex-1 overflow-auto">

      <!-- Empty state -->
      <div v-if="!selectedItem" class="flex flex-col items-center justify-center h-full text-center px-8">
        <UIcon name="i-heroicons-inbox" class="size-10 text-content-placeholder mb-4" />
        <p class="text-sm font-medium text-content-subtle">Select an item to review</p>
        <p class="text-xs text-content-faint mt-1">Use <span class="font-mono bg-surface-sunken px-1 py-0.5 rounded">j</span> / <span class="font-mono bg-surface-sunken px-1 py-0.5 rounded">k</span> to navigate</p>
      </div>

      <!-- Item detail -->
      <div v-else class="px-8 py-8">

        <!-- Breadcrumb + navigation -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-1.5 text-xs text-content-faint">
            <span>{{ selectedGroup?.title }}</span>
          </div>
          <!-- Prev / Next -->
          <div class="flex items-center gap-1">
            <button
              class="size-6 rounded flex items-center justify-center text-content-faint hover:bg-surface-hover disabled:opacity-30 transition-colors"
              :disabled="selectedIndex === 0"
              title="Previous (k)"
              @click="navigateBy(-1)"
            >
              <UIcon name="i-heroicons-chevron-up" class="size-3.5" />
            </button>
            <span class="font-mono text-xs text-content-faint w-12 text-center">{{ selectedIndex + 1 }} / {{ flatItems.length }}</span>
            <button
              class="size-6 rounded flex items-center justify-center text-content-faint hover:bg-surface-hover disabled:opacity-30 transition-colors"
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
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-6 text-xs text-content-faint">
          <div class="flex items-center gap-1.5">
            <UIcon :name="selectedGroup?.icon || 'i-heroicons-document-text'" class="size-3.5" />
            <span>{{ selectedGroup?.source }}</span>
          </div>
          <span class="text-content-placeholder">·</span>
          <div class="flex items-center gap-1.5">
            <UIcon name="i-heroicons-code-bracket" class="size-3.5" />
            <span class="font-mono">{{ selectedLaneId }}</span>
          </div>
          <span class="text-content-placeholder">·</span>
          <div class="flex items-center gap-1.5">
            <UIcon name="i-heroicons-clock" class="size-3.5" />
            <span>{{ selectedItem.createdAt }}</span>
          </div>
          <template v-if="selectedItem.rounds.length > 1">
            <span class="text-content-placeholder">·</span>
            <div class="flex items-center gap-1.5 text-blue-500">
              <UIcon name="i-heroicons-arrow-path" class="size-3.5" />
              <span>{{ selectedItem.rounds.length }} rounds</span>
            </div>
          </template>
        </div>

        <!-- Round selector (only when multiple rounds) -->
        <div v-if="selectedItem.rounds.length > 1" class="flex items-center gap-1 mb-5 p-1 bg-surface-sunken rounded-lg w-fit">
          <button
            v-for="round in selectedItem.rounds"
            :key="round.roundNumber"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            :class="activeRound === round.roundNumber
              ? 'bg-surface-elevated text-content shadow-sm'
              : 'text-content-subtle hover:text-content-secondary'"
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
          <div class="rounded-lg border border-line bg-surface mb-4 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-line-subtle">
              <span class="text-xs font-medium text-content-subtle">
                {{ selectedItem.rounds.length > 1 ? `Proposal — Round ${activeRoundData.roundNumber}` : 'Proposal' }}
              </span>
              <span class="text-xs text-content-faint font-mono">{{ activeRoundData.proposedAt }}</span>
            </div>
            <div class="p-5">
              <p class="text-sm text-content-secondary leading-relaxed">{{ activeRoundData.content }}</p>
              <pre v-if="activeRoundData.code" class="mt-4 text-xs bg-surface-page border border-line-subtle rounded-md p-4 overflow-auto font-mono leading-relaxed"><code>{{ activeRoundData.code }}</code></pre>
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
              <span class="text-xs text-content-faint font-mono">{{ activeRoundData.feedbackAt }}</span>
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
import type { ReviewItem, ReviewGroup, Lane } from '~/composables/useMockData'

const { lanes: allLanes } = useMockData()

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
const { expanded, toggle: toggleGroup } = useExpandable(allGroupIds)

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
