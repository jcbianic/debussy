export type ItemType = 'plugin' | 'skill' | 'command' | 'hook' | 'agent'

/** A Claude Code plugin, skill, command, or hook tracked in the setup view. */
export interface SetupItem {
  id: string
  name: string
  type: ItemType
  plugin?: string
  version?: string
  scope?: string
  description?: string
  usage: number
  installedAt?: string
  // plugin
  provides?: string[]
  // command
  argHint?: string
  allowedTools?: string
  body?: string
  delegatesTo?: string
  // hook
  triggers?: string[]
  // agent
  model?: string
  tools?: string
  // skill
  files?: { relativePath: string; content: string }[]
  // skill / generic
  metadata?: Record<string, unknown>
}

/** Map item type to its Heroicons icon name. */
export const typeIcon = (type: ItemType): string =>
  ({
    plugin: 'i-heroicons-puzzle-piece',
    skill: 'i-heroicons-sparkles',
    command: 'i-heroicons-command-line',
    hook: 'i-heroicons-bolt',
    agent: 'i-heroicons-cpu-chip',
  })[type]

/** Map item type to its Tailwind text-color class. */
export const typeColor = (type: ItemType): string =>
  ({
    plugin: 'text-blue-500',
    skill: 'text-violet-500',
    command: 'text-emerald-500',
    hook: 'text-amber-500',
    agent: 'text-cyan-500',
  })[type]

/** Grouping axis for the "All" tab. */
export type SetupGroupBy = 'type' | 'plugin'

export const setupGroupByOptions = [
  { value: 'type' as const, label: 'Type' },
  { value: 'plugin' as const, label: 'Plugin' },
]

/** A group of items in the list panel. */
export interface SetupGroup {
  label: string
  items: SetupItem[]
  pluginId?: string
}

/** Whether an item is editable (project-scoped, non-plugin). */
export function isEditable(item: SetupItem): boolean {
  return (
    item.plugin === 'project' ||
    (item.type === 'plugin' && item.id === 'project')
  )
}

