import { readdir, readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { resolveDebussyPath } from './debussy'

// ─── Path safety ────────────────────────────────────────────────────────────

const SAFE_SEGMENT = /^[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/

export function assertSafeSegment(segment: string, label: string): void {
  if (!SAFE_SEGMENT.test(segment)) {
    throw new Error(`Invalid ${label}: contains unsafe characters`)
  }
}

function assertInsideDir(child: string, parent: string): void {
  const resolved = path.resolve(child)
  const root = path.resolve(parent)
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error('Path escapes allowed directory')
  }
}

import type { Feedback, Item, Review } from '~/shared/types/reviews'

// ─── Storage paths ───────────────────────────────────────────────────────────

export async function resolveReviewsPath(): Promise<string> {
  return resolveDebussyPath('.debussy', 'reviews')
}

// ─── Scan ────────────────────────────────────────────────────────────────────

export async function scanReviews(reviewsDir: string): Promise<Review[]> {
  let entries: import('node:fs').Dirent[]
  try {
    entries = await readdir(reviewsDir, { withFileTypes: true })
  } catch {
    return []
  }

  const reviews: Review[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const reviewDir = path.join(reviewsDir, entry.name)
    const metaPath = path.join(reviewDir, 'review.json')

    try {
      const meta = JSON.parse(await readFile(metaPath, 'utf8')) as {
        id: string
        title: string
        icon?: string
        source: string
        type: string
        createdAt: string
      }

      // Read items
      const itemsDir = path.join(reviewDir, 'items')
      const items: Item[] = []
      try {
        const itemFiles = await readdir(itemsDir)
        for (const file of itemFiles) {
          if (!file.endsWith('.json')) continue
          const itemData = JSON.parse(
            await readFile(path.join(itemsDir, file), 'utf8')
          ) as Item
          items.push(itemData)
        }
      } catch {
        // no items directory — empty review
      }

      // Skip reviews where all items have final feedback (completed)
      const allDecided =
        items.length > 0 &&
        items.every((item) => {
          const last = item.iterations.at(-1)
          return last?.feedback != null
        })
      if (allDecided) continue

      reviews.push({
        id: meta.id,
        title: meta.title,
        icon: meta.icon ?? 'i-heroicons-inbox',
        source: meta.source,
        type: meta.type,
        createdAt: meta.createdAt,
        items,
      })
    } catch {
      // review.json missing or invalid — skip
    }
  }

  return reviews
}

// ─── Write decision ──────────────────────────────────────────────────────────

export async function writeReviewDecision(
  reviewsDir: string,
  reviewId: string,
  itemId: string,
  feedback: Feedback
): Promise<{ ok: boolean; complete: boolean }> {
  assertSafeSegment(reviewId, 'reviewId')
  assertSafeSegment(itemId, 'itemId')

  const reviewDir = path.join(reviewsDir, reviewId)
  const metaPath = path.join(reviewDir, 'review.json')
  const itemsDir = path.join(reviewDir, 'items')
  const itemPath = path.join(itemsDir, `${itemId}.json`)

  assertInsideDir(reviewDir, reviewsDir)
  assertInsideDir(itemPath, itemsDir)

  // Verify review exists
  try {
    await readFile(metaPath, 'utf8')
  } catch {
    return { ok: false, complete: false }
  }

  // Read item
  let item: Item
  try {
    item = JSON.parse(await readFile(itemPath, 'utf8'))
  } catch {
    return { ok: false, complete: false }
  }

  // Add feedback to last iteration
  const lastIteration = item.iterations.at(-1)
  if (!lastIteration) return { ok: false, complete: false }
  lastIteration.feedback = feedback

  // Write item back (atomic: tmp → rename)
  const tmpPath = itemPath + '.tmp'
  await writeFile(tmpPath, JSON.stringify(item, null, 2))
  await rename(tmpPath, itemPath)

  // Single pass: check completeness and collect decisions
  let complete = true
  const decisions: Record<string, { action: string; comment?: string }> = {}
  try {
    const itemFiles = await readdir(itemsDir)
    for (const file of itemFiles) {
      if (!file.endsWith('.json')) continue
      const otherItem = JSON.parse(
        await readFile(path.join(itemsDir, file), 'utf8')
      ) as Item
      const lastFb = otherItem.iterations.at(-1)?.feedback
      if (!lastFb) {
        complete = false
      } else {
        decisions[otherItem.id] = {
          action: lastFb.decision,
          ...(lastFb.comment ? { comment: lastFb.comment } : {}),
        }
      }
    }
  } catch {
    complete = false
  }

  // If complete, write a response.json marker for filewatch compatibility
  if (complete) {
    const responsePath = path.join(reviewDir, 'response.json')
    const responseData = {
      submitted_at: new Date().toISOString(),
      review_id: reviewId,
      decisions,
      summary: {
        total: Object.keys(decisions).length,
        ...Object.values(decisions).reduce(
          (acc, d) => {
            acc[d.action] = (acc[d.action] ?? 0) + 1
            return acc
          },
          {} as Record<string, number>
        ),
      },
    }

    const tmpResponsePath = responsePath + '.tmp'
    await writeFile(tmpResponsePath, JSON.stringify(responseData, null, 2))
    await rename(tmpResponsePath, responsePath)
  }

  return { ok: true, complete }
}

// ─── Create review ───────────────────────────────────────────────────────────

export interface CreateReviewItem {
  id: string
  title: string
  subtitle: string
  content: string
  code?: string
}

export async function createReview(
  reviewsDir: string,
  review: Omit<Review, 'items'>,
  items: CreateReviewItem[]
): Promise<void> {
  assertSafeSegment(review.id, 'reviewId')
  for (const item of items) {
    assertSafeSegment(item.id, 'itemId')
  }

  const reviewDir = path.join(reviewsDir, review.id)
  const itemsDir = path.join(reviewDir, 'items')
  await mkdir(itemsDir, { recursive: true })

  // Write review meta
  await writeFile(
    path.join(reviewDir, 'review.json'),
    JSON.stringify(
      {
        id: review.id,
        title: review.title,
        icon: review.icon,
        source: review.source,
        type: review.type,
        createdAt: review.createdAt,
      },
      null,
      2
    )
  )

  // Write items
  for (const item of items) {
    const itemData: Item = {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      iterations: [
        {
          number: 1,
          proposedAt: review.createdAt,
          content: item.content,
          code: item.code,
        },
      ],
    }
    await writeFile(
      path.join(itemsDir, `${item.id}.json`),
      JSON.stringify(itemData, null, 2)
    )
  }
}
