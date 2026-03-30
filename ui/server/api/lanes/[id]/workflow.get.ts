import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  parseLanesFromWorktrees,
  stateJsonToWorkflowRun,
  workflowYamlToSkeleton,
} from '../../../utils/lanes'
import { resolveRecordId } from '../../../utils/lane-store'
import { resolveDebussyPath } from '../../../utils/debussy'
import type { Lane } from '../../../utils/lanes'

const execAsync = promisify(exec)

async function getRepoRoot(): Promise<string> {
  const { stdout } = await execAsync('git rev-parse --show-toplevel')
  return stdout.trim()
}

async function getCurrentBranch(): Promise<string | undefined> {
  try {
    const { stdout } = await execAsync('git symbolic-ref --short HEAD')
    return stdout.trim()
  } catch {
    return undefined
  }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  let stdout = ''
  try {
    const result = await execAsync('git worktree list --porcelain')
    stdout = result.stdout
  } catch {
    return null
  }

  const repoRoot = await getRepoRoot()
  const lanes = parseLanesFromWorktrees(stdout, repoRoot)
  const lane = lanes.find((l: Lane) => l.id === id)
  if (!lane) return null

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
  const branch = await getCurrentBranch()
  const recordId = await resolveRecordId(id ?? '', branch)
  const laneDir = await resolveDebussyPath('.debussy', 'lanes', recordId)

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
