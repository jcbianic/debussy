<template>
  <div ref="containerEl" class="tmux-terminal">
    <div v-if="!connected && !error" class="overlay">Connecting...</div>
    <div v-if="error" class="overlay error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  session: string
}>()

const containerEl = ref<HTMLElement>()
const connected = ref(false)
const error = ref('')

let terminal: any = null
let ws: WebSocket | null = null
let fitAddon: any = null
let ro: ResizeObserver | null = null
let resizeHandler: (() => void) | null = null

function setup() {
  teardown()
  if (!containerEl.value || !props.session) return

  import('@xterm/xterm').then(({ Terminal }) => {
    import('@xterm/addon-fit').then(({ FitAddon }) => {
      if (!containerEl.value) return

      fitAddon = new FitAddon()
      terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        scrollback: 10000,
        mouseEvents: false,
        theme: {
          background: '#1a1b26',
          foreground: '#c0caf5',
          cursor: '#c0caf5',
          selectionBackground: '#33467c',
        },
      })

      terminal.loadAddon(fitAddon)
      terminal.open(containerEl.value)
      fitAddon.fit()

      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
      ws = new WebSocket(`${proto}//${location.host}/_ws`)

      ws.onopen = () => {
        connected.value = true
        error.value = ''
        ws!.send(JSON.stringify({
          type: 'init',
          tmuxSession: props.session,
          cols: terminal.cols,
          rows: terminal.rows,
        }))
      }

      ws.onmessage = (event) => terminal.write(event.data)

      ws.onerror = () => {
        error.value = 'WebSocket error'
      }

      ws.onclose = () => {
        connected.value = false
      }

      terminal.onData((data: string) => {
        if (ws?.readyState === WebSocket.OPEN) ws.send(data)
      })

      // Prevent scroll events from bubbling to parent containers
      const viewport = containerEl.value?.querySelector('.xterm-viewport')
      if (viewport) {
        viewport.addEventListener('wheel', (e: WheelEvent) => {
          e.stopPropagation()
        }, { capture: false, passive: true })
      }

      resizeHandler = () => {
        fitAddon?.fit()
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols: terminal.cols, rows: terminal.rows }))
        }
      }

      window.addEventListener('resize', resizeHandler)
      ro = new ResizeObserver(resizeHandler)
      ro.observe(containerEl.value)
    })
  })
}

function teardown() {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  ro?.disconnect()
  ro = null
  ws?.close()
  ws = null
  terminal?.dispose()
  terminal = null
  fitAddon = null
  connected.value = false
  error.value = ''
}

// React to session prop changes
watch(() => props.session, () => {
  nextTick(() => setup())
})

onMounted(() => setup())
onUnmounted(() => teardown())
</script>

<style scoped>
@import '@xterm/xterm/css/xterm.css';

.tmux-terminal {
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 13px;
  z-index: 1;
  pointer-events: none;
}

.overlay.error {
  color: #f87171;
}

:deep(.xterm) {
  flex: 1;
  width: 100%;
  padding: 8px;
  overflow: hidden;
}

:deep(.xterm-viewport) {
  overflow-y: scroll !important;
}

:deep(.xterm-screen) {
  width: 100%;
}
</style>
