<template>
  <div ref="terminalEl" class="terminal-container"></div>
</template>

<script setup lang="ts">
const terminalEl = ref<HTMLElement>()
let terminal: any = null
let ws: WebSocket | null = null
let fitAddon: any = null

onMounted(async () => {
  const { Terminal } = await import('@xterm/xterm')
  const { FitAddon } = await import('@xterm/addon-fit')

  fitAddon = new FitAddon()
  terminal = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    scrollback: 10000,
    scrollSensitivity: 1,
    fastScrollSensitivity: 10,
    scrollOnUserInput: true,
    mouseEvents: false,
    theme: {
      background: '#1a1b26',
      foreground: '#c0caf5',
      cursor: '#c0caf5',
      selectionBackground: '#33467c',
    },
  })

  terminal.loadAddon(fitAddon)
  terminal.open(terminalEl.value!)
  fitAddon.fit()

  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${proto}//${location.host}/_ws`)

  ws.onopen = () => {
    const route = useRoute()
    const sessionId = route.query.sessionId as string
    ws!.send(JSON.stringify({ type: 'init', sessionId, cols: terminal.cols, rows: terminal.rows }))
  }

  ws.onmessage = (event) => {
    terminal.write(event.data)
  }

  ws.onerror = () => {
    terminal.write('\r\n\x1b[31mWebSocket connection error\x1b[0m\r\n')
  }

  ws.onclose = () => {
    terminal.write('\r\n\x1b[33mConnection closed\x1b[0m\r\n')
  }

  terminal.onData((data: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  })

  // Prevent scroll events from bubbling to parent containers
  const viewport = terminalEl.value?.querySelector('.xterm-viewport')
  if (viewport) {
    viewport.addEventListener('wheel', (e: WheelEvent) => {
      e.stopPropagation()
    }, { capture: false, passive: true })
  }

  const handleResize = () => {
    fitAddon.fit()
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'resize', cols: terminal.cols, rows: terminal.rows }))
    }
  }

  window.addEventListener('resize', handleResize)
  const ro = new ResizeObserver(handleResize)
  ro.observe(terminalEl.value!)
})

onUnmounted(() => {
  ws?.close()
  terminal?.dispose()
})
</script>

<style scoped>
@import '@xterm/xterm/css/xterm.css';

.terminal-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.xterm) {
  flex: 1;
  width: 100%;
  padding: 8px;
  overflow: hidden;
}

:deep(.xterm-viewport) {
  overflow-y: scroll !important;
  overscroll-behavior: contain;
  margin-top: auto;
}

:deep(.xterm-screen) {
  width: 100%;
}
</style>
