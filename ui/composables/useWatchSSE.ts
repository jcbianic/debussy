/**
 * Connects to /api/watch SSE and calls onEvent on every
 * file-system change. Auto-reconnects if the connection drops.
 */
export function useWatchSSE(onEvent: () => void) {
  let es: EventSource | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  function connect() {
    es = new EventSource('/api/watch')
    es.onmessage = () => onEvent()
    es.onerror = () => {
      if (es?.readyState === EventSource.CLOSED) {
        es = null
        timer = setTimeout(connect, 2000)
      }
    }
  }

  onMounted(() => connect())

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
    es?.close()
    es = null
  })
}