/** Provide Claude setup data, selection state, and derived helpers. */
export const useSetup = () => {
  const { data, refresh } = useFetch<SetupItem[]>('/api/setup')

  const items = computed(() => data.value ?? [])

  const plugins = computed(() => items.value.filter((i) => i.type === 'plugin'))
  const skills = computed(() => items.value.filter((i) => i.type === 'skill'))
  const commands = computed(() =>
    items.value.filter((i) => i.type === 'command')
  )
  const hooks = computed(() => items.value.filter((i) => i.type === 'hook'))
  const agents = computed(() => items.value.filter((i) => i.type === 'agent'))

  const allItems = computed(() => items.value)

  const activeTab = ref<'all' | ItemType>('all')
  const groupByMode = ref<SetupGroupBy>('type')

  function setGroupBy(mode: SetupGroupBy) {
    groupByMode.value = mode
  }

  const tabs = computed(() => [
    { key: 'all' as const, label: 'All', count: allItems.value.length },
    { key: 'plugin' as const, label: 'Plugins', count: plugins.value.length },
    { key: 'skill' as const, label: 'Skills', count: skills.value.length },
    {
      key: 'command' as const,
      label: 'Commands',
      count: commands.value.length,
    },
    { key: 'hook' as const, label: 'Hooks', count: hooks.value.length },
    { key: 'agent' as const, label: 'Agents', count: agents.value.length },
  ])

  const groupedItems = computed<SetupGroup[]>(() => {
    if (activeTab.value !== 'all') {
      return [
        {
          label: '',
          items: allItems.value.filter((i) => i.type === activeTab.value),
        },
      ]
    }

    if (groupByMode.value === 'plugin') {
      return plugins.value.map((p) => ({
        label: p.name,
        pluginId: p.id,
        items: pluginProvides(p.id).flatMap((g) => g.items),
      }))
    }

    return [
      { label: 'Plugins', items: plugins.value },
      { label: 'Skills', items: skills.value },
      { label: 'Commands', items: commands.value },
      { label: 'Hooks', items: hooks.value },
      { label: 'Agents', items: agents.value },
    ]
  })

  const selected = ref<SetupItem | null>(null)

  function selectByName(name: string) {
    const found = allItems.value.find((i) => i.name === name || i.id === name)
    if (found) selected.value = found
  }

  function pluginProvides(pluginId: string) {
    const plugin = plugins.value.find((p) => p.id === pluginId)
    if (!plugin?.provides) return []
    const ids = new Set(plugin.provides)
    const allProvided = allItems.value.filter(
      (i) => ids.has(i.id) || ids.has(i.name)
    )
    const byType: Record<string, SetupItem[]> = {}
    for (const item of allProvided) {
      ;(byType[item.type] ??= []).push(item)
    }
    const typeOrder: ItemType[] = ['skill', 'command', 'hook', 'agent']
    const typeLabels: Record<ItemType, string> = {
      plugin: 'Plugins',
      skill: 'Skills',
      command: 'Commands',
      hook: 'Hooks',
      agent: 'Agents',
    }
    return typeOrder
      .filter((t) => byType[t]?.length)
      .map((t) => ({ type: t, label: typeLabels[t], items: byType[t] ?? [] }))
  }

  function pluginTotalUsage(pluginId: string) {
    const plugin = plugins.value.find((p) => p.id === pluginId)
    if (!plugin?.provides) return 0
    const ids = new Set(plugin.provides)
    return allItems.value
      .filter((i) => ids.has(i.id) || ids.has(i.name))
      .reduce((s, i) => s + i.usage, 0)
  }

  function usageFor(item: SetupItem) {
    if (item.type === 'plugin') return pluginTotalUsage(item.id)
    return item.usage
  }

  const selectedMeta = computed(() => {
    if (!selected.value) return []
    const m: { label: string; value: string }[] = []
    if (selected.value.installedAt)
      m.push({ label: 'Installed', value: selected.value.installedAt })
    if (selected.value.version)
      m.push({ label: 'Version', value: selected.value.version })
    if (selected.value.scope)
      m.push({ label: 'Scope', value: selected.value.scope })
    if (selected.value.plugin && selected.value.type !== 'plugin') {
      m.push({
        label: 'Plugin',
        value: selected.value.plugin.split('@')[0] ?? '',
      })
    }
    // Surface extra frontmatter metadata as key-value pairs
    if (selected.value.metadata) {
      for (const [key, val] of Object.entries(selected.value.metadata)) {
        if (val == null) continue
        if (typeof val === 'object') {
          // Flatten nested objects (e.g. metadata: { author, version })
          for (const [subKey, subVal] of Object.entries(
            val as Record<string, unknown>
          )) {
            if (subVal != null) m.push({ label: subKey, value: String(subVal) })
          }
        } else {
          m.push({ label: key, value: String(val) })
        }
      }
    }
    return m
  })

  const totalUsage = computed(() =>
    [
      ...skills.value,
      ...commands.value,
      ...hooks.value,
      ...agents.value,
    ].reduce((s, i) => s + i.usage, 0)
  )

  const headerStats = computed(() => [
    { value: plugins.value.length, label: 'plugins' },
    { value: skills.value.length, label: 'skills' },
    { value: commands.value.length, label: 'commands' },
    { value: hooks.value.length, label: 'hooks' },
    { value: agents.value.length, label: 'agents' },
    { value: totalUsage.value, label: 'total invocations' },
  ])

  async function createItem(payload: {
    type: 'skill' | 'command' | 'agent'
    name: string
    description?: string
    body?: string
    argHint?: string
    allowedTools?: string
    delegatesTo?: string
    model?: string
    tools?: string
    metadata?: Record<string, unknown>
  }) {
    await $fetch('/api/setup', { method: 'POST', body: payload })
    await refresh()
    // Select the newly created item
    const newId =
      payload.type === 'command'
        ? `project:cmd:${payload.name}`
        : payload.type === 'agent'
          ? `project:agent:${payload.name}`
          : `project:${payload.name}`
    selectByName(newId)
  }

  async function updateItem(
    id: string,
    payload: {
      type: 'skill' | 'command' | 'agent'
      description?: string
      body?: string
      name?: string
      argHint?: string
      allowedTools?: string
      delegatesTo?: string
      model?: string
      tools?: string
      metadata?: Record<string, unknown>
    }
  ) {
    await $fetch(`/api/setup/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: payload,
    })
    await refresh()
    selectByName(id)
  }

  async function deleteItem(id: string) {
    await $fetch(`/api/setup/${encodeURIComponent(id)}`, { method: 'DELETE' })
    selected.value = null
    await refresh()
  }

  return {
    get plugins() {
      return plugins.value
    },
    allItems,
    activeTab,
    groupByMode,
    setGroupBy,
    tabs,
    groupedItems,
    selected,
    selectByName,
    pluginProvides,
    usageFor,
    selectedMeta,
    headerStats,
    createItem,
    updateItem,
    deleteItem,
  }
}
