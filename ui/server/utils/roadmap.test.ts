import { describe, it, expect } from 'vitest'
import { parseReleases } from './roadmap'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const VALID_INTENTS = `---
title: Test Intents
---

## 001 — First Intent

**id:** 001
**release:** r1
**releaseName:** Release 1.0
**releaseTheme:** Foundation
**state:** done
**priority:** now
**addresses:** P1: Some pain point
**issue:** 34

Description of the first intent.

**doneWhen:** Done when criterion.

---

## 002 — Second Intent

**id:** 002
**release:** r1
**releaseName:** Release 1.0
**releaseTheme:** Foundation
**state:** open
**priority:** next
**addresses:** P2: Another pain point

Description of the second intent.

---

## — Backlog Item

**id:** —
**release:** backlog
**releaseName:** Backlog
**releaseTheme:** Not yet scoped
**state:** out-of-scope
**addresses:** Gap: Something
`

// ─── parseReleases ────────────────────────────────────────────────────────────

describe('parseReleases', () => {
  it('returns array of releases grouped by release field', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result).toHaveLength(2)
  })

  it('assigns correct id/name/theme to each release', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.id).toBe('r1')
    expect(result[0]!.name).toBe('Release 1.0')
    expect(result[0]!.theme).toBe('Foundation')
    expect(result[1]!.id).toBe('backlog')
    expect(result[1]!.name).toBe('Backlog')
  })

  it('groups intents under the correct release', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents).toHaveLength(2)
    expect(result[1]!.intents).toHaveLength(1)
  })

  it('preserves release order of first appearance', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.id).toBe('r1')
    expect(result[1]!.id).toBe('backlog')
  })

  it('extracts intent id from bold field', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents[0]!.id).toBe('001')
    expect(result[1]!.intents[0]!.id).toBe('—')
  })

  it('extracts title from H2 heading (after the dash)', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents[0]!.title).toBe('First Intent')
    expect(result[0]!.intents[1]!.title).toBe('Second Intent')
  })

  it('extracts title from H2 heading starting with em-dash', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[1]!.intents[0]!.title).toBe('Backlog Item')
  })

  it('extracts addresses from bold field', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents[0]!.addresses).toBe('P1: Some pain point')
  })

  it('extracts state from bold field', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents[0]!.state).toBe('done')
    expect(result[0]!.intents[1]!.state).toBe('open')
    expect(result[1]!.intents[0]!.state).toBe('out-of-scope')
  })

  it('extracts priority from bold field', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents[0]!.priority).toBe('now')
    expect(result[0]!.intents[1]!.priority).toBe('next')
  })

  it('extracts issue as number from bold field', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents[0]!.issue).toBe(34)
  })

  it('sets issue to undefined when field is absent', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents[1]!.issue).toBeUndefined()
  })

  it('extracts description from paragraph content', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents[0]!.description).toContain(
      'Description of the first'
    )
  })

  it('extracts doneWhen from bold field', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents[0]!.doneWhen).toBe('Done when criterion.')
  })

  it('sets doneWhen to undefined when field is absent', () => {
    const result = parseReleases(VALID_INTENTS)
    expect(result[0]!.intents[1]!.doneWhen).toBeUndefined()
  })

  it('skips intent missing release field', () => {
    const bad = `---\ntitle: test\n---\n## No Release\n\n**id:** x\n**state:** open\n**addresses:** P1\n`
    const result = parseReleases(bad)
    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty string', () => {
    expect(parseReleases('')).toEqual([])
  })

  it('includes out-of-scope intents in backlog release', () => {
    const result = parseReleases(VALID_INTENTS)
    const backlog = result.find((r) => r.id === 'backlog')
    expect(backlog).toBeDefined()
    expect(backlog!.intents[0]!.state).toBe('out-of-scope')
  })
})

describe('parseReleases — lane fields', () => {
  const WITH_LANE = `---\ntitle: test\n---\n\n## 002 — Intent With Lane\n\n**id:** 002\n**release:** r1\n**releaseName:** Release 1.0\n**releaseTheme:** Foundation\n**state:** in-progress\n**addresses:** P1\n**lane:** feat/feedback-ui\n**laneId:** wt-feedback\n`

  it('extracts lane and laneId from bold fields', () => {
    const result = parseReleases(WITH_LANE)
    expect(result[0]!.intents[0]!.lane).toBe('feat/feedback-ui')
    expect(result[0]!.intents[0]!.laneId).toBe('wt-feedback')
  })
})
