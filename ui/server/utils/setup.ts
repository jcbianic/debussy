import matter from 'gray-matter'
import os from 'node:os'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PluginManifest {
  name: string
  version?: string
  description?: string
}

export interface SkillFile {
  relativePath: string
  content: string
}

export interface SkillEntry {
  name: string
  description?: string
  body?: string
  metadata?: Record<string, unknown>
  files?: SkillFile[]
}

export interface CommandEntry {
  name: string
  description?: string
  argHint?: string
  allowedTools?: string
  delegatesTo?: string
  body?: string
}

export interface AgentEntry {
  name: string
  description?: string
  model?: string
  tools?: string
  body?: string
  metadata?: Record<string, unknown>
}

export interface HookEntry {
  name: string
  description: string
  triggers: string[]
  commands?: string[]
  files?: SkillFile[]
}

export interface InstalledPlugin {
  id: string
  scope: string
  installPath: string
  version?: string
  installedAt?: string
}

export interface PluginData {
  id: string
  name?: string
  version?: string
  scope: string
  description?: string
  installedAt?: string
  installPath: string
  skills: SkillEntry[]
  commands: CommandEntry[]
  hooks: HookEntry[]
  agents: AgentEntry[]
}

// ─── parsePluginManifest ─────────────────────────────────────────────────────

export function parsePluginManifest(json: string): PluginManifest | null {
  try {
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object' || !parsed.name) return null
    return {
      name: parsed.name,
      version: parsed.version,
      description: parsed.description,
    }
  } catch {
    return null
  }
}

// ─── parseSkillFrontmatter ───────────────────────────────────────────────────

export function parseSkillFrontmatter(
  content: string,
  dirName?: string
): SkillEntry | null {
  try {
    const { data, content: body } = matter(content)
    if (!data || typeof data !== 'object') return null
    const name = data.name || dirName
    if (!name) return null
    // Collect all frontmatter fields except name/description as metadata
    const rest = Object.fromEntries(
      Object.entries(data).filter(([k]) => !['name', 'description'].includes(k))
    )
    const metadata = Object.keys(rest).length > 0 ? rest : undefined
    return {
      name,
      description: data.description,
      body: body.trim() || undefined,
      metadata,
    }
  } catch {
    return null
  }
}

// ─── parseCommandFrontmatter ─────────────────────────────────────────────────

export function parseCommandFrontmatter(
  content: string,
  _fileName: string
): CommandEntry | null {
  if (!content || !content.trim()) return null
  try {
    const { data, content: body } = matter(content)
    if (!data || typeof data !== 'object') return null
    if (!data.description) return null
    return {
      name: _fileName,
      description: data.description,
      argHint: data['argument-hint'],
      allowedTools: data['allowed-tools'],
      delegatesTo: data['delegates-to'],
      body: body.trim() || undefined,
    }
  } catch {
    return null
  }
}

// ─── parseAgentFrontmatter ───────────────────────────────────────────────────

export function parseAgentFrontmatter(
  content: string,
  fileName: string
): AgentEntry | null {
  if (!content || !content.trim()) return null
  try {
    const { data, content: body } = matter(content)
    if (!data || typeof data !== 'object') return null
    const name = data.name || fileName.replace(/\.md$/, '')
    if (!name) return null
    const rest = Object.fromEntries(
      Object.entries(data).filter(
        ([k]) => !['name', 'description', 'model', 'tools'].includes(k)
      )
    )
    const metadata = Object.keys(rest).length > 0 ? rest : undefined
    return {
      name,
      description: data.description,
      model: data.model,
      tools: data.tools,
      body: body.trim() || undefined,
      metadata,
    }
  } catch {
    return null
  }
}

// ─── parseHooksJson ──────────────────────────────────────────────────────────

export function parseHooksJson(json: string): HookEntry[] {
  try {
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object' || !parsed.hooks) return []
    const hooks = parsed.hooks
    const entries: HookEntry[] = []

    for (const [trigger, matcherList] of Object.entries(hooks)) {
      if (!Array.isArray(matcherList)) continue
      for (const matcherEntry of matcherList) {
        const m = matcherEntry as Record<string, unknown>
        const matcher = m.matcher as string | undefined
        const description = matcher ? `${trigger}: ${matcher}` : trigger

        // Extract commands from hook definitions
        const commands: string[] = []
        const hookDefs = m.hooks as Array<Record<string, unknown>> | undefined
        if (Array.isArray(hookDefs)) {
          for (const h of hookDefs) {
            if (typeof h.command === 'string') {
              commands.push(h.command)
            }
          }
        }

        entries.push({
          name: `${trigger}${matcher ? `:${matcher}` : ''}`,
          description,
          triggers: [trigger],
          commands: commands.length > 0 ? commands : undefined,
        })
      }
    }
    return entries
  } catch {
    return []
  }
}

// ─── parseInstalledPlugins ───────────────────────────────────────────────────

export function parseInstalledPlugins(json: string): InstalledPlugin[] {
  try {
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object' || !parsed.plugins) return []
    const plugins = parsed.plugins
    const home = os.homedir()
    const entries: InstalledPlugin[] = []

    for (const [id, installs] of Object.entries(plugins)) {
      if (!Array.isArray(installs) || installs.length === 0) continue
      const install = installs[0] as Record<string, unknown>
      const installPath = (install.installPath as string) ?? ''
      entries.push({
        id,
        scope: (install.scope as string) ?? 'user',
        installPath: installPath.replace(/^~/, home),
        version: install.version as string | undefined,
        installedAt: install.installedAt as string | undefined,
      })
    }
    return entries
  } catch {
    return []
  }
}

