import chokidar from 'chokidar'
import { createEventStream } from 'h3'

export default defineEventHandler(async (event) => {
  const stream = createEventStream(event)

  const strategyPath = await resolveStrategyPath()
  const watcher = chokidar.watch(strategyPath, { ignoreInitial: true })

  watcher.on('all', (eventName, filePath) => {
    stream.push(JSON.stringify({ event: eventName, path: filePath }))
  })

  stream.onClosed(async () => {
    await watcher.close()
  })

  return stream.send()
})
