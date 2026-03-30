<template>
  <div class="px-8 py-6">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-sm font-semibold">Sessions</span>
        <!-- Filters -->
        <div class="flex items-center gap-1">
          <button
            v-for="f in filters"
            :key="f.key"
            class="rounded-md px-2 py-0.5 text-xs transition-colors"
            :class="
              activeFilter === f.key
                ? 'bg-primary-500/15 text-primary-400 font-medium'
                : 'text-content-subtle hover:text-content-strong hover:bg-surface-tinted'
            "
            @click="activeFilter = f.key"
          >
            {{ f.label }}
            <span
              v-if="f.count > 0"
              class="ml-0.5 text-[10px] opacity-60"
            >{{
              f.count
            }}</span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="filteredSessions.length"
      class="border-line overflow-hidden rounded-lg border"
    >
      <div
        v-for="(session, i) in filteredSessions"
        :key="session.sessionId"
        class="bg-surface px-5 py-3.5"
        :class="
          i < filteredSessions.length - 1 ? 'border-line-subtle border-b' : ''
        "
      >
        <div class="flex items-center gap-3">
          <!-- Status indicator -->
          <UIcon
            v-if="session.status === 'running'"
            name="i-heroicons-arrow-path"
            class="text-primary-400 size-4 flex-shrink-0 animate-spin"
          />
          <UIcon
            v-else-if="session.status === 'completed'"
            name="i-heroicons-check-circle"
            class="size-4 flex-shrink-0 text-green-400"
          />
          <UIcon
            v-else
            name="i-heroicons-x-circle"
            class="size-4 flex-shrink-0 text-red-400"
          />

          <!-- Session info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 text-sm">
              <span class="truncate">{{ sessionPrompt(session) }}</span>
            </div>
            <div
              class="mt-0.5 flex items-center gap-2 text-xs text-neutral-400"
            >
              <UBadge
                :label="session.source"
                :color="session.source === 'cli' ? 'neutral' : 'primary'"
                variant="subtle"
                size="xs"
              />
              <UBadge
                :label="session.sessionId.slice(0, 8)"
                color="neutral"
                variant="subtle"
                size="xs"
              />
              <span>{{ session.model }}</span>
              <span class="text-content-ghost">&middot;</span>
              <span v-if="session.status === 'running'">{{
                runningElapsed(session)
              }}</span>
              <span
                v-else-if="session.source === 'dispatch' && session.elapsed"
              >{{ session.elapsed }}</span>
              <span class="text-content-ghost">&middot;</span>
              <span>{{ formatTime(session.startedAt) }}</span>
              <template v-if="session.source === 'cli' && session.slug">
                <span class="text-content-ghost">&middot;</span>
                <span class="italic">{{ session.slug }}</span>
              </template>
            </div>
          </div>

          <!-- View conversation -->
          <button
            class="text-content-subtle hover:text-primary-400 flex-shrink-0 p-1"
            title="View conversation"
            @click="openChat(session)"
          >
            <UIcon
              name="i-heroicons-chat-bubble-left-right"
              class="size-4"
            />
          </button>

          <!-- Expand toggle (dispatch sessions with output) -->
          <button
            v-if="canExpand(session)"
            class="text-content-subtle hover:text-content-strong flex-shrink-0 p-1"
            @click="toggleExpanded(session.sessionId)"
          >
            <UIcon
              :name="
                expanded.has(session.sessionId)
                  ? 'i-heroicons-chevron-up'
                  : 'i-heroicons-chevron-down'
              "
              class="size-4"
            />
          </button>
        </div>

        <!-- Expanded output (dispatch sessions only) -->
        <div
          v-if="
            expanded.has(session.sessionId) && session.source === 'dispatch'
          "
          class="mt-3"
        >
          <pre
            v-if="session.output"
            class="bg-surface-tinted max-h-60 overflow-auto rounded p-3 font-mono text-xs whitespace-pre-wrap text-neutral-300"
          >{{ session.output }}</pre>
          <pre
            v-if="session.error"
            class="bg-surface-tinted mt-2 max-h-40 overflow-auto rounded p-3 font-mono text-xs whitespace-pre-wrap text-red-300/70"
          >{{ session.error }}</pre>
          <div
            v-if="session.exitCode != null"
            class="mt-1 text-xs text-neutral-500"
          >
            exit {{ session.exitCode }}
            <span
              v-if="session.killed"
              class="text-orange-400"
            > (killed)</span>
          </div>
        </div>
      </div>
    </div>
    <EmptyState
      v-else
      icon="i-heroicons-bolt"
      :text="
        activeFilter === 'all' ? 'No sessions yet' : 'No matching sessions'
      "
    />

    <!-- Session chat viewer -->
    <SessionChatViewer
      :open="chatOpen"
      :lane-id="laneId"
      :session="chatSession"
      @close="chatOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { LaneSession } from '~/composables/useLanes'

