/**
 * Phase computation engine for IIKit workflow status.
 *
 * Ported from IIKit's computePipelineState() (pipeline.js) to TypeScript.
 * Produces identical results as the IIKit dashboard (SC-004).
 *
 * T006: parseTasks(), parseChecklists(), parseConstitutionTDD()
 * T007: computePipelineState()
 * T008: listFeatures()
 */

import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type { Feature, Phase, PhaseId, PhaseStatus } from './types'

// ---------------------------------------------------------------------------
// T006: Helper parsers
// ---------------------------------------------------------------------------

interface Task {
  id: string
  checked: boolean
}

interface ChecklistResult {
  total: number
  checked: number
}

/**
 * Parse task checkbox items from tasks.md content.
 * Pattern: - [x/space] TXXX [P]? [USy]? Description
 * Also handles T-B bugfix tasks.
 */
export function parseTasks(content: string): Task[] {
  if (!content || typeof content !== 'string') return []

  const regex = /- \[([ x])\] (T(?:-B)?\d+)\s+(?:\[P\]\s*)?(?:\[(US\d+|BUG-\d+)\]\s*)?(.*)/g
  const tasks: Task[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    tasks.push({
      id: match[2],
      checked: match[1] === 'x',
    })
  }

  return tasks
}

/**
 * Parse checklist files in a directory and return aggregate completion counts.
 * Excludes requirements.md unless includeRequirements is true.
 */
export function parseChecklists(
  checklistDir: string,
  options: { includeRequirements: boolean },
): ChecklistResult {
  const result: ChecklistResult = { total: 0, checked: 0 }

  if (!existsSync(checklistDir)) return result

  const allFiles = readdirSync(checklistDir).filter(f => f.endsWith('.md'))
  const files = allFiles.filter(f => f !== 'requirements.md' || options.includeRequirements)

  if (files.length === 0) return result

  for (const file of files) {
    const content = readFileSync(join(checklistDir, file), 'utf-8')
    for (const line of content.split('\n')) {
      if (/- \[x\]/i.test(line)) {
        result.total++
        result.checked++
      } else if (/- \[ \]/.test(line)) {
        result.total++
      }
    }
  }

  return result
}

/**
 * Check whether CONSTITUTION.md mandates TDD.
 * Returns true if it contains TDD terms AND a mandatory keyword.
 */
export function parseConstitutionTDD(constitutionPath: string): boolean {
  if (!existsSync(constitutionPath)) return false

  const content = readFileSync(constitutionPath, 'utf-8').toLowerCase()
  const hasTDDTerms = /\btdd\b|\bbdd\b|test-first|red-green-refactor|write tests before|tests must be written before|test-driven|behavior-driven|behaviour-driven/.test(content)
  const hasMandatory = /\bmust\b|\brequired\b|non-negotiable/.test(content)

  return hasTDDTerms && hasMandatory
}

// ---------------------------------------------------------------------------
// T007: computePipelineState()
// ---------------------------------------------------------------------------

/**
 * Compute the IIKit pipeline phase status for a feature by reading
 * filesystem artifacts. Returns 8 phases in fixed order.
 *
 * Matches IIKit's computePipelineState() logic exactly (SC-004).
 * Progress is returned as a number 0-100 (not the "60%" string format).
 */
