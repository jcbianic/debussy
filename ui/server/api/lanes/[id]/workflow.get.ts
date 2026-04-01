import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  fetchLanes,
  stateJsonToWorkflowRun,
  workflowYamlToSkeleton,
} from '../../../utils/lanes'
import { resolveRecordId } from '../../../utils/lane-store'
import { resolveDebussyPath } from '../../../utils/debussy'

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '')

  let lanes
  try {
    lanes = await fetchLanes()
  } catch {
    return null
  }

  const lane = lanes.find((l) => l.id === id)
  if (!lane) return null

  // Workflow runs only exist in checked-out worktrees
  if (!lane.checkedOutIn) return null

  // Try active workflow runs first
  const runsDir = path.join(lane.path, '.workflow-runs')
  try {
    const entries = await readdir(runsDir, { withFileTypes: true })
    const runDirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
      .reverse() // most recent first

    for (const runDir of runDirs) {
      const statePath = path.join(runsDir, runDir, 'state.json')
      try {
        const raw = JSON.parse(await readFile(statePath, 'utf8'))
        const run = stateJsonToWorkflowRun(raw)
        if (run) return run
      } catch {
        continue
      }
    }
  } catch {
    // no .workflow-runs/ — no active run
  }

  // No active run — try to build a skeleton from the workflow YAML
  const recordId = await resolveRecordId(id)
  const laneDir = await resolveDebussyPath('.debussy', 'lanes', recordId)
  const repoRoot = await resolveDebussyPath()

  let workflowPath: string | null = null
  try {
    const raw = JSON.parse(
      await readFile(path.join(laneDir, 'work-request.json'), 'utf8')
    )
    if (typeof raw.workflow === 'string') {
      workflowPath = raw.workflow
    }
  } catch {
    // no work-request — use default
    workflowPath = '.claude/workflows/rpikit-complete.yml'
  }

  if (workflowPath) {
    try {
      const fullPath = path.join(repoRoot, workflowPath)
      const yamlContent = await readFile(fullPath, 'utf8')
      return workflowYamlToSkeleton(yamlContent, workflowPath)
    } catch {
      // workflow YAML not found
    }
  }

  return null
})
