import chokidar from 'chokidar'
import { createEventStream } from 'h3'

export default defineEventHandler(async (event) => {
  const stream = createEventStream(event)

  const watchPaths = await Promise.all([
    resolveStrategyPath(),
    resolveDebussyPath('.debussy', 'product'),
    resolveDebussyPath('docs', 'decisions'),
    resolveDebussyPath('docs', 'architecture'),
    resolveDebussyPath('specs'),
    resolveDebussyPath('.workflow-runs'),
    resolveDebussyPath('.debussy', 'reviews'),
    resolveDebussyPath('.debussy', 'usage'),
  ])

  const watcher = chokidar.watch(watchPaths, { ignoreInitial: true })

  watcher.on('error', (err) => {
    console.warn('[watch] chokidar error (non-fatal):', err.message)
  })

  watcher.on('all', (eventName, filePath) => {
    stream.push(JSON.stringify({ event: eventName, path: filePath }))
  })

  stream.onClosed(async () => {
    await watcher.close()
  })

  return stream.send()
})
