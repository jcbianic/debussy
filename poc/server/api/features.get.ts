import { resolve } from 'path'
import { listFeatures as listFeaturesImpl } from '../utils/pipeline'
import type { FeaturesResponse } from '../utils/types'

/**
 * Testable wrapper for use in integration tests.
 * Returns { features } response shape.
 */
export function listFeatures(projectRoot: string): FeaturesResponse {
  return { features: listFeaturesImpl(projectRoot) }
}

export default defineEventHandler((): FeaturesResponse => {
  const projectRoot = process.env.PROJECT_ROOT || resolve(process.cwd(), '..')
  return listFeatures(projectRoot)
})
