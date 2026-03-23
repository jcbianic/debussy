import { describe, it, expect } from 'vitest'
import { parsePrinciples, parseAdrs } from './architecture'

// ─── parsePrinciples ─────────────────────────────────────────────────────────

const VALID_PRINCIPLES = `---
title: Architecture Principles
---

## 1 — Local first, no cloud

**num:** 1
**relatedAdrs:** adr-001, adr-003

Debussy has no database, no login, no external service.

---

## 2 — One process, one port

**num:** 2
**relatedAdrs:** adr-001

The unified UI runs as a single Nitro SSR server.
`

describe('parsePrinciples', () => {
  it('returns an array of principles from valid markdown', () => {
    const result = parsePrinciples(VALID_PRINCIPLES)
    expect(result).toHaveLength(2)
  })

  it('extracts num from bold field', () => {
    const result = parsePrinciples(VALID_PRINCIPLES)
    expect(result[0]!.num).toBe('1')
    expect(result[1]!.num).toBe('2')
  })

  it('extracts name from H2 heading (after the dash)', () => {
    const result = parsePrinciples(VALID_PRINCIPLES)
    expect(result[0]!.name).toBe('Local first, no cloud')
    expect(result[1]!.name).toBe('One process, one port')
  })

  it('extracts description from paragraph content', () => {
    const result = parsePrinciples(VALID_PRINCIPLES)
    expect(result[0]!.description).toContain('no database')
  })

  it('extracts relatedAdrs as array from bold field', () => {
    const result = parsePrinciples(VALID_PRINCIPLES)
    expect(result[0]!.relatedAdrs).toEqual(['adr-001', 'adr-003'])
  })

  it('sets relatedAdrs to undefined when field is absent', () => {
    const single = `---\ntitle: test\n---\n## 5 — No deps\n\n**num:** 5\n\nDesc.\n`
    const result = parsePrinciples(single)
    expect(result[0]!.relatedAdrs).toBeUndefined()
  })

  it('returns empty array for empty string', () => {
    expect(parsePrinciples('')).toEqual([])
  })

  it('skips principle missing num field', () => {
    const bad = `---\ntitle: test\n---\n## No num here\n\nDesc.\n`
    const result = parsePrinciples(bad)
    expect(result).toHaveLength(0)
  })
})

// ─── parseAdrs ───────────────────────────────────────────────────────────────

const VALID_ADR = `---
id: "001"
shortTitle: Nuxt 4 + Nitro UI Stack
status: Accepted
date: 2026-03-20
issue: https://github.com/org/repo/issues/42
issueLabel: "#42 — Unified UI"
affectedPrinciples: ["2", "3"]
---

# 001 — Unified UI Tech Stack

## Context

Some context here.

## Decision

The decision.
`

describe('parseAdrs', () => {
  it('returns array of ADRs from valid file map', () => {
    const result = parseAdrs({ '001-test.md': VALID_ADR })
    expect(result).toHaveLength(1)
  })

  it('extracts id from frontmatter', () => {
    const result = parseAdrs({ '001-test.md': VALID_ADR })
    expect(result[0]!.id).toBe('001')
  })

  it('extracts shortTitle from frontmatter', () => {
    const result = parseAdrs({ '001-test.md': VALID_ADR })
    expect(result[0]!.shortTitle).toBe('Nuxt 4 + Nitro UI Stack')
  })

  it('extracts status from frontmatter', () => {
    const result = parseAdrs({ '001-test.md': VALID_ADR })
    expect(result[0]!.status).toBe('Accepted')
  })

  it('extracts affectedPrinciples from frontmatter', () => {
    const result = parseAdrs({ '001-test.md': VALID_ADR })
    expect(result[0]!.affectedPrinciples).toEqual(['2', '3'])
  })

  it('derives key from filename (adr-NNN format)', () => {
    const result = parseAdrs({ '001-test.md': VALID_ADR })
    expect(result[0]!.key).toBe('adr-001')
  })

  it('extracts title from H1 heading', () => {
    const result = parseAdrs({ '001-test.md': VALID_ADR })
    expect(result[0]!.title).toBe('001 — Unified UI Tech Stack')
  })

  it('parses H2 sections into sections array', () => {
    const result = parseAdrs({ '001-test.md': VALID_ADR })
    expect(result[0]!.sections).toHaveLength(2)
    expect(result[0]!.sections[0]!.title).toBe('Context')
    expect(result[0]!.sections[1]!.title).toBe('Decision')
  })

  it('skips file missing required id field', () => {
    const bad = `---\nshortTitle: Test\nstatus: Accepted\ndate: 2026-01-01\n---\n# Title\n`
    const result = parseAdrs({ 'bad.md': bad })
    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty file map', () => {
    expect(parseAdrs({})).toEqual([])
  })

  it('sorts results by id', () => {
    const adr2 = VALID_ADR.replace('id: "001"', 'id: "002"').replace(
      '001-test.md',
      '002-test.md'
    )
    const result = parseAdrs({ '002-test.md': adr2, '001-test.md': VALID_ADR })
    expect(result[0]!.id).toBe('001')
    expect(result[1]!.id).toBe('002')
  })
})
