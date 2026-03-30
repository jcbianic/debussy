import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { SetupItem } from './useSetup'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_ITEMS: SetupItem[] = [
  {
    id: 'test-plugin@test',
    name: 'test-plugin',
    type: 'plugin',
    version: '1.0.0',
    scope: 'user',
    description: 'A test plugin for unit tests.',
    usage: 0,
    installedAt: '2026-01-01',
    provides: [
      'test-plugin:alpha-skill',
      'test-plugin:beta-cmd',
      'hook:post-tool',
    ],
  },
  {
    id: 'test-plugin:alpha-skill',
    name: 'test-plugin:alpha-skill',
    type: 'skill',
    plugin: 'test-plugin@test',
    description: 'Alpha skill for testing.',
    usage: 0,
  },
  {
    id: 'test-plugin:beta-cmd',
    name: 'test-plugin:beta-cmd',
    type: 'command',
    plugin: 'test-plugin@test',
    description: 'Beta command for testing.',
    argHint: '<target>',
    allowedTools: 'Read,Grep',
    body: 'Run the beta command.',
    usage: 0,
  },
  {
    id: 'hook:post-tool',
    name: 'post-tool-hook',
    type: 'hook',
    plugin: 'test-plugin@test',
    description: 'PostToolUse: Write|Edit',
    triggers: ['PostToolUse'],
    usage: 0,
  },
  {
    id: 'project:local-skill',
    name: 'local-skill',
    type: 'skill',
    description: 'A project-level skill with no plugin.',
    usage: 0,
  },
]

const mockFetchData = ref<SetupItem[] | null>(MOCK_ITEMS)

mockNuxtImport('useFetch', () => {
  return () => ({ data: mockFetchData })
})

// Import after mocking
const { useSetup } = await import('./useSetup')

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useSetup', () => {
  beforeEach(() => {
    mockFetchData.value = MOCK_ITEMS
  })

  describe('initial state', () => {
    it('allItems is empty when API returns null', () => {
      mockFetchData.value = null
      const { allItems } = useSetup()
      expect(allItems.value).toEqual([])
    })

    it('allItems populates when API returns data', () => {
      const { allItems } = useSetup()
      expect(allItems.value.length).toBe(MOCK_ITEMS.length)
    })

    it('activeTab defaults to all', () => {
      const { activeTab } = useSetup()
      expect(activeTab.value).toBe('all')
    })

    it('selected defaults to null', () => {
      const { selected } = useSetup()
      expect(selected.value).toBeNull()
    })
  })

  describe('tabs', () => {
    it('tabs include all, plugin, skill, command, hook', () => {
      const { tabs } = useSetup()
      const keys = tabs.value.map((t) => t.key)
      expect(keys).toContain('all')
      expect(keys).toContain('plugin')
      expect(keys).toContain('skill')
      expect(keys).toContain('command')
      expect(keys).toContain('hook')
    })

    it('tab counts reflect filtered items', () => {
      const { tabs } = useSetup()
      const allTab = tabs.value.find((t) => t.key === 'all')
      expect(allTab!.count).toBe(MOCK_ITEMS.length)

      const pluginTab = tabs.value.find((t) => t.key === 'plugin')
      expect(pluginTab!.count).toBe(1) // one plugin in mock data

      const skillTab = tabs.value.find((t) => t.key === 'skill')
      expect(skillTab!.count).toBe(2) // two skills in mock data

      const commandTab = tabs.value.find((t) => t.key === 'command')
      expect(commandTab!.count).toBe(1) // one command in mock data

      const hookTab = tabs.value.find((t) => t.key === 'hook')
      expect(hookTab!.count).toBe(1) // one hook in mock data
    })
  })

  describe('groupedItems', () => {
    it('groups items by type when activeTab is all', () => {
      const { groupedItems } = useSetup()
      // When activeTab is 'all', items should be grouped by type
      expect(groupedItems.value.length).toBeGreaterThan(1)
    })

    it('filters to single type when activeTab is set', () => {
      const { activeTab, groupedItems } = useSetup()
      activeTab.value = 'skill'
      // Should have a single group with only skill items
      expect(groupedItems.value).toHaveLength(1)
      for (const item of groupedItems.value[0]!.items) {
        expect(item.type).toBe('skill')
      }
    })
  })

  describe('selection', () => {
    it('selectByName finds item by name', () => {
      const { selectByName, selected } = useSetup()
      selectByName('test-plugin')
      expect(selected.value).not.toBeNull()
      expect(selected.value!.name).toBe('test-plugin')
    })

    it('selectByName finds item by id', () => {
      const { selectByName, selected } = useSetup()
      selectByName('test-plugin@test')
      expect(selected.value).not.toBeNull()
      expect(selected.value!.id).toBe('test-plugin@test')
    })

    it('selectByName does nothing for unknown', () => {
      const { selectByName, selected } = useSetup()
      selectByName('nonexistent-item')
      expect(selected.value).toBeNull()
    })
  })

  describe('pluginProvides', () => {
    it('returns grouped items a plugin provides', () => {
      const { pluginProvides } = useSetup()
      const groups = pluginProvides('test-plugin@test')
      expect(groups.length).toBeGreaterThan(0)
      // Should contain skill, command, hook groups
      const types = groups.map((g) => g.type)
      expect(types).toContain('skill')
      expect(types).toContain('command')
      expect(types).toContain('hook')
    })

    it('returns empty array for unknown plugin', () => {
      const { pluginProvides } = useSetup()
      const groups = pluginProvides('nonexistent@plugin')
      expect(groups).toEqual([])
    })
  })

  describe('usageFor', () => {
    it('returns 0 for all items (no usage data)', () => {
      const { allItems, usageFor } = useSetup()
      for (const item of allItems.value) {
        expect(usageFor(item)).toBe(0)
      }
    })
  })

  describe('headerStats', () => {
    it('returns correct counts for each type', () => {
      const { headerStats } = useSetup()
      const stats = headerStats.value
      const pluginStat = stats.find((s) => s.label === 'plugins')
      expect(pluginStat!.value).toBe(1)

      const skillStat = stats.find((s) => s.label === 'skills')
      expect(skillStat!.value).toBe(2)

      const commandStat = stats.find((s) => s.label === 'commands')
      expect(commandStat!.value).toBe(1)

      const hookStat = stats.find((s) => s.label === 'hooks')
      expect(hookStat!.value).toBe(1)
    })
  })

  describe('typeIcon / typeColor', () => {
    it('returns correct icon for each item type', async () => {
      const { typeIcon } = await import('./useSetup')
      expect(typeIcon('plugin')).toBe('i-heroicons-puzzle-piece')
      expect(typeIcon('skill')).toBe('i-heroicons-sparkles')
      expect(typeIcon('command')).toBe('i-heroicons-command-line')
      expect(typeIcon('hook')).toBe('i-heroicons-bolt')
    })

    it('returns correct color for each item type', async () => {
      const { typeColor } = await import('./useSetup')
      expect(typeColor('plugin')).toBe('text-blue-500')
      expect(typeColor('skill')).toBe('text-violet-500')
      expect(typeColor('command')).toBe('text-emerald-500')
      expect(typeColor('hook')).toBe('text-amber-500')
    })
  })
})
