<template>
  <USlideover
    :open="open"
    :title="title"
    :description="description"
    class="w-[640px]"
    @update:open="$emit('close')"
  >
    <template #body>
      <div
        v-if="loading"
        class="flex h-64 items-center justify-center"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="text-content-muted size-5 animate-spin"
        />
      </div>
      <div
        v-else-if="messages.length === 0"
        class="flex h-64 items-center justify-center"
      >
        <span class="text-content-muted text-sm">No messages</span>
      </div>
      <div
        v-else
        ref="chatContainer"
        class="flex flex-col gap-4 py-2"
      >
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex gap-3"
          :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
        >
          <!-- Avatar -->
          <div
            class="flex size-7 flex-shrink-0 items-center justify-center rounded-full"
            :class="
              msg.role === 'user'
                ? 'bg-primary-500/15 text-primary-400'
                : 'bg-surface-tinted text-content-subtle'
            "
          >
            <UIcon
              :name="
                msg.role === 'user'
                  ? 'i-heroicons-user'
                  : 'i-heroicons-cpu-chip'
              "
              class="size-3.5"
            />
          </div>

          <!-- Bubble -->
          <div
            class="max-w-[85%] min-w-0 rounded-xl px-4 py-2.5"
            :class="
              msg.role === 'user'
                ? 'bg-primary-500/10 text-content-strong'
                : 'bg-surface-tinted text-content-default'
            "
          >
            <!-- Text content -->
            <div
              v-if="msg.content"
              class="text-sm leading-relaxed whitespace-pre-wrap"
            >
              {{ msg.content }}
            </div>

            <!-- Tool calls -->
            <div
              v-if="msg.tools?.length"
              class="mt-2 flex flex-col gap-1"
              :class="msg.content ? 'border-line-subtle border-t pt-2' : ''"
            >
              <div
                v-for="(tool, ti) in msg.tools"
                :key="ti"
                class="bg-surface flex items-center gap-2 rounded-md px-2.5 py-1.5 font-mono text-xs"
              >
                <UIcon
                  :name="toolIcon(tool.name)"
                  class="text-content-ghost size-3.5 flex-shrink-0"
                />
                <span class="text-content-subtle font-semibold">{{
                  tool.name
                }}</span>
                <span
                  v-if="tool.summary"
                  class="text-content-ghost min-w-0 truncate"
                >{{ tool.summary }}</span>
              </div>
            </div>

            <!-- Timestamp -->
            <div
              class="text-content-ghost mt-1 text-[10px]"
              :class="msg.role === 'user' ? 'text-right' : ''"
            >
              {{ formatTime(msg.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type { ChatMessage, LaneSession } from '~/composables/useLanes'

const props = defineProps<{
  open: boolean
  laneId: string
  session: LaneSession | null
}>()

defineEmits<{
  close: []
}>()

const { getSessionMessages } = useLanes()

const messages = ref<ChatMessage[]>([])
const loading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

const title = computed(() => {
  if (!props.session) return 'Session'
  if (props.session.source === 'cli') {
    return props.session.slug || props.session.sessionId.slice(0, 12)
  }
  return `Dispatch ${props.session.sessionId.slice(0, 8)}`
})

const description = computed(() => {
  if (!props.session) return ''
  return `${props.session.model} · ${props.session.status}`
})

function toolIcon(name: string): string {
  switch (name) {
    case 'Read':
      return 'i-heroicons-document-text'
    case 'Write':
      return 'i-heroicons-pencil-square'
    case 'Edit':
      return 'i-heroicons-pencil'
    case 'Bash':
      return 'i-heroicons-command-line'
    case 'Grep':
      return 'i-heroicons-magnifying-glass'
    case 'Glob':
      return 'i-heroicons-folder-open'
    case 'Skill':
      return 'i-heroicons-bolt'
    case 'Agent':
      return 'i-heroicons-cpu-chip'
    default:
      return 'i-heroicons-wrench'
  }
}

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

async function loadMessages() {
  if (!props.session) return
  messages.value = await getSessionMessages(
    props.laneId,
    props.session.sessionId
  )
  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  const last = chatContainer.value?.lastElementChild
  if (last) {
    last.scrollIntoView({ block: 'end', behavior: 'instant' })
  }
}

function startPolling() {
  stopPolling()
  if (props.session?.status !== 'running') return
  pollTimer = setInterval(loadMessages, 3000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

watch(
  () => [props.open, props.session?.sessionId],
  async ([isOpen]) => {
    stopPolling()
    if (!isOpen || !props.session) {
      messages.value = []
      return
    }
    loading.value = true
    await loadMessages()
    loading.value = false
    startPolling()
  },
  { immediate: true }
)

onUnmounted(() => stopPolling())
</script>
