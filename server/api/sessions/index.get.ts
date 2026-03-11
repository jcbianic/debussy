import { getSessions } from '../../utils/services'

export default defineEventHandler((event) => {
  const query = getQuery(event) as { skip?: string; limit?: string; status?: string }

  return getSessions({
    skip: query.skip ? parseInt(query.skip, 10) : 0,
    limit: query.limit ? parseInt(query.limit, 10) : 20,
    status: query.status,
  })
})
