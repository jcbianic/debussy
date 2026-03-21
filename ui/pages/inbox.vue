<template>
  <div class="flex h-full">
    <!-- Left panel: grouped list -->
    <div class="border-line flex w-96 flex-shrink-0 flex-col border-r">
      <!-- Header + filters -->
      <div class="border-line bg-surface border-b px-5 py-4">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h1 class="text-sm font-semibold">Inbox of debussy</h1>
            <p class="text-content-faint mt-0.5 font-mono text-xs">
              {{ totalPending }} pending · {{ totalItems }} total
            </p>
          </div>
          <div class="text-content-faint flex items-center gap-1.5 text-xs">
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
          <div
            class="bg-surface-hover-subtle border-line-subtle sticky top-0 z-10 flex items-center gap-2 border-b px-4 py-2 backdrop-blur-sm"
          >
            <div
              class="size-1.5 rounded-full"
              :class="lane.isActive ? 'bg-blue-500' : 'bg-neutral-400'"
            />
            <span class="text-content-subtle font-mono text-xs font-medium">{{
              lane.branch
            }}</span>
            <UBadge
              v-if="lane.isActive"
              label="staged"
              color="primary"
              variant="subtle"
              size="xs"
            />
            <span class="text-content-faint ml-auto text-xs">{{
              lanePendingCount(lane)
            }}</span>
          </div>

          <!-- Groups -->
          <div v-for="group in lane.groups" :key="group.id">
            <!-- Group header -->
            <button
              class="hover:bg-surface-hover-subtle border-line-subtle flex w-full items-center gap-2.5 border-b px-4 py-2.5 text-left transition-colors"
              @click="toggleGroup(group.id)"
            >
              <UIcon
                :name="
                  expanded.has(group.id)
                    ? 'i-heroicons-chevron-down'
                    : 'i-heroicons-chevron-right'
                "
                class="text-content-faint size-3 flex-shrink-0"
              />
              <UIcon
                :name="group.icon"
                class="text-content-faint size-3.5 flex-shrink-0"
              />
              <span class="flex-1 truncate text-xs font-medium">{{
                group.title
              }}</span>
              <span class="text-content-faint text-xs">{{
                pendingCount(group)
              }}</span>
            </button>

            <!-- Items -->
            <div v-if="expanded.has(group.id)">
              <button
                v-for="item in filteredItems(group)"
                :key="item.id"
                class="group border-line-subtle flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors"
                :class="
                  selectedId === item.id
                    ? 'bg-surface-sunken'
                    : 'hover:bg-surface-hover-subtle'
                "
                @click="selectItem(item.id, lane.id)"
              >
                <div class="w-3 flex-shrink-0" />
                <div class="min-w-0 flex-1 pt-0.5">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="truncate text-xs font-medium"
                      :class="
                        item.status === 'approved'
                          ? 'text-content-faint line-through'
                          : ''
                      "
                      >{{ item.title }}</span
                    >
                    <span
                      v-if="item.rounds.length > 1"
                      class="flex-shrink-0 font-mono text-xs text-blue-400"
                      >×{{ item.rounds.length }}</span
                    >
                  </div>
                  <div class="text-content-faint mt-0.5 truncate text-xs">
                    {{ item.subtitle }}
                  </div>
                </div>
                <!-- Quick actions on hover -->
                <div
                  v-if="item.status === 'pending'"
                  class="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <button
                    class="flex size-5 items-center justify-center rounded text-green-600 transition-colors hover:bg-green-100 dark:hover:bg-green-900/30"
                    title="Approve (a)"
                  >
                    <UIcon name="i-heroicons-check" class="size-3" />
                  </button>
                  <button
                    class="flex size-5 items-center justify-center rounded text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
                    title="Reject (r)"
                  >
                    <UIcon name="i-heroicons-x-mark" class="size-3" />
                  </button>
                </div>
                <UBadge
                  v-else
                  :label="item.status"
                  :color="statusColor(item.status)"
                  variant="subtle"
                  size="xs"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel: item detail -->
    <div class="flex min-h-0 flex-1 flex-col">
      <!-- Sticky lane strip -->
      <div
        v-if="selectedItem"
        class="bg-surface flex flex-shrink-0 items-center gap-2.5 border-b px-6 py-2.5"
        :class="
          selectedLane?.isActive
            ? 'border-blue-200 dark:border-blue-900/50'
            : 'border-line'
        "
      >
        <div
          class="size-2 flex-shrink-0 rounded-full"
          :class="
            selectedLane?.isActive ? 'bg-status-active' : 'bg-neutral-400'
          "
        />
        <span
          class="truncate font-mono text-xs font-medium"
          :class="
            selectedLane?.isActive
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-content-subtle'
          "
          >{{ selectedLane?.branch }}</span
        >
        <UBadge
          v-if="selectedLane?.isActive"
          label="staged"
          color="primary"
          variant="subtle"
          size="xs"
          class="flex-shrink-0"
        />
        <div class="flex-1" />
        <span class="text-content-faint font-mono text-xs"
          >{{ pendingInLane }} pending in lane</span
        >
      </div>

      <!-- Scrollable area -->
      <div class="flex-1 overflow-auto">
        <!-- Empty state -->
        <div
          v-if="!selectedItem"
          class="flex h-full flex-col items-center justify-center px-8 text-center"
        >
          <UIcon
            name="i-heroicons-inbox"
            class="text-content-placeholder mb-4 size-10"
          />
          <p class="text-content-subtle text-sm font-medium">
            Select an item to review
          </p>
          <p class="text-content-faint mt-1 text-xs">
            Use
            <span class="bg-surface-sunken rounded px-1 py-0.5 font-mono"
              >j</span
            >
            /
            <span class="bg-surface-sunken rounded px-1 py-0.5 font-mono"
              >k</span
            >
            to navigate
          </p>
        </div>

        <!-- Item detail -->
        <div v-else class="px-8 py-8">
          <!-- Breadcrumb + navigation -->
          <div class="mb-6 flex items-center justify-between">
            <div class="text-content-faint flex items-center gap-1.5 text-xs">
              <span>{{ selectedGroup?.title }}</span>
            </div>
            <!-- Prev / Next -->
            <div class="flex items-center gap-1">
              <button
                class="text-content-faint hover:bg-surface-hover flex size-6 items-center justify-center rounded transition-colors disabled:opacity-30"
                :disabled="selectedIndex === 0"
                title="Previous (k)"
                @click="navigateBy(-1)"
              >
                <UIcon name="i-heroicons-chevron-up" class="size-3.5" />
              </button>
              <span
                class="text-content-faint w-12 text-center font-mono text-xs"
                >{{ selectedIndex + 1 }} / {{ flatItems.length }}</span
              >
              <button
                class="text-content-faint hover:bg-surface-hover flex size-6 items-center justify-center rounded transition-colors disabled:opacity-30"
                :disabled="selectedIndex === flatItems.length - 1"
                title="Next (j)"
                @click="navigateBy(1)"
              >
                <UIcon name="i-heroicons-chevron-down" class="size-3.5" />
              </button>
            </div>
          </div>

          <!-- Title + status -->
          <div class="mb-4 flex items-start justify-between gap-4">
            <h2 class="text-lg leading-snug font-semibold">
              {{ selectedItem.title }}
            </h2>
            <UBadge
              :label="selectedItem.status"
              :color="statusColor(selectedItem.status)"
              variant="subtle"
              size="sm"
              class="mt-1 flex-shrink-0"
            />
          </div>

          <!-- Context chips -->
          <div
            class="text-content-faint mb-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs"
          >
            <div class="flex items-center gap-1.5">
              <UIcon
                :name="selectedGroup?.icon || 'i-heroicons-document-text'"
                class="size-3.5"
              />
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
          <div
            v-if="selectedItem.rounds.length > 1"
            class="bg-surface-sunken mb-5 flex w-fit items-center gap-1 rounded-lg p-1"
          >
            <button
              v-for="round in selectedItem.rounds"
              :key="round.roundNumber"
              class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              :class="
                activeRound === round.roundNumber
                  ? 'bg-surface-elevated text-content shadow-sm'
                  : 'text-content-subtle hover:text-content-secondary'
              "
              @click="activeRound = round.roundNumber"
            >
              <span>Round {{ round.roundNumber }}</span>
              <span
                v-if="round.roundNumber === selectedItem.rounds.length"
                class="size-1.5 rounded-full"
                :class="
                  selectedItem.status === 'pending'
                    ? 'bg-amber-400'
                    : selectedItem.status === 'approved'
                      ? 'bg-green-400'
                      : 'bg-red-400'
                "
              />
            </button>
          </div>

          <!-- Round content -->
          <template v-if="activeRoundData">
            <!-- Proposed content -->
            <div
              class="border-line bg-surface mb-4 overflow-hidden rounded-lg border"
            >
              <div
                class="border-line-subtle flex items-center justify-between border-b px-4 py-2.5"
              >
                <span class="text-content-subtle text-xs font-medium">
                  {{
                    selectedItem.rounds.length > 1
                      ? `Proposal — Round ${activeRoundData.roundNumber}`
                      : 'Proposal'
                  }}
                </span>
                <span class="text-content-faint font-mono text-xs">{{
                  activeRoundData.proposedAt
                }}</span>
              </div>
              <div class="p-5">
                <p class="text-content-secondary text-sm leading-relaxed">
                  {{ activeRoundData.content }}
                </p>
                <pre
                  v-if="activeRoundData.code"
                  class="bg-surface-page border-line-subtle mt-4 overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed"
                ><code>{{ activeRoundData.code }}</code></pre>
              </div>
            </div>

            <!-- Feedback from that round (if it's a past round) -->
            <div
              v-if="activeRoundData.feedback"
              class="mb-5 overflow-hidden rounded-lg border"
              :class="
                activeRoundData.feedbackStatus === 'changes-requested'
                  ? 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10'
                  : activeRoundData.feedbackStatus === 'approved'
                    ? 'border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10'
                    : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10'
              "
            >
              <div
                class="flex items-center justify-between border-b px-4 py-2.5"
                :class="
                  activeRoundData.feedbackStatus === 'changes-requested'
                    ? 'border-amber-200 dark:border-amber-900/40'
                    : activeRoundData.feedbackStatus === 'approved'
                      ? 'border-green-200 dark:border-green-900/40'
                      : 'border-red-200 dark:border-red-900/40'
                "
              >
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="
                      activeRoundData.feedbackStatus === 'approved'
                        ? 'i-heroicons-check-circle'
                        : activeRoundData.feedbackStatus === 'changes-requested'
                          ? 'i-heroicons-pencil-square'
                          : 'i-heroicons-x-circle'
                    "
                    class="size-3.5"
                    :class="
                      activeRoundData.feedbackStatus === 'approved'
                        ? 'text-green-500'
                        : activeRoundData.feedbackStatus === 'changes-requested'
                          ? 'text-amber-500'
                          : 'text-red-500'
                    "
                  />
                  <span
                    class="text-xs font-medium"
                    :class="
                      activeRoundData.feedbackStatus === 'approved'
                        ? 'text-green-700 dark:text-green-400'
                        : activeRoundData.feedbackStatus === 'changes-requested'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-red-700 dark:text-red-400'
                    "
                  >
                    {{
                      activeRoundData.feedbackStatus === 'approved'
                        ? 'Approved'
                        : activeRoundData.feedbackStatus === 'changes-requested'
                          ? 'Changes requested'
                          : 'Rejected'
                    }}
                  </span>
                </div>
                <span class="text-content-faint font-mono text-xs">{{
                  activeRoundData.feedbackAt
                }}</span>
              </div>
              <div class="p-5">
                <p
                  class="text-sm leading-relaxed"
                  :class="
                    activeRoundData.feedbackStatus === 'changes-requested'
                      ? 'text-amber-800 dark:text-amber-300'
                      : activeRoundData.feedbackStatus === 'approved'
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-red-800 dark:text-red-300'
                  "
                >
                  {{ activeRoundData.feedback }}
                </p>
              </div>
            </div>
          </template>

          <!-- Comment + actions (only for current pending round) -->
          <div
            v-if="
              selectedItem.status === 'pending' &&
              activeRound === selectedItem.rounds.length
            "
          >
            <UTextarea
              v-model="comment"
              :placeholder="commentPlaceholder"
              class="w-full"
              :rows="3"
              :class="commentError ? 'ring-1 ring-red-400' : ''"
            />
            <p v-if="commentError" class="mt-1 text-xs text-red-500">
              {{ commentError }}
            </p>
            <div class="mt-3 flex gap-2">
              <UButton
                label="Approve"
                icon="i-heroicons-check"
                color="success"
                variant="outline"
                class="flex-1"
                @click="submitAction('approved')"
              />
              <UButton
                label="Request changes"
                icon="i-heroicons-pencil"
                color="warning"
                variant="outline"
                class="flex-1"
                @click="submitAction('changes-requested')"
              />
              <UButton
                label="Reject"
                icon="i-heroicons-x-mark"
                color="error"
                variant="outline"
                class="flex-1"
                @click="submitAction('rejected')"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- /scrollable area -->
    </div>
    <!-- /right panel -->
  </div>
</template>

<script setup lang="ts">
import type { ReviewItem, ReviewGroup, Lane } from '~/composables/useMockData'

const { lanes: allLanes } = useMockData()

const typeFilters = [
  { value: 'all', label: 'All', icon: 'i-heroicons-funnel' },
  { value: 'feedback', label: 'Feedback', icon: 'i-heroicons-document-text' },
  { value: 'code-review', label: 'Code', icon: 'i-heroicons-code-bracket' },
  { value: 'workflow', label: 'Workflow', icon: 'i-heroicons-arrow-path' },
]

const activeTypeFilter = ref('all')
const selectedId = ref<string | null>(null)
const selectedLaneId = ref<string | null>(null)
const activeRound = ref(1)
const listEl = ref<HTMLElement | null>(null)

const filteredItems = (group: ReviewGroup) =>
  activeTypeFilter.value === 'all'
    ? group.items
    : group.items.filter((i) => i.type === activeTypeFilter.value)

const visibleLanes = computed(() =>
  allLanes.filter((l) => l.groups.some((g) => filteredItems(g).length > 0))
)

const totalPending = computed(
  () =>
    allLanes
      .flatMap((l) => l.groups.flatMap((g) => g.items))
      .filter((i) => i.status === 'pending').length
)
const totalItems = computed(
  () => allLanes.flatMap((l) => l.groups.flatMap((g) => g.items)).length
)
const lanePendingCount = (lane: Lane) =>
  lane.groups.flatMap((g) => g.items).filter((i) => i.status === 'pending')
    .length

const allGroupIds = allLanes.flatMap((l) => l.groups.map((g) => g.id))
const { expanded, toggle: toggleGroup } = useExpandable(allGroupIds)

const pendingCount = (g: ReviewGroup) =>
  g.items.filter((i) => i.status === 'pending').length

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

const selectedIndex = computed(() =>
  flatItems.value.findIndex((x) => x.item.id === selectedId.value)
)

const selectItem = (id: string, laneId: string) => {
  selectedId.value = id
  selectedLaneId.value = laneId
  comment.value = ''
  commentError.value = ''
  const item = allLanes
    .flatMap((l) => l.groups.flatMap((g) => g.items))
    .find((i) => i.id === id)
  if (item) activeRound.value = item.rounds.length
}

const navigateBy = (delta: number) => {
  const next = selectedIndex.value + delta
  if (next < 0 || next >= flatItems.value.length) return
  const entry = flatItems.value[next]
  if (!entry) return
  selectItem(entry.item.id, entry.laneId)
}

const allItems = computed(() =>
  allLanes.flatMap((l) => l.groups.flatMap((g) => g.items))
)
const selectedItem = computed(
  () => allItems.value.find((i) => i.id === selectedId.value) ?? null
)
const selectedGroup = computed(
  () =>
    allLanes
      .flatMap((l) => l.groups)
      .find((g) => g.items.some((i) => i.id === selectedId.value)) ?? null
)
const selectedLane = computed(
  () => allLanes.find((l) => l.id === selectedLaneId.value) ?? null
)
const pendingInLane = computed(
  () =>
    selectedLane.value?.groups
      .flatMap((g) => g.items)
      .filter((i) => i.status === 'pending').length ?? 0
)
const activeRoundData = computed(
  () =>
    selectedItem.value?.rounds.find(
      (r) => r.roundNumber === activeRound.value
    ) ?? null
)

const comment = ref('')
const commentError = ref('')
const commentPlaceholder = computed(() => {
  return 'Add a comment… (required for Request changes)'
})

const navigateToNextPending = () => {
  const start = selectedIndex.value
  for (let i = start + 1; i < flatItems.value.length; i++) {
    const fwd = flatItems.value[i]
    if (fwd?.item.status === 'pending') {
      selectItem(fwd.item.id, fwd.laneId)
      return
    }
  }
  // wrap around from beginning
  for (let i = 0; i < start; i++) {
    const fwd = flatItems.value[i]
    if (fwd?.item.status === 'pending') {
      selectItem(fwd.item.id, fwd.laneId)
      return
    }
  }
  // nothing left — stay on current
}

const submitAction = (
  action: 'approved' | 'changes-requested' | 'rejected'
) => {
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
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  )
    return
  if (e.key === 'j') {
    e.preventDefault()
    navigateBy(1)
  }
  if (e.key === 'k') {
    e.preventDefault()
    navigateBy(-1)
  }
}
</script>