const props = defineProps<{
  laneId: string
  autoOpenSessionId?: string | null
}>()

const emit = defineEmits<{
  sessionDone: []
  sessionOpened: []
}>()

const { getSessions } = useLanes()

const sessions = ref<LaneSession[]>([])
const expanded = ref(new Set<string>())
const activeFilter = ref<'all' | 'running' | 'dispatch' | 'cli'>('all')
const chatOpen = ref(false)
const chatSession = ref<LaneSession | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

function openChat(session: LaneSession) {
  chatSession.value = session
  chatOpen.value = true
}

// ─── Filters ────────────────────────────────────────────────────────────────

const counts = computed(() => ({
  all: sessions.value.length,
  running: sessions.value.filter((s) => s.status === 'running').length,
  dispatch: sessions.value.filter((s) => s.source === 'dispatch').length,
  cli: sessions.value.filter((s) => s.source === 'cli').length,
}))

const filters = computed(() => [
  { key: 'all' as const, label: 'All', count: counts.value.all },
  { key: 'running' as const, label: 'Running', count: counts.value.running },
  { key: 'dispatch' as const, label: 'Dispatch', count: counts.value.dispatch },
  { key: 'cli' as const, label: 'CLI', count: counts.value.cli },
])

const filteredSessions = computed(() => {
  switch (activeFilter.value) {
    case 'running':
      return sessions.value.filter((s) => s.status === 'running')
    case 'dispatch':
      return sessions.value.filter((s) => s.source === 'dispatch')
    case 'cli':
      return sessions.value.filter((s) => s.source === 'cli')
    default:
      return sessions.value
  }
})

// ─── Helpers ────────────────────────────────────────────────────────────────

function sessionPrompt(session: LaneSession) {
  if (session.source === 'cli') {
    return session.prompt || session.slug || '(interactive session)'
  }
  return session.prompt
}

function canExpand(session: LaneSession) {
  return (
    session.source === 'dispatch' &&
    session.status !== 'running' &&
    (session.output || session.error)
  )
}

function toggleExpanded(id: string) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
}

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function runningElapsed(session: LaneSession) {
  const ms = Date.now() - new Date(session.startedAt).getTime()
  const secs = Math.floor(ms / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ${secs % 60}s`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

// ─── Data loading ───────────────────────────────────────────────────────────

async function loadSessions() {
  sessions.value = await getSessions(props.laneId)
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(async () => {
    await loadSessions()
    const hadRunningDispatch = sessions.value.some(
      (s) => s.source === 'dispatch' && s.status === 'running'
    )
    if (!hadRunningDispatch) {
      stopPolling()
      emit('sessionDone')
    }
  }, 3000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

watch(
  () => props.laneId,
  async () => {
    await loadSessions()
    const hasRunningDispatch = sessions.value.some(
      (s) => s.source === 'dispatch' && s.status === 'running'
    )
    if (hasRunningDispatch) {
      startPolling()
    }
  },
  { immediate: true }
)

// Auto-open session slideover when autoOpenSessionId matches a loaded session
watch([sessions, () => props.autoOpenSessionId], ([list, targetId]) => {
  if (!targetId) return
  const match = list.find((s) => s.sessionId === targetId)
  if (match) {
    openChat(match)
    emit('sessionOpened')
  }
})

onUnmounted(() => stopPolling())
</script>
