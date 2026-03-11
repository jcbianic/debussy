import { existsSync } from 'fs'
import { join, resolve } from 'path'
import { computePipelineState } from '../utils/pipeline'
import type { PhasesResponse } from '../utils/types'

/**
 * Structured error for API error responses.
 */
export class PhasesApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 400 | 404 | 500,
  ) {
    super(message)
    this.name = 'PhasesApiError'
  }
}

/**
 * Testable core logic for the phases endpoint.
 * Throws PhasesApiError for 400/404 conditions.
 */
export function getPhases(projectRoot: string, featureId: string): PhasesResponse {
  if (!featureId) {
    throw new PhasesApiError('Missing required query parameter: feature', 400)
  }

  const featureDir = join(projectRoot, 'specs', featureId)
  if (!existsSync(featureDir)) {
    throw new PhasesApiError(`Feature not found: ${featureId}`, 404)
  }

  const { phases } = computePipelineState(projectRoot, featureId)
  return { feature: featureId, phases }
}

export default defineEventHandler(async (event): Promise<PhasesResponse> => {
  const projectRoot = process.env.PROJECT_ROOT || resolve(process.cwd(), '..')
  const query = getQuery(event)
  const featureId = (query.feature as string) ?? ''

  try {
    return getPhases(projectRoot, featureId)
  } catch (e) {
    if (e instanceof PhasesApiError) {
      throw createError({ statusCode: e.statusCode, statusMessage: e.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
