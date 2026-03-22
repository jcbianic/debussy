import { describe, it, expect } from 'vitest'
import { usePolicy } from './usePolicy'

describe('usePolicy', () => {
  describe('initial state', () => {
    it('starts with selected set to "branching"', () => {
      const { selected } = usePolicy()
      expect(selected.value).toBe('branching')
    })

    it('returns a non-empty topics array', () => {
      const { topics } = usePolicy()
      expect(topics.length).toBeGreaterThan(0)
    })

    it('currentTopic resolves to the "branching" topic on load', () => {
      const { currentTopic } = usePolicy()
      expect(currentTopic.value?.key).toBe('branching')
    })
  })

  describe('topics shape', () => {
    it('each topic has key, name, description, icon, and sections fields', () => {
      const { topics } = usePolicy()
      for (const topic of topics) {
        expect(topic).toHaveProperty('key')
        expect(topic).toHaveProperty('name')
        expect(topic).toHaveProperty('description')
        expect(topic).toHaveProperty('icon')
        expect(topic).toHaveProperty('sections')
      }
    })

    it('each topic key is unique', () => {
      const { topics } = usePolicy()
      const keys = topics.map((t) => t.key)
      expect(new Set(keys).size).toBe(keys.length)
    })
  })

  describe('selected', () => {
    it('changing selected updates currentTopic to the matching topic', () => {
      const { selected, currentTopic } = usePolicy()
      selected.value = 'commits'
      expect(currentTopic.value?.key).toBe('commits')
    })

    it('currentTopic name matches the topic at the selected key', () => {
      const { topics, selected, currentTopic } = usePolicy()
      const target = topics[2]!
      selected.value = target.key
      expect(currentTopic.value?.name).toBe(target.name)
    })
  })

  describe('currentTopic', () => {
    it('returns undefined when selected is set to a key that does not exist', () => {
      const { selected, currentTopic } = usePolicy()
      selected.value = 'nonexistent-key'
      expect(currentTopic.value).toBeUndefined()
    })

    it('updates reactively when selected changes again', () => {
      const { selected, currentTopic } = usePolicy()
      selected.value = 'release'
      expect(currentTopic.value?.key).toBe('release')
      selected.value = 'testing'
      expect(currentTopic.value?.key).toBe('testing')
    })

    it('each topic in the list can be selected and resolved via currentTopic', () => {
      const { topics, selected, currentTopic } = usePolicy()
      for (const topic of topics) {
        selected.value = topic.key
        expect(currentTopic.value?.key).toBe(topic.key)
      }
    })
  })

  describe('edge cases', () => {
    it('topics array is not mutated between calls', () => {
      const first = usePolicy()
      const second = usePolicy()
      expect(first.topics).toBe(second.topics)
    })

    it('selected in one call instance is independent from another', () => {
      const a = usePolicy()
      const b = usePolicy()
      a.selected.value = 'commits'
      // b.selected starts at 'branching'; changing a should not affect b
      expect(b.selected.value).toBe('branching')
    })
  })
})
