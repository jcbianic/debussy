import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  parseLanesFromWorktrees,
  stateJsonToWorkflowRun,
} from '../../../utils/lanes'
import type { Lane } from '../../../utils/lanes'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  let stdout = ''
  try {
    const result = await execAsync('git worktree list --porcelain')
    stdout = result.stdout
  } catch {
    return null
  }

  const lanes = parseLanesFromWorktrees(stdout, process.cwd())
  const lane = lanes.find((l: Lane) => l.id === id)
  if (!lane) return null

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

  return null
})
