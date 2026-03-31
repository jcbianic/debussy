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

  // 2. For each plugin, read manifest, skills, commands, hooks
  for (const plugin of installedPlugins) {
    const manifest = await safeRead(
      path.join(plugin.installPath, 'plugin.json')
    )
    const parsed = manifest ? parsePluginManifest(manifest) : null

    // Scan skills
    const skillsDir = path.join(plugin.installPath, '.claude', 'skills')
    const skillDirs = await safeReaddir(skillsDir)
    const skills = []
    for (const dir of skillDirs) {
      const dirPath = path.join(skillsDir, dir)
      if (!(await isDirectory(dirPath))) continue
      const skillMd = await safeRead(path.join(dirPath, 'SKILL.md'))
      if (!skillMd) continue
      const skill = parseSkillFrontmatter(skillMd, dir)
      if (skill) {
        skill.files = await scanSkillFiles(dirPath)
        skills.push(skill)
      }
    }

    // Scan commands
    const commandsDir = path.join(plugin.installPath, '.claude', 'commands')
    const commandFiles = await safeReaddir(commandsDir)
    const commands = []
    for (const file of commandFiles) {
      if (!file.endsWith('.md')) continue
      const content = await safeRead(path.join(commandsDir, file))
      if (!content) continue
      const cmdName = file.replace(/\.md$/, '')
      const cmd = parseCommandFrontmatter(content, cmdName)
      if (cmd) commands.push(cmd)
    }

    // Scan agents
    const agentsDir = path.join(plugin.installPath, '.claude', 'agents')
    const agentFiles = await safeReaddir(agentsDir)
    const agents = []
    for (const file of agentFiles) {
      if (!file.endsWith('.md')) continue
      const content = await safeRead(path.join(agentsDir, file))
      if (!content) continue
      const agent = parseAgentFrontmatter(content, file)
      if (agent) agents.push(agent)
    }

    // Read hooks
    const hooksJson = await safeRead(
      path.join(plugin.installPath, 'hooks', 'hooks.json')
    )
    const hooks = hooksJson ? parseHooksJson(hooksJson) : []

    pluginDataList.push({
      id: plugin.id,
      name: parsed?.name,
      version: parsed?.version ?? plugin.version,
      scope: plugin.scope,
      description: parsed?.description,
      installedAt: plugin.installedAt,
      installPath: plugin.installPath,
      skills,
      commands,
      hooks,
      agents,
    })
  }

  // 3. Scan project-level skills, commands, and agents
  try {
    const projectRoot = await resolveDebussyPath('.claude')

    // Skills
    const projectSkillsDir = path.join(projectRoot, 'skills')
    const projDirs = await safeReaddir(projectSkillsDir)
    const projSkills = []
    for (const dir of projDirs) {
      const dirPath = path.join(projectSkillsDir, dir)
      if (!(await isDirectory(dirPath))) continue
      const skillMd = await safeRead(path.join(dirPath, 'SKILL.md'))
      if (!skillMd) continue
      const skill = parseSkillFrontmatter(skillMd, dir)
      if (skill) {
        skill.files = await scanSkillFiles(dirPath)
        projSkills.push(skill)
      }
    }

    // Commands
    const projectCommandsDir = path.join(projectRoot, 'commands')
    const projCmdFiles = await safeReaddir(projectCommandsDir)
    const projCommands = []
    for (const file of projCmdFiles) {
      if (!file.endsWith('.md')) continue
      const content = await safeRead(path.join(projectCommandsDir, file))
      if (!content) continue
      const cmdName = file.replace(/\.md$/, '')
      const cmd = parseCommandFrontmatter(content, cmdName)
      if (cmd) projCommands.push(cmd)
    }

    // Agents
    const projectAgentsDir = path.join(projectRoot, 'agents')
    const projAgentFiles = await safeReaddir(projectAgentsDir)
    const projAgents = []
    for (const file of projAgentFiles) {
      if (!file.endsWith('.md')) continue
      const content = await safeRead(path.join(projectAgentsDir, file))
      if (!content) continue
      const agent = parseAgentFrontmatter(content, file)
      if (agent) projAgents.push(agent)
    }

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
