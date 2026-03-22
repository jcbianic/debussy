import { describe, it, expect } from 'vitest'
import { useDashboard } from './useDashboard'

describe('useDashboard', () => {
  describe('nextRelease', () => {
    it('returns a non-empty array of intents', () => {
      const { nextRelease } = useDashboard()
      expect(nextRelease.length).toBeGreaterThan(0)
    })

    it('each intent has an id, title, state, and lane field', () => {
      const { nextRelease } = useDashboard()
      for (const intent of nextRelease) {
        expect(intent).toHaveProperty('id')
        expect(intent).toHaveProperty('title')
        expect(intent).toHaveProperty('state')
        expect(intent).toHaveProperty('lane')
      }
    })

    it('each intent state is one of the allowed values', () => {
      const { nextRelease } = useDashboard()
      const allowed = new Set(['done', 'in-progress', 'open'])
      for (const intent of nextRelease) {
        expect(allowed.has(intent.state)).toBe(true)
      }
    })
  })

  describe('artifacts', () => {
    it('returns a non-empty array of artifact cards', () => {
      const { artifacts } = useDashboard()
      expect(artifacts.length).toBeGreaterThan(0)
    })

    it('each artifact has a key, name, icon, and status field', () => {
      const { artifacts } = useDashboard()
      for (const artifact of artifacts) {
        expect(artifact).toHaveProperty('key')
        expect(artifact).toHaveProperty('name')
        expect(artifact).toHaveProperty('icon')
        expect(artifact).toHaveProperty('status')
      }
    })

    it('each artifact status is one of the allowed values', () => {
      const { artifacts } = useDashboard()
      const allowed = new Set(['reviewed', 'draft'])
      for (const artifact of artifacts) {
        expect(allowed.has(artifact.status)).toBe(true)
      }
    })
  })

  describe('claudeStats', () => {
    it('returns a non-empty array of stat pills', () => {
      const { claudeStats } = useDashboard()
      expect(claudeStats.length).toBeGreaterThan(0)
    })

    it('each stat has a value and a label', () => {
      const { claudeStats } = useDashboard()
      for (const stat of claudeStats) {
        expect(stat).toHaveProperty('value')
        expect(stat).toHaveProperty('label')
      }
    })
  })

  describe('claudeItems', () => {
    it('returns a non-empty array of badge items', () => {
      const { claudeItems } = useDashboard()
      expect(claudeItems.length).toBeGreaterThan(0)
    })

    it('each item has a name field', () => {
      const { claudeItems } = useDashboard()
      for (const item of claudeItems) {
        expect(item).toHaveProperty('name')
        expect(typeof item.name).toBe('string')
      }
    })
  })

  describe('referential stability', () => {
    it('returns the same array references across multiple calls', () => {
      const first = useDashboard()
      const second = useDashboard()
      expect(first.nextRelease).toBe(second.nextRelease)
      expect(first.artifacts).toBe(second.artifacts)
      expect(first.claudeStats).toBe(second.claudeStats)
      expect(first.claudeItems).toBe(second.claudeItems)
    })
  })
})