// ─── buildSetupItems ─────────────────────────────────────────────────────────

import type { SetupItem } from '../../composables/useSetup'

export function buildSetupItems(pluginDataList: PluginData[]): SetupItem[] {
  const items: SetupItem[] = []

  for (const pd of pluginDataList) {
    const childIds: string[] = []

    // Build skill items
    for (const skill of pd.skills) {
      const id = `${pd.id}:${skill.name}`
      childIds.push(id)
      items.push({
        id,
        name: skill.name,
        type: 'skill',
        plugin: pd.id,
        description: skill.description,
        body: skill.body,
        metadata: skill.metadata,
        files: skill.files,
        usage: 0,
      })
    }

    // Build command items
    for (const cmd of pd.commands) {
      const id = `${pd.id}:cmd:${cmd.name}`
      childIds.push(id)
      items.push({
        id,
        name: cmd.name,
        type: 'command',
        plugin: pd.id,
        description: cmd.description,
        argHint: cmd.argHint,
        allowedTools: cmd.allowedTools,
        delegatesTo: cmd.delegatesTo,
        body: cmd.body,
        usage: 0,
      })
    }

    // Build hook items
    for (const hook of pd.hooks) {
      const id = `${pd.id}:hook:${hook.name}`
      childIds.push(id)
      items.push({
        id,
        name: hook.name,
        type: 'hook',
        plugin: pd.id,
        description: hook.description,
        triggers: hook.triggers,
        body: hook.commands?.join('\n'),
        files: hook.files,
        usage: 0,
      })
    }

    // Build agent items
    for (const agent of pd.agents) {
      const id = `${pd.id}:agent:${agent.name}`
      childIds.push(id)
      items.push({
        id,
        name: agent.name,
        type: 'agent',
        plugin: pd.id,
        description: agent.description,
        model: agent.model,
        tools: agent.tools,
        body: agent.body,
        metadata: agent.metadata,
        usage: 0,
      })
    }

    // Build plugin item
    items.push({
      id: pd.id,
      name: pd.name ?? pd.id,
      type: 'plugin',
      version: pd.version,
      scope: pd.scope,
      description: pd.description,
      usage: 0,
      installedAt: pd.installedAt,
      provides: childIds,
    })
  }

  return items
}

// ─── Serialization helpers (project items → disk) ───────────────────────────

/** Validate an item name: lowercase alphanumeric + hyphens only, max 64 chars. */
export function isValidItemName(name: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(name) && name.length <= 64
}

/** Serialize a skill back to SKILL.md frontmatter + body. */
export function serializeSkill(entry: {
  name?: string
  description?: string
  body?: string
  metadata?: Record<string, unknown>
}): string {
  const fm: Record<string, unknown> = {}
  if (entry.description) fm.description = entry.description
  if (entry.metadata) Object.assign(fm, entry.metadata)
  const yamlLines = Object.entries(fm)
    .map(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        const inner = Object.entries(v as Record<string, unknown>)
          .map(([sk, sv]) => `  ${sk}: ${JSON.stringify(sv)}`)
          .join('\n')
        return `${k}:\n${inner}`
      }
      return `${k}: ${JSON.stringify(v)}`
    })
    .join('\n')
  const frontmatter = yamlLines ? `---\n${yamlLines}\n---\n` : ''
  const body = entry.body?.trim() ?? ''
  return body ? `${frontmatter}\n${body}\n` : frontmatter
}

/** Serialize a command back to markdown frontmatter + body. */
export function serializeCommand(entry: {
  description?: string
  argHint?: string
  allowedTools?: string
  delegatesTo?: string
  body?: string
}): string {
  const fm: Record<string, unknown> = {}
  if (entry.description) fm.description = entry.description
  if (entry.argHint) fm['argument-hint'] = entry.argHint
  if (entry.allowedTools) fm['allowed-tools'] = entry.allowedTools
  if (entry.delegatesTo) fm['delegates-to'] = entry.delegatesTo
  const yamlLines = Object.entries(fm)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n')
  const frontmatter = yamlLines ? `---\n${yamlLines}\n---\n` : ''
  const body = entry.body?.trim() ?? ''
  return body ? `${frontmatter}\n${body}\n` : frontmatter
}

/** Serialize an agent back to markdown frontmatter + body. */
export function serializeAgent(entry: {
  name?: string
  description?: string
  model?: string
  tools?: string
  body?: string
  metadata?: Record<string, unknown>
}): string {
  const fm: Record<string, unknown> = {}
  if (entry.name) fm.name = entry.name
  if (entry.description) fm.description = entry.description
  if (entry.model) fm.model = entry.model
  if (entry.tools) fm.tools = entry.tools
  if (entry.metadata) Object.assign(fm, entry.metadata)
  const yamlLines = Object.entries(fm)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n')
  const frontmatter = yamlLines ? `---\n${yamlLines}\n---\n` : ''
  const body = entry.body?.trim() ?? ''
  return body ? `${frontmatter}\n${body}\n` : frontmatter
}
