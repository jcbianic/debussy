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

/** @deprecated Grouping is always by plugin now. Kept for type compat. */
export type SetupGroupBy = 'plugin'

/** A group of items in the list panel. */
export interface SetupGroup {
  label: string
  items: SetupItem[]
  pluginId?: string
}

/** A node in the explorer file tree. */
export interface ExplorerNode {
  id: string
  label: string
  icon: string
  iconClass: string
  item?: SetupItem
  isFolder: boolean
  defaultExpanded?: boolean
  children?: ExplorerNode[]
}

/** A plugin group with tree-structured nodes for the sidebar. */
export interface ExplorerGroup {
  pluginId?: string
  label: string
  nodes: ExplorerNode[]
  itemCount: number
}

/** Whether an item is editable (project-scoped, non-plugin). */
export function isEditable(item: SetupItem): boolean {
  return (
    item.plugin === 'project' ||
    (item.type === 'plugin' && item.id === 'project')
  )
}

/** Build a hierarchical file tree from flat relative paths. */
function buildFileTree(
  files: { relativePath: string; content: string }[],
  parentItem: SetupItem
): ExplorerNode[] {
  interface TreeDir {
    [key: string]: TreeDir | null
  }
  const root: TreeDir = {}
  for (const file of files) {
    const parts = file.relativePath.split('/')
    let cur = root
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]!
      if (i === parts.length - 1) {
        cur[p] = null
      } else {
        if (!cur[p]) cur[p] = {}
        cur = cur[p] as TreeDir
      }
    }
  }
  function toNodes(dir: TreeDir, prefix: string): ExplorerNode[] {
    return Object.entries(dir)
      .sort(([a, av], [b, bv]) => {
        if ((av !== null) !== (bv !== null)) return av !== null ? -1 : 1
        return a.localeCompare(b)
      })
      .map(([name, val]) => {
        const path = prefix ? `${prefix}/${name}` : name
        if (val === null) {
          return {
            id: `${parentItem.id}:file:${path}`,
            label: name,
            icon: 'i-heroicons-document-text',
            iconClass: 'text-neutral-400',
            item: parentItem,
            isFolder: false,
          }
        }
        return {
          id: `${parentItem.id}:dir:${path}`,
          label: name,
          icon: 'i-heroicons-folder',
          iconClass: 'text-neutral-400',
          isFolder: true,
          children: toNodes(val, path),
        }
      })
  }
  return toNodes(root, '')
}

/** Convert SetupItems into ExplorerNodes, adding file sub-trees where applicable. */
function buildItemNodes(items: SetupItem[]): ExplorerNode[] {
  return items.map((item) => {
    const fc = item.files?.length ? buildFileTree(item.files, item) : undefined
    return {
      id: item.id,
      label: item.name,
      icon: typeIcon(item.type),
      iconClass: typeColor(item.type),
      item,
      isFolder: !!fc?.length,
      children: fc?.length ? fc : undefined,
    }
  })
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

  /** Build plugin-folder groups, optionally filtered to a single item type. */
  function groupByPlugin(typeFilter?: ItemType): SetupGroup[] {
    return plugins.value
      .map((p) => {
        const provided = pluginProvides(p.id).flatMap((g) => g.items)
        const items = typeFilter
          ? provided.filter((i) => i.type === typeFilter)
          : provided
        return { label: p.name, pluginId: p.id, items }
      })
      .filter((g) => g.items.length > 0)
  }

  const groupedItems = computed<SetupGroup[]>(() => {
    if (activeTab.value === 'plugin') {
      // Plugins tab: flat list of plugin items
      return [{ label: '', items: plugins.value }]
    }
    if (activeTab.value !== 'all') {
      // Type-specific tabs: plugin folders filtered to that type
      return groupByPlugin(activeTab.value)
    }
    // All tab: plugin folders with all children
    return groupByPlugin()
  })

  const typeFolderLabels: Record<string, string> = {
    skill: 'skills',
    command: 'commands',
    hook: 'hooks',
    agent: 'agents',
  }

  const explorerGroups = computed<ExplorerGroup[]>(() => {
    if (activeTab.value === 'plugin') {
      return [
        {
          label: '',
          nodes: plugins.value.map((p) => ({
            id: p.id,
            label: p.name,
            icon: typeIcon('plugin'),
            iconClass: typeColor('plugin'),
            item: p,
            isFolder: false,
          })),
          itemCount: plugins.value.length,
        },
      ]
    }

    const typeFilter =
      activeTab.value !== 'all' ? (activeTab.value as ItemType) : undefined

    return plugins.value
      .map((p) => {
        const groups = pluginProvides(p.id)
        let totalItems = 0
        const nodes: ExplorerNode[] = []

        for (const group of groups) {
          if (typeFilter && group.type !== typeFilter) continue
          const itemNodes = buildItemNodes(group.items)
          totalItems += group.items.length

          if (typeFilter) {
            nodes.push(...itemNodes)
          } else {
            nodes.push({
              id: `${p.id}:folder:${group.type}`,
              label: typeFolderLabels[group.type] ?? group.type,
              icon: 'i-heroicons-folder',
              iconClass: 'text-neutral-400',
              isFolder: true,
              defaultExpanded: true,
              children: itemNodes,
            })
          }
        }

        return { pluginId: p.id, label: p.name, nodes, itemCount: totalItems }
      })
      .filter((g) => g.nodes.length > 0)
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
    plugins,
    allItems,
    activeTab,
    tabs,
    groupedItems,
    explorerGroups,
    selected,
    selectByName,
    pluginProvides,
    usageFor,
    selectedMeta,
    headerStats,
    refresh,
    createItem,
    updateItem,
    deleteItem,
  }
}
