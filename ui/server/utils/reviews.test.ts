import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {
  itemStatus,
  scanReviews,
  writeReviewDecision,
  itemIdToFilename,
  assertSafeItemId,
} from './reviews'
import type { Item } from './reviews'

// ─── itemStatus ──────────────────────────────────────────────────────────────

describe('itemStatus', () => {
  it('returns "pending" when last iteration has no feedback', () => {
    const item: Item = {
      id: 'i-1',
      title: 'Test',
      subtitle: '',
      iterations: [{ number: 1, proposedAt: '', content: '' }],
    }
    expect(itemStatus(item)).toBe('pending')
  })

  it('returns "approved" when last feedback decision is approved', () => {
    const item: Item = {
      id: 'i-1',
      title: 'Test',
      subtitle: '',
      iterations: [
        {
          number: 1,
          proposedAt: '',
          content: '',
          feedback: { decision: 'approved', decidedAt: '' },
        },
      ],
    }
    expect(itemStatus(item)).toBe('approved')
  })

  it('returns "changes-requested" when last feedback decision is changes-requested', () => {
    const item: Item = {
      id: 'i-1',
      title: 'Test',
      subtitle: '',
      iterations: [
        {
          number: 1,
          proposedAt: '',
          content: '',
          feedback: { decision: 'changes-requested', decidedAt: '' },
        },
      ],
    }
    expect(itemStatus(item)).toBe('changes-requested')
  })

  it('returns "rejected" when last feedback decision is rejected', () => {
    const item: Item = {
      id: 'i-1',
      title: 'Test',
      subtitle: '',
      iterations: [
        {
          number: 1,
          proposedAt: '',
          content: '',
          feedback: { decision: 'rejected', decidedAt: '' },
        },
      ],
    }
    expect(itemStatus(item)).toBe('rejected')
  })

  it('uses the last iteration when multiple iterations exist', () => {
    const item: Item = {
      id: 'i-1',
      title: 'Test',
      subtitle: '',
      iterations: [
        {
          number: 1,
          proposedAt: '',
          content: '',
          feedback: { decision: 'changes-requested', decidedAt: '' },
        },
        { number: 2, proposedAt: '', content: '' },
      ],
    }
    expect(itemStatus(item)).toBe('pending')
  })

  it('returns "pending" when iterations array is empty', () => {
    const item: Item = {
      id: 'i-1',
      title: 'Test',
      subtitle: '',
      iterations: [],
    }
    expect(itemStatus(item)).toBe('pending')
  })
})

// ─── itemIdToFilename ────────────────────────────────────────────────────────

describe('itemIdToFilename', () => {
  it('replaces / with --', () => {
    expect(itemIdToFilename('policies/testing/unit-tests')).toBe(
      'policies--testing--unit-tests'
    )
  })

  it('leaves IDs without / unchanged', () => {
    expect(itemIdToFilename('simple-item')).toBe('simple-item')
  })
})

// ─── assertSafeItemId ────────────────────────────────────────────────────────

describe('assertSafeItemId', () => {
  it('accepts IDs with slashes', () => {
    expect(() =>
      assertSafeItemId('policies/testing/unit-tests', 'id')
    ).not.toThrow()
  })

  it('accepts simple IDs', () => {
    expect(() => assertSafeItemId('item-1', 'id')).not.toThrow()
  })

  it('rejects path traversal with ..', () => {
    expect(() => assertSafeItemId('foo/../etc', 'id')).toThrow()
  })

  it('rejects absolute paths', () => {
    expect(() => assertSafeItemId('/etc/passwd', 'id')).toThrow()
  })

  it('rejects empty strings', () => {
    expect(() => assertSafeItemId('', 'id')).toThrow()
  })
})

// ─── scanReviews ─────────────────────────────────────────────────────────────

describe('scanReviews', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'debussy-reviews-'))
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('returns empty array for missing directory', async () => {
    const result = await scanReviews(path.join(tmpDir, 'nonexistent'))
    expect(result).toEqual([])
  })

  it('returns empty array for empty directory', async () => {
    const result = await scanReviews(tmpDir)
    expect(result).toEqual([])
  })

  it('parses a review with items', async () => {
    const reviewDir = path.join(tmpDir, 'rv-1')
    const itemsDir = path.join(reviewDir, 'items')
    await mkdir(itemsDir, { recursive: true })

    await writeFile(
      path.join(reviewDir, 'review.json'),
      JSON.stringify({
        id: 'rv-1',
        title: 'Test Review',
        source: 'strategy',
        type: 'strategy',
        createdAt: '2026-01-01',
      })
    )

    await writeFile(
      path.join(itemsDir, 'item-1.json'),
      JSON.stringify({
        id: 'item-1',
        title: 'Item One',
        subtitle: 'Sub',
        iterations: [{ number: 1, proposedAt: '2026-01-01', content: 'Hello' }],
      })
    )

    const result = await scanReviews(tmpDir)
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('rv-1')
    expect(result[0]!.items).toHaveLength(1)
    expect(result[0]!.items[0]!.id).toBe('item-1')
  })

  it('skips completed reviews where all items have feedback', async () => {
    const reviewDir = path.join(tmpDir, 'rv-done')
    const itemsDir = path.join(reviewDir, 'items')
    await mkdir(itemsDir, { recursive: true })

    await writeFile(
      path.join(reviewDir, 'review.json'),
      JSON.stringify({
        id: 'rv-done',
        title: 'Done Review',
        source: 'test',
        type: 'test',
        createdAt: '2026-01-01',
      })
    )

    await writeFile(
      path.join(itemsDir, 'item-1.json'),
      JSON.stringify({
        id: 'item-1',
        title: 'Done Item',
        subtitle: '',
        iterations: [
          {
            number: 1,
            proposedAt: '2026-01-01',
            content: 'Content',
            feedback: { decision: 'approved', decidedAt: '2026-01-01' },
          },
        ],
      })
    )

    const result = await scanReviews(tmpDir)
    expect(result).toHaveLength(0)
  })

  it('skips directories without review.json', async () => {
    await mkdir(path.join(tmpDir, 'invalid-dir'))
    const result = await scanReviews(tmpDir)
    expect(result).toEqual([])
  })
})

