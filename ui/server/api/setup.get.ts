import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {
  parseInstalledPlugins,
  parsePluginManifest,
  parseSkillFrontmatter,
  parseCommandFrontmatter,
  parseAgentFrontmatter,
  parseHooksJson,
  buildSetupItems,
} from '../utils/setup'
import type { PluginData } from '../utils/setup'
import { resolveDebussyPath } from '../utils/debussy'
import { readUsageData, countBySkill, countByAgent } from '../utils/usage'

async function safeRead(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf8')
  } catch {
    return null
  }
}

async function safeReaddir(dirPath: string): Promise<string[]> {
  try {
    return await readdir(dirPath)
  } catch {
    return []
  }
}

async function isDirectory(p: string): Promise<boolean> {
  try {
    const s = await stat(p)
    return s.isDirectory()
  } catch {
    return false
  }
}

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.webp',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.zip',
  '.tar',
  '.gz',
  '.bz2',
  '.pdf',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
])

async function scanSkillFiles(
  dirPath: string
): Promise<{ relativePath: string; content: string }[]> {
  const results: { relativePath: string; content: string }[] = []

  async function walk(current: string, prefix: string) {
    const entries = await safeReaddir(current)
    for (const entry of entries) {
      const fullPath = path.join(current, entry)
      const rel = prefix ? `${prefix}/${entry}` : entry
      if (await isDirectory(fullPath)) {
        await walk(fullPath, rel)
      } else {
        // Skip SKILL.md (already parsed as body) and binary files
        if (entry === 'SKILL.md') continue
        if (BINARY_EXTENSIONS.has(path.extname(entry).toLowerCase())) continue
        const content = await safeRead(fullPath)
        if (content !== null) {
          results.push({ relativePath: rel, content })
        }
      }
    }
  }

  await walk(dirPath, '')
  return results
}

export default defineEventHandler(async () => {
  const pluginDataList: PluginData[] = []

  // 1. Read installed plugins
  const installedPluginsPath = path.join(
    os.homedir(),
    '.claude',
    'plugins',
    'installed_plugins.json'
  )
  const installedJson = await safeRead(installedPluginsPath)
  const installedPlugins = installedJson
    ? parseInstalledPlugins(installedJson)
    : []

  // ── Helpers to scan skills / commands / agents from a directory ──

  async function scanSkillsIn(baseDir: string) {
    const dirs = await safeReaddir(baseDir)
    const results = []
    for (const dir of dirs) {
      const dirPath = path.join(baseDir, dir)
      if (!(await isDirectory(dirPath))) continue
      const skillMd = await safeRead(path.join(dirPath, 'SKILL.md'))
      if (!skillMd) continue
      const skill = parseSkillFrontmatter(skillMd, dir)
      if (skill) {
        skill.files = await scanSkillFiles(dirPath)
        results.push(skill)
      }
    }
    return results
  }

  async function scanCommandsIn(baseDir: string) {
    const files = await safeReaddir(baseDir)
    const results = []
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const content = await safeRead(path.join(baseDir, file))
      if (!content) continue
      const cmd = parseCommandFrontmatter(content, file.replace(/\.md$/, ''))
      if (cmd) results.push(cmd)
    }
    return results
  }

  async function scanAgentsIn(baseDir: string) {
    const files = await safeReaddir(baseDir)
    const results = []
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const content = await safeRead(path.join(baseDir, file))
      if (!content) continue
      const agent = parseAgentFrontmatter(content, file)
      if (agent) results.push(agent)
    }
    return results
  }

  // 2. For each plugin, read manifest, skills, commands, hooks, agents
  //    Plugins may use root-level layout (skills/, commands/, agents/)
  //    or .claude/ layout (.claude/skills/, .claude/commands/, .claude/agents/)
  //    Manifest may be at .claude-plugin/plugin.json or plugin.json
  for (const plugin of installedPlugins) {
    const root = plugin.installPath

    // Manifest: try .claude-plugin/plugin.json first, then plugin.json
    const manifest =
      (await safeRead(path.join(root, '.claude-plugin', 'plugin.json'))) ??
      (await safeRead(path.join(root, 'plugin.json')))
    const parsed = manifest ? parsePluginManifest(manifest) : null

    // Scan skills from both root/skills/ and root/.claude/skills/
    const seen = new Set<string>()
    const skills = []
    for (const dir of [
      path.join(root, 'skills'),
      path.join(root, '.claude', 'skills'),
    ]) {
      for (const s of await scanSkillsIn(dir)) {
        if (!seen.has(s.name)) {
          seen.add(s.name)
          skills.push(s)
        }
      }
    }

    // Scan commands from both locations
    const seenCmd = new Set<string>()
    const commands = []
    for (const dir of [
      path.join(root, 'commands'),
      path.join(root, '.claude', 'commands'),
    ]) {
      for (const c of await scanCommandsIn(dir)) {
        if (!seenCmd.has(c.name)) {
          seenCmd.add(c.name)
          commands.push(c)
        }
      }
    }

    // Scan agents from both locations
    const seenAgent = new Set<string>()
    const agents = []
    for (const dir of [
      path.join(root, 'agents'),
      path.join(root, '.claude', 'agents'),
    ]) {
      for (const a of await scanAgentsIn(dir)) {
        if (!seenAgent.has(a.name)) {
          seenAgent.add(a.name)
          agents.push(a)
        }
      }
    }

    // Read hooks
    const hooksJson = await safeRead(path.join(root, 'hooks', 'hooks.json'))
    const hooks = hooksJson ? parseHooksJson(hooksJson) : []

    pluginDataList.push({
      id: plugin.id,
      name: parsed?.name,
      version: parsed?.version ?? plugin.version,
      scope: plugin.scope,
      description: parsed?.description,
      installedAt: plugin.installedAt,
      installPath: root,
      skills,
      commands,
      hooks,
      agents,
    })
  }

  // 3. Scan project-level skills, commands, and agents
  try {
    const projectRoot = await resolveDebussyPath('.claude')
    const projSkills = await scanSkillsIn(path.join(projectRoot, 'skills'))
    const projCommands = await scanCommandsIn(
      path.join(projectRoot, 'commands')
    )
    const projAgents = await scanAgentsIn(path.join(projectRoot, 'agents'))

    if (
      projSkills.length > 0 ||
      projCommands.length > 0 ||
      projAgents.length > 0
    ) {
      pluginDataList.push({
        id: 'project',
        name: 'Project',
        scope: 'project',
        installPath: projectRoot,
        skills: projSkills,
        commands: projCommands,
        hooks: [],
        agents: projAgents,
      })
    }
  } catch {
    // No project-level .claude directory — that's fine
  }

  // 4. Build SetupItem[]
  const items = buildSetupItems(pluginDataList)

  // 5. Enrich with usage data
  try {
    const usageDir = await resolveDebussyPath('.debussy', 'usage')
    const events = await readUsageData(usageDir)
    const skillCounts = countBySkill(events)
    const agentCounts = countByAgent(events)

    for (const item of items) {
      if (item.type === 'skill' && item.plugin) {
        // Match "debussy:strategy" or just "strategy"
        const scoped = `${item.plugin.split('@')[0]}:${item.name}`
        item.usage = (skillCounts[scoped] ?? 0) + (skillCounts[item.name] ?? 0)
      } else if (item.type === 'agent') {
        item.usage = agentCounts[item.name] ?? 0
      }
    }
  } catch {
    // No usage data available — items keep usage: 0
  }

  return items
})
