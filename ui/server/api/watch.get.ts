import path from 'node:path'
import chokidar from 'chokidar'
import { createEventStream } from 'h3'

export default defineEventHandler(async (event) => {
  const stream = createEventStream(event)

  const docsPath = path.resolve(process.cwd(), '..', 'docs', 'strategy')
  const watcher = chokidar.watch(docsPath, { ignoreInitial: true })

  watcher.on('all', (eventName, filePath) => {
    stream.push(JSON.stringify({ event: eventName, path: filePath }))
  })

  stream.onClosed(async () => {
    await watcher.close()
  })

  return stream.send()
})