// ─── writeReviewDecision ─────────────────────────────────────────────────────

describe('writeReviewDecision', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'debussy-reviews-'))
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  async function setupReview(itemCount: number) {
    const reviewDir = path.join(tmpDir, 'rv-test')
    const itemsDir = path.join(reviewDir, 'items')
    await mkdir(itemsDir, { recursive: true })

    await writeFile(
      path.join(reviewDir, 'review.json'),
      JSON.stringify({
        id: 'rv-test',
        title: 'Test',
        source: 'test',
        type: 'test',
        createdAt: '',
      })
    )

    for (let i = 1; i <= itemCount; i++) {
      await writeFile(
        path.join(itemsDir, `item-${i}.json`),
        JSON.stringify({
          id: `item-${i}`,
          title: `Item ${i}`,
          subtitle: '',
          iterations: [{ number: 1, proposedAt: '', content: `Content ${i}` }],
        })
      )
    }
  }

  it('adds feedback to the last iteration', async () => {
    await setupReview(1)
    await writeReviewDecision(tmpDir, 'rv-test', 'item-1', {
      decision: 'approved',
      decidedAt: '2026-01-01',
    })

    const item = JSON.parse(
      await readFile(
        path.join(tmpDir, 'rv-test', 'items', 'item-1.json'),
        'utf8'
      )
    )
    expect(item.iterations[0].feedback.decision).toBe('approved')
  })

  it('returns complete: true when all items have feedback', async () => {
    await setupReview(1)
    const result = await writeReviewDecision(tmpDir, 'rv-test', 'item-1', {
      decision: 'approved',
      decidedAt: '2026-01-01',
    })
    expect(result).toEqual({ ok: true, complete: true })
  })

  it('returns complete: false when other items are still pending', async () => {
    await setupReview(2)
    const result = await writeReviewDecision(tmpDir, 'rv-test', 'item-1', {
      decision: 'approved',
      decidedAt: '2026-01-01',
    })
    expect(result).toEqual({ ok: true, complete: false })
  })

  it('writes response.json when complete', async () => {
    await setupReview(1)
    await writeReviewDecision(tmpDir, 'rv-test', 'item-1', {
      decision: 'approved',
      decidedAt: '2026-01-01',
    })

    const response = JSON.parse(
      await readFile(path.join(tmpDir, 'rv-test', 'response.json'), 'utf8')
    )
    expect(response.decisions['item-1'].action).toBe('approved')
  })

  it('handles item IDs with slashes (review-gate format)', async () => {
    const reviewDir = path.join(tmpDir, 'rv-test')
    const itemsDir = path.join(reviewDir, 'items')
    await mkdir(itemsDir, { recursive: true })

    await writeFile(
      path.join(reviewDir, 'review.json'),
      JSON.stringify({
        id: 'rv-test',
        title: 'Test',
        source: 'test',
        type: 'test',
        createdAt: '',
      })
    )

    // File uses -- encoding, but JSON id contains /
    await writeFile(
      path.join(itemsDir, 'policies--testing--unit-tests.json'),
      JSON.stringify({
        id: 'policies/testing/unit-tests',
        title: 'Unit Tests',
        subtitle: 'Policy: Testing',
        iterations: [{ number: 1, proposedAt: '', content: 'Content' }],
      })
    )

    const result = await writeReviewDecision(
      tmpDir,
      'rv-test',
      'policies/testing/unit-tests',
      { decision: 'approved', decidedAt: '2026-01-01' }
    )

    expect(result).toEqual({ ok: true, complete: true })

    // Verify feedback written to the --encoded file
    const item = JSON.parse(
      await readFile(
        path.join(itemsDir, 'policies--testing--unit-tests.json'),
        'utf8'
      )
    )
    expect(item.iterations[0].feedback.decision).toBe('approved')
  })

  it('returns ok: false for nonexistent review', async () => {
    const result = await writeReviewDecision(tmpDir, 'no-such', 'item-1', {
      decision: 'approved',
      decidedAt: '',
    })
    expect(result.ok).toBe(false)
  })
})
