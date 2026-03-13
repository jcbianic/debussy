import { createSession } from '../../utils/services'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { label?: string }

  if (body.label && body.label.length > 256) {
    throw createError({
      statusCode: 400,
      statusMessage: 'label must be max 256 characters',
    })
  }

  const session = createSession(body.label)
  setResponseStatus(event, 201)
  return { session }
})
