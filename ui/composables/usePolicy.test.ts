import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { PolicyTopic } from './usePolicy'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_TOPICS: PolicyTopic[] = [
  {
    key: 'workflow',
    name: 'Workflow',
    description: 'Branch naming conventions and lifecycle.',
    icon: 'i-heroicons-arrow-path',
    status: 'defined',
    order: 1,
    sections: [
      {
        title: 'Branching',
        items: [
          { rule: 'feat/<issue-id>-<slug>', note: 'New features' },
          { rule: 'fix/<issue-id>-<slug>', note: 'Bug fixes' },
        ],
      },
    ],
  },
  {
    key: 'feedback',
    name: 'Feedback',
    description: 'Human-in-the-loop rules.',
    icon: 'i-heroicons-chat-bubble-left-right',
    status: 'draft',
    order: 3,
    sections: [
      {
        title: 'Review Gates',
        content: ['Skills include a browser-based review step.'],
      },
    ],
  },
  {
    key: 'quality',
    name: 'Quality',
    description: 'Balance features, refactoring, tech debt.',
    icon: 'i-heroicons-shield-check',
    status: 'draft',
    order: 4,
    sections: [],
  },
]

const mockFetchData = ref<PolicyTopic[]>(MOCK_TOPICS)

mockNuxtImport('useFetch', () => {
  return () => ({ data: mockFetchData })
})

// Import after mocking
const { usePolicy } = await import('./usePolicy')

describe('usePolicy', () => {
  beforeEach(() => {
    mockFetchData.value = MOCK_TOPICS
  })

  describe('initial state', () => {
    it('auto-selects the first topic', () => {
      const { selected } = usePolicy()
      expect(selected.value).toBe('workflow')
    })

    it('returns topics from the API', () => {
      const { topics } = usePolicy()
      expect(topics.value.length).toBe(3)
    })

    it('currentTopic resolves to the first topic', () => {
      const { currentTopic } = usePolicy()
      expect(currentTopic.value?.key).toBe('workflow')
    })
  })

  describe('topics shape', () => {
    it('each topic has key, name, description, icon, and sections fields', () => {
      const { topics } = usePolicy()
      for (const topic of topics.value) {
        expect(topic).toHaveProperty('key')
        expect(topic).toHaveProperty('name')
        expect(topic).toHaveProperty('description')
        expect(topic).toHaveProperty('icon')
        expect(topic).toHaveProperty('sections')
      }
    })

    it('each topic key is unique', () => {
      const { topics } = usePolicy()
      const keys = topics.value.map((t) => t.key)
      expect(new Set(keys).size).toBe(keys.length)
    })
  })

  describe('selected', () => {
    it('changing selected updates currentTopic', () => {
      const { selected, currentTopic } = usePolicy()
      selected.value = 'feedback'
      expect(currentTopic.value?.key).toBe('feedback')
    })

    it('currentTopic name matches the topic at the selected key', () => {
      const { topics, selected, currentTopic } = usePolicy()
      const target = topics.value[1]!
      selected.value = target.key
      expect(currentTopic.value?.name).toBe(target.name)
    })
  })

  describe('currentTopic', () => {
    it('returns undefined for a nonexistent key', () => {
      const { selected, currentTopic } = usePolicy()
      selected.value = 'nonexistent-key'
      expect(currentTopic.value).toBeUndefined()
    })

    it('updates reactively when selected changes', () => {
      const { selected, currentTopic } = usePolicy()
      selected.value = 'feedback'
      expect(currentTopic.value?.key).toBe('feedback')
      selected.value = 'quality'
      expect(currentTopic.value?.key).toBe('quality')
    })

    it('each topic can be selected and resolved', () => {
      const { topics, selected, currentTopic } = usePolicy()
      for (const topic of topics.value) {
        selected.value = topic.key
        expect(currentTopic.value?.key).toBe(topic.key)
      }
    })
  })

  describe('empty state', () => {
    it('handles empty topics array gracefully', () => {
      mockFetchData.value = []
      const { topics, currentTopic } = usePolicy()
      expect(topics.value.length).toBe(0)
      expect(currentTopic.value).toBeUndefined()
    })
  })
})
