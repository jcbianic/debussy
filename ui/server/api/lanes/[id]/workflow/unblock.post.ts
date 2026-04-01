import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fetchLanes } from '../../../../utils/lanes'
import { resolveDebussyPath } from '../../../../utils/debussy'

/**
 * Determine the aggregate decision from a review response.
 * Priority: rejected > changes-requested > approved
 */
function aggregateDecision(
  decisions: Record<string, { action: string; comment?: string }>
): { decision: string; comments: string } {
  const entries = Object.values(decisions)
  const rejected = entries.filter((e) => e.action === 'rejected')
  const changesRequested = entries.filter(
    (e) => e.action === 'changes-requested'
  )

  if (rejected.length > 0) {
    return {
      decision: 'rejected',
      comments: rejected
        .map((e) => e.comment)
        .filter(Boolean)
        .join('\n'),
    }
  }
  if (changesRequested.length > 0) {
    return {
      decision: 'revision_requested',
      comments: changesRequested
        .map((e) => e.comment)
        .filter(Boolean)
        .join('\n'),
    }
  }
  return { decision: 'approved', comments: '' }
}

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing lane id' })
  }

  // Find the lane
  const lanes = await fetchLanes()
  const lane = lanes.find((l) => l.id === id)
  if (!lane || !lane.checkedOutIn) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lane ${id} not found or not checked out`,
    })
  }

  // Find the most recent workflow run
  const runsDir = path.join(lane.path, '.workflow-runs')
  let statePath: string | null = null
  let stateData: Record<string, unknown> | null = null

  try {
    const entries = await readdir(runsDir, { withFileTypes: true })
    const runDirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
      .reverse()

    for (const runDir of runDirs) {
      const candidate = path.join(runsDir, runDir, 'state.json')
      try {
        stateData = JSON.parse(await readFile(candidate, 'utf8'))
        statePath = candidate
        break
      } catch {
        continue
      }
    }
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'No workflow runs found',
    })
  }

  if (!stateData || !statePath) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No workflow state found',
    })
  }

  // Find the current step in pending_review
  const currentStepKey = stateData.current_step as string | undefined
  const steps = stateData.steps as
    | Record<string, Record<string, unknown>>
    | undefined
  if (!currentStepKey || !steps || !steps[currentStepKey]) {
    throw createError({
      statusCode: 422,
      statusMessage: 'No current step found in workflow state',
    })
  }

  const step = steps[currentStepKey]!
  if (step.status !== 'pending_review') {
    throw createError({
      statusCode: 422,
      statusMessage: `Step "${currentStepKey}" is not pending review (status: ${step.status})`,
    })
  }

  // Build review ID and look for response
  const runId = stateData.run_id as string
  const reviewId = `${runId}-${currentStepKey}`
  const reviewResponsePath = await resolveDebussyPath(
    '.debussy',
    'reviews',
    reviewId,
    'response.json'
  )

  let decision: string
  let comments: string

  try {
    const responseData = JSON.parse(await readFile(reviewResponsePath, 'utf8'))
    const result = aggregateDecision(responseData.decisions ?? {})
    decision = result.decision
    comments = result.comments
  } catch {
    // No response file — force-approve (user clicked Unblock explicitly)
    decision = 'approved'
    comments = ''
  }

  // Update state.json
  const now = new Date().toISOString()
  const review = step.review as Record<string, unknown> | undefined

  // Push current review to history if it had a previous decision
  if (review?.decision) {
    const history = (step.review_history as unknown[]) ?? []
    history.push({
      ...review,
      iteration: history.length + 1,
    })
    step.review_history = history
  }

  // Update review
  step.review = {
    ...(review ?? {}),
    status: decision,
    decision,
    comments: comments || null,
    decided_at: now,
  }

  step.status = decision
  stateData.updated_at = now

  // If approved, advance current_step to next
  if (decision === 'approved') {
    const stepKeys = Object.keys(steps)
    const currentIndex = stepKeys.indexOf(currentStepKey)
    const nextKey = stepKeys[currentIndex + 1]
    if (nextKey) {
      stateData.current_step = nextKey
    } else {
      stateData.status = 'done'
    }
  }

  await writeFile(statePath, JSON.stringify(stateData, null, 2) + '\n')

  return { decision, step: currentStepKey }
})
