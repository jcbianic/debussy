import { getWorkflows } from '../../utils/services'

export default defineEventHandler((event) => {
  const sessionId = event.context.params?.sessionId

  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID required' })
  }

  const workflows = getWorkflows(sessionId)

  if (workflows === null) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  return { workflows }
})
