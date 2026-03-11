import { createWorkflow } from '../../utils/services'

export default defineEventHandler(async (event) => {
  const sessionId = event.context.params?.sessionId

  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID required' })
  }

  const body = await readBody(event) as { phase: string; featureId?: string }

  if (!body.phase) {
    throw createError({ statusCode: 400, statusMessage: 'phase is required' })
  }

  try {
    const workflow = createWorkflow(sessionId, body.phase, body.featureId)

    if (!workflow) {
      throw createError({ statusCode: 404, statusMessage: 'Session not found' })
    }

    setResponseStatus(event, 201)
    return { workflow }
  } catch (err: any) {
    if (err.message?.includes('phase must be one of')) {
      throw createError({ statusCode: 400, statusMessage: err.message })
    }
    throw err
  }
})
