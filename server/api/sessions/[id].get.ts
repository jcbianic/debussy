import { getSession } from '../../utils/services'

export default defineEventHandler((event) => {
  const id = event.context.params?.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID required' })
  }

  const session = getSession(id)

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  return { session }
})
