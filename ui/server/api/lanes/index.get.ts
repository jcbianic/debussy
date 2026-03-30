import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { readdir, readFile, access } from 'node:fs/promises'
import path from 'node:path'
import { parseLanesFromWorktrees } from '../../utils/lanes'
import type { Lane } from '../../utils/lanes'
import type { Item } from '../../utils/reviews'
import {
  resolveReviewsPath,
  scanReviews,
  createReview,
} from '../../utils/reviews'
import { listLaneRecords } from '../../utils/lane-store'

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

  // Merge lane records with worktree data
  const records = await listLaneRecords()
  const recordById = new Map(records.map((r) => [r.id, r]))

  for (const lane of lanes) {
    // Match by branch name since worktree IDs are path basenames
    const record = records.find((r) => r.branch === lane.branch)
    if (record) {
      lane.state = record.state
      lane.issueNumber = record.issueNumber
      lane.prNumber = record.prNumber
      lane.intent = record.issueTitle
      recordById.delete(record.id)
    }
  }

  // Add orphaned lane records (worktree removed but record still exists)
  for (const record of recordById.values()) {
    lanes.push({
      id: record.id,
      branch: record.branch,
      path: record.worktreePath,
      isActive: false,
      state: record.state,
      issueNumber: record.issueNumber,
      prNumber: record.prNumber,
      intent: record.issueTitle,
      orphaned: true,
      reviews: [],
    })
  }

  // Resolve reviews path once for both workflow persistence and global scan
  const reviewsDir = await resolveReviewsPath()
  const workflowReviewIds = new Set<string>()

  // Attach pending review groups from .workflow-runs/ for each lane.
  // Persist to .debussy/reviews/ on first encounter so the submit endpoint
  // can find them; reload from disk on subsequent requests to preserve feedback.
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
              const reviewId = `${runDir}-${stepKey}`
              workflowReviewIds.add(reviewId)

              const reviewMeta = {
                id: reviewId,
                title: `${runDir} — ${String(step.name ?? stepKey)}`,
                icon: 'i-heroicons-document-text',
                source: String(raw.workflow ?? runDir),
                type: 'workflow',
                createdAt:
                  typeof raw.created_at === 'string' ? raw.created_at : '',
              }

              // Check if already persisted in .debussy/reviews/
              const reviewMetaPath = path.join(
                reviewsDir,
                reviewId,
                'review.json'
              )
              let persisted = false
              try {
                await access(reviewMetaPath)
                persisted = true
              } catch {
                // not persisted yet
              }

              if (persisted) {
                // Load items from disk — preserves feedback from prior submissions
                const existingItemsDir = path.join(
                  reviewsDir,
                  reviewId,
                  'items'
                )
                const diskItems: Item[] = []
                try {
                  const files = await readdir(existingItemsDir)
                  for (const f of files) {
                    if (!f.endsWith('.json')) continue
                    diskItems.push(
                      JSON.parse(
                        await readFile(path.join(existingItemsDir, f), 'utf8')
                      )
                    )
                  }
                } catch {
                  // items dir missing — treat as empty
                }

                if (diskItems.length > 0) {
                  lane.reviews.push({
                    ...reviewMeta,
                    items: diskItems,
                  })
                  continue
                }
              }

              // Build items from cards (first time or empty persisted review)
              const items: Item[] = []
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

              if (items.length > 0) {
                // Persist to .debussy/reviews/ so the submit endpoint can find it
                try {
                  await createReview(
                    reviewsDir,
                    reviewMeta,
                    items.map((i) => ({
                      id: i.id,
                      title: i.title,
                      subtitle: i.subtitle,
                      content: i.iterations[0]?.content ?? '',
                    }))
                  )
                } catch {
                  // best-effort — review will still display, submit may fail
                }
              }

              lane.reviews.push({ ...reviewMeta, items })
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

  // Attach pending reviews from .debussy/reviews/ to the root lane,
  // excluding any already attached from workflow scanning above
  try {
    const globalReviews = await scanReviews(reviewsDir)
    const nonWorkflow = globalReviews.filter(
      (r) => !workflowReviewIds.has(r.id)
    )
    const rootLane = lanes.find((l) => l.id === 'root') ?? lanes[0]
    if (rootLane && nonWorkflow.length > 0) {
      rootLane.reviews.push(...nonWorkflow)
    }
  } catch {
    // .debussy/reviews/ missing — skip
  }

  return lanes
})
