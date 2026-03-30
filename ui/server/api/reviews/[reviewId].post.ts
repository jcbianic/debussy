import {
  resolveReviewsPath,
  writeReviewDecision,
  assertSafeSegment,
  assertSafeItemId,
} from '../../utils/reviews'

const VALID_ACTIONS = new Set([
  'approved',
  'changes-requested',
  'rejected',
] as const)

export default defineEventHandler(async (event) => {
  const reviewId = getRouterParam(event, 'reviewId')
  if (!reviewId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing reviewId' })
  }

  try {
    assertSafeSegment(reviewId, 'reviewId')
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid reviewId' })
  }

  const body = await readBody<{
    itemId: string
    action: string
    comment?: string
  }>(event)

  if (!body?.itemId || !body?.action) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing itemId or action',
    })
  }

  if (
    !VALID_ACTIONS.has(
      body.action as typeof VALID_ACTIONS extends Set<infer T> ? T : never
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid action',
    })
  }

  try {
    assertSafeItemId(body.itemId, 'itemId')
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid itemId' })
  }

  if (body.comment && body.comment.length > 10_000) {
    throw createError({ statusCode: 400, statusMessage: 'Comment too long' })
  }

  const reviewsDir = await resolveReviewsPath()
  const result = await writeReviewDecision(reviewsDir, reviewId, body.itemId, {
    decision: body.action as 'approved' | 'changes-requested' | 'rejected',
    comment: body.comment || undefined,
    decidedAt: new Date().toISOString(),
  })

  if (!result.ok) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    })
  }

  return result
})
