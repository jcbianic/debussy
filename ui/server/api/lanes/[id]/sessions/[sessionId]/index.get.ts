import { readSession } from '../../../../../utils/dispatch-store'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const sessionId = getRouterParam(event, 'sessionId')
  if (!id || !sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing parameters' })
  }

  const session = await readSession(id, sessionId)
  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  return session
})
