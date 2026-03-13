import { getSessions } from '../../utils/services'

export default defineEventHandler((event) => {
  const query = getQuery(event) as { skip?: string; limit?: string; status?: string }

  const skip = query.skip ? parseInt(query.skip, 10) : 0
  const limit = query.limit ? parseInt(query.limit, 10) : 20

  if (isNaN(skip) || isNaN(limit)) {
    throw createError({ statusCode: 400, statusMessage: 'skip and limit must be numbers' })
  }

  return getSessions({ skip, limit, status: query.status })
})
