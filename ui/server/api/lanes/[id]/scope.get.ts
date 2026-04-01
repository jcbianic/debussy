import { readScopeMd, resolveRecordId } from '../../../utils/lane-store'

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing lane id',
    })
  }

  const recordId = await resolveRecordId(id)
  const content = await readScopeMd(recordId)
  return { content }
})
