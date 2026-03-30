import matter from 'gray-matter'
import os from 'node:os'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PluginManifest {
  name: string
  version?: string
  description?: string
}

export interface SkillEntry {
  name: string
  description?: string
}

export interface CommandEntry {
  name: string
  description?: string
  argHint?: string
  allowedTools?: string
  delegatesTo?: string
  body?: string
}

export interface HookEntry {
  name: string
  description: string
  triggers: string[]
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

export function parseSkillFrontmatter(content: string): SkillEntry | null {
  try {
    const { data } = matter(content)
    if (!data || typeof data !== 'object') return null
    if (!data.name) return null
    return {
      name: data.name,
      description: data.description,
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
        entries.push({
          name: `${trigger}${matcher ? `:${matcher}` : ''}`,
          description,
          triggers: [trigger],
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
