import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseLanesFromWorktrees } from '../../utils/lanes'
import type { Lane } from '../../utils/lanes'
import type { Review, Item } from '../../utils/reviews'
import { resolveReviewsPath, scanReviews } from '../../utils/reviews'

const execAsync = promisify(exec)

export default defineEventHandler(async () => {
  let stdout = ''
  try {
    const result = await execAsync('git worktree list --porcelain')
    stdout = result.stdout
  } catch {
    return []
  }

  const lanes = parseLanesFromWorktrees(stdout, process.cwd())

  // Attach pending review groups from .workflow-runs/ for each lane
  await Promise.all(
    lanes.map(async (lane: Lane) => {
      const runsDir = path.join(lane.path, '.workflow-runs')
      try {
        const entries = await readdir(runsDir, { withFileTypes: true })
        const runDirs = entries
          .filter((e) => e.isDirectory())
          .map((e) => e.name)

        for (const runDir of runDirs) {
          const statePath = path.join(runsDir, runDir, 'state.json')
          try {
            const raw = JSON.parse(await readFile(statePath, 'utf8'))
            const steps = raw.steps as
              | Record<string, Record<string, unknown>>
              | undefined
            if (!steps) continue

            // Find steps with pending_review status
            const pendingSteps = Object.entries(steps).filter(
              ([, step]) => step.status === 'pending_review'
            )
            if (pendingSteps.length === 0) continue

            for (const [stepKey, step] of pendingSteps) {
              const items: Item[] = []

              // Look for cards.json files in step artifacts
              const artifacts = step.artifacts as
                | Record<string, { path: string }>
                | undefined
              if (artifacts) {
                for (const artifact of Object.values(artifacts)) {
                  const cardsPath = artifact.path + '.cards.json'
                  const resolvedCards = path.resolve(cardsPath)
                  const resolvedLane = path.resolve(lane.path)
                  if (!resolvedCards.startsWith(resolvedLane + path.sep))
                    continue
                  try {
                    const cards = JSON.parse(
                      await readFile(cardsPath, 'utf8')
                    ) as Array<{
                      title: string
                      abstract: string
                      severity: string
                      type: string
                    }>
                    items.push(
                      ...cards.map((card, idx) => ({
                        id: `${runDir}-${stepKey}-${idx}`,
                        title: card.title,
                        subtitle: card.severity,
                        iterations: [
                          {
                            number: 1,
                            proposedAt:
                              typeof raw.created_at === 'string'
                                ? raw.created_at
                                : '',
                            content: card.abstract,
                          },
                        ],
                      }))
                    )
                  } catch {
                    // no cards.json — skip
                  }
                }
              }

              const review: Review = {
                id: `${runDir}-${stepKey}`,
                title: `${runDir} — ${String(step.name ?? stepKey)}`,
                icon: 'i-heroicons-document-text',
                source: String(raw.workflow ?? runDir),
                type: 'workflow',
                createdAt:
                  typeof raw.created_at === 'string' ? raw.created_at : '',
                items,
              }
              lane.reviews.push(review)
            }
          } catch {
            // state.json missing or invalid — skip
          }
        }
      } catch {
        // no .workflow-runs/ directory — skip
      }
    })
  )

  // Attach pending reviews from .debussy/reviews/ to the root lane
  try {
    const reviewsDir = await resolveReviewsPath()
    const reviews = await scanReviews(reviewsDir)
    const rootLane = lanes.find((l) => l.id === 'root') ?? lanes[0]
    if (rootLane) {
      rootLane.reviews.push(...reviews)
    }
  } catch {
    // .debussy/reviews/ missing — skip
  }

  return lanes
})