export function computePipelineState(
  projectPath: string,
  featureId: string,
): { phases: Phase[] } {
  const featureDir = join(projectPath, 'specs', featureId)
  const constitutionPath = join(projectPath, 'CONSTITUTION.md')
  const specPath = join(featureDir, 'spec.md')
  const planPath = join(featureDir, 'plan.md')
  const checklistDir = join(featureDir, 'checklists')
  const tasksPath = join(featureDir, 'tasks.md')
  const analysisPath = join(featureDir, 'analysis.md')
  const featuresDir = join(featureDir, 'tests', 'features')

  const constitutionExists = existsSync(constitutionPath)
  const specExists = existsSync(specPath)
  const planExists = existsSync(planPath)
  const tasksExists = existsSync(tasksPath)
  const analysisExists = existsSync(analysisPath)

  // Check for .feature files (testify phase complete)
  const testSpecsExists = existsSync(featuresDir)
    && readdirSync(featuresDir).some(f => f.endsWith('.feature'))

  // Parse tasks for implement progress
  const tasksContent = tasksExists ? readFileSync(tasksPath, 'utf-8') : ''
  const tasks = parseTasks(tasksContent)
  const checkedCount = tasks.filter(t => t.checked).length
  const totalCount = tasks.length

  // Read context.json for phase metadata
  const contextPath = join(projectPath, '.specify', 'context.json')
  let ctx: Record<string, unknown> = {}
  if (existsSync(contextPath)) {
    try {
      ctx = JSON.parse(readFileSync(contextPath, 'utf-8'))
    } catch {
      // malformed context.json — graceful fallback
    }
  }

  // TDD requirement check
  let tddRequired = false
  if (ctx.tdd_determination) {
    tddRequired = ctx.tdd_determination === 'mandatory'
  } else {
    tddRequired = constitutionExists ? parseConstitutionTDD(constitutionPath) : false
  }

  // Checklist phase was run (not just requirements.md from specify)
  const checklistReviewed = !!ctx.checklist_reviewed_at

  // Parse checklists
  const checklistStatus = parseChecklists(checklistDir, { includeRequirements: checklistReviewed })

  // Implement phase status and progress
  const implementStatus: PhaseStatus =
    totalCount === 0 || checkedCount === 0
      ? 'not_started'
      : checkedCount === totalCount
        ? 'complete'
        : 'in_progress'

  const implementProgress: number | null =
    totalCount > 0 && checkedCount > 0
      ? Math.round((checkedCount / totalCount) * 100)
      : null

  // Checklist phase status and progress
  const checklistPhaseStatus: PhaseStatus =
    checklistStatus.total === 0
      ? 'not_started'
      : checklistStatus.checked === checklistStatus.total
        ? 'complete'
        : 'in_progress'

  const checklistProgress: number | null =
    checklistStatus.total > 0
      ? Math.round((checklistStatus.checked / checklistStatus.total) * 100)
      : null

  // Testify status
  const testifyStatus: PhaseStatus = testSpecsExists
    ? 'complete'
    : (!tddRequired && planExists ? 'skipped' : 'not_started')

  const phases: Phase[] = [
    {
      id: 'constitution' as PhaseId,
      name: 'Constitution',
      status: constitutionExists ? 'complete' : 'not_started',
      progress: null,
      optional: false,
    },
    {
      id: 'spec' as PhaseId,
      name: 'Spec',
      status: specExists ? 'complete' : 'not_started',
      progress: null,
      optional: false,
    },
    {
      id: 'plan' as PhaseId,
      name: 'Plan',
      status: planExists ? 'complete' : 'not_started',
      progress: null,
      optional: false,
    },
    {
      id: 'checklist' as PhaseId,
      name: 'Checklist',
      status: checklistPhaseStatus,
      progress: checklistProgress,
      optional: false,
    },
    {
      id: 'testify' as PhaseId,
      name: 'Testify',
      status: testifyStatus,
      progress: null,
      optional: !tddRequired,
    },
    {
      id: 'tasks' as PhaseId,
      name: 'Tasks',
      status: tasksExists ? 'complete' : 'not_started',
      progress: null,
      optional: false,
    },
    {
      id: 'analyze' as PhaseId,
      name: 'Analyze',
      status: analysisExists ? 'complete' : 'not_started',
      progress: null,
      optional: false,
    },
    {
      id: 'implement' as PhaseId,
      name: 'Implement',
      status: implementStatus,
      progress: implementProgress,
      optional: false,
    },
  ]

  return { phases }
}

// ---------------------------------------------------------------------------
// T008: listFeatures()
// ---------------------------------------------------------------------------

/**
 * List all valid feature directories under specs/.
 * A directory is valid if it contains spec.md.
 * Display name is derived by stripping leading digits/dashes and title-casing.
 */
export function listFeatures(projectPath: string): Feature[] {
  const specsDir = join(projectPath, 'specs')

  if (!existsSync(specsDir)) return []

  const entries = readdirSync(specsDir, { withFileTypes: true })
  const features: Feature[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const specPath = join(specsDir, entry.name, 'spec.md')
    if (!existsSync(specPath)) continue

    features.push({
      id: entry.name,
      name: deriveFeatureName(entry.name),
    })
  }

  return features.sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Derive a human-readable display name from a feature directory name.
 * Example: "001-workflow-phase-status" → "Workflow Phase Status"
 */
function deriveFeatureName(dirName: string): string {
  // Strip leading numeric prefix (e.g., "001-")
  const stripped = dirName.replace(/^\d+-/, '')
  // Split by dashes, title-case each word
  return stripped
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
