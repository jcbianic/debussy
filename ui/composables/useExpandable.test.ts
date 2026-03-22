import { describe, it, expect } from 'vitest'
import { useExpandable } from './useExpandable'

describe('useExpandable', () => {
  describe('initial state', () => {
    it('starts with an empty expanded set when no initial IDs are given', () => {
      const { expanded } = useExpandable([])
      expect(expanded.value.size).toBe(0)
    })

    it('starts with the provided IDs in the expanded set', () => {
      const { expanded } = useExpandable(['a', 'b'])
      expect(expanded.value.size).toBe(2)
    })

    it('marks each initial ID as expanded', () => {
      const { expanded } = useExpandable(['a', 'b'])
      expect(expanded.value.has('a')).toBe(true)
      expect(expanded.value.has('b')).toBe(true)
    })

    it('does not include IDs that were not passed as initial', () => {
      const { expanded } = useExpandable(['a'])
      expect(expanded.value.has('z')).toBe(false)
    })
  })

  describe('has', () => {
    it('returns true for an ID that is in the expanded set', () => {
      const { has } = useExpandable(['x'])
      expect(has('x')).toBe(true)
    })

    it('returns false for an ID that is not in the expanded set', () => {
      const { has } = useExpandable(['x'])
      expect(has('y')).toBe(false)
    })
  })

  describe('toggle', () => {
    it('collapses an ID that was expanded', () => {
      const { expanded, toggle } = useExpandable(['a'])
      toggle('a')
      expect(expanded.value.has('a')).toBe(false)
    })

    it('expands an ID that was collapsed', () => {
      const { expanded, toggle } = useExpandable([])
      toggle('a')
      expect(expanded.value.has('a')).toBe(true)
    })

    it('toggling twice returns the ID to its original state', () => {
      const { expanded, toggle } = useExpandable(['a'])
      toggle('a')
      toggle('a')
      expect(expanded.value.has('a')).toBe(true)
    })

    it('toggling one ID does not affect other IDs in the set', () => {
      const { expanded, toggle } = useExpandable(['a', 'b'])
      toggle('a')
      expect(expanded.value.has('b')).toBe(true)
    })

    it('produces a new Set reference after toggling (triggers Vue reactivity)', () => {
      const { expanded, toggle } = useExpandable(['a'])
      const before = expanded.value
      toggle('a')
      expect(expanded.value).not.toBe(before)
    })
  })

  describe('edge cases', () => {
    it('handles toggling an ID that was never in the set', () => {
      const { expanded, toggle } = useExpandable([])
      toggle('never-seen')
      expect(expanded.value.has('never-seen')).toBe(true)
    })

    it('handles duplicate initial IDs without error', () => {
      const { expanded } = useExpandable(['a', 'a'])
      expect(expanded.value.size).toBe(1)
    })

    it('handles an empty string as an ID', () => {
      const { expanded, toggle } = useExpandable([])
      toggle('')
      expect(expanded.value.has('')).toBe(true)
    })
  })
})
