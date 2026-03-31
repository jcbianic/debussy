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
} from '../../utils/setup'
import type { PluginData } from '../../utils/setup'
import { resolveDebussyPath } from '../../utils/debussy'
import { readUsageData, countBySkill, countByAgent } from '../../utils/usage'

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

const SCAN_MAX_DEPTH = 10
const SCAN_MAX_FILES = 500
const SCAN_MAX_FILE_BYTES = 512 * 1024 // 512 KB

async function scanSkillFiles(
  dirPath: string
): Promise<{ relativePath: string; content: string }[]> {
  const results: { relativePath: string; content: string }[] = []

  async function walk(current: string, prefix: string, depth: number) {
    if (depth > SCAN_MAX_DEPTH || results.length >= SCAN_MAX_FILES) return
    const entries = await safeReaddir(current)
    for (const entry of entries) {
      if (results.length >= SCAN_MAX_FILES) break
      const fullPath = path.join(current, entry)
      const rel = prefix ? `${prefix}/${entry}` : entry
      if (await isDirectory(fullPath)) {
        await walk(fullPath, rel, depth + 1)
      } else {
        // Skip SKILL.md (already parsed as body) and binary files
        if (entry === 'SKILL.md') continue
        if (BINARY_EXTENSIONS.has(path.extname(entry).toLowerCase())) continue
        // Skip files that exceed the size limit
        try {
          const s = await stat(fullPath)
          if (s.size > SCAN_MAX_FILE_BYTES) continue
        } catch {
          continue
        }
        const content = await safeRead(fullPath)
        if (content !== null) {
          results.push({ relativePath: rel, content })
        }
      }
    }
  }

  await walk(dirPath, '', 0)
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
    const rawPath = plugin.installPath
    // Validate: must be absolute and resolve to within home directory
    if (!rawPath || !path.isAbsolute(rawPath)) continue
    const root = path.resolve(rawPath)
    const home = os.homedir()
    if (root !== home && !root.startsWith(home + path.sep)) continue

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

    // Read hooks and resolve script files
    const hooksJson = await safeRead(path.join(root, 'hooks', 'hooks.json'))
    const hooks = hooksJson ? parseHooksJson(hooksJson) : []

    for (const hook of hooks) {
      if (!hook.commands?.length) continue
      const seen = new Set<string>()
      const files: { relativePath: string; content: string }[] = []
      for (const cmd of hook.commands) {
        // Resolve ${CLAUDE_PLUGIN_ROOT} to actual plugin path
        const resolved = cmd.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, root)
        // If the resolved command points to a file, read it
        const scriptPath = resolved.split(/\s+/)[0]!
        if (!scriptPath || seen.has(scriptPath)) continue
        seen.add(scriptPath)
        if (await isDirectory(scriptPath)) continue
        const content = await safeRead(scriptPath)
        if (content !== null) {
          const relativePath = scriptPath.startsWith(root)
            ? scriptPath.slice(root.length + 1)
            : path.basename(scriptPath)
          files.push({ relativePath, content })
        }
      }
      if (files.length > 0) hook.files = files
    }

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

    // Assign scoped counts first, then bare-name counts once per unique name
    // to avoid double-counting when the same name exists in multiple plugins
    const bareSkillClaimed = new Set<string>()
    const bareAgentClaimed = new Set<string>()
    for (const item of items) {
      if ((item.type === 'skill' || item.type === 'command') && item.plugin) {
        const scoped = `${item.plugin.split('@')[0]}:${item.name}`
        item.usage = skillCounts[scoped] ?? 0
        if (!bareSkillClaimed.has(item.name)) {
          item.usage += skillCounts[item.name] ?? 0
          bareSkillClaimed.add(item.name)
        }
      } else if (item.type === 'agent' && item.plugin) {
        const scoped = `${item.plugin.split('@')[0]}:${item.name}`
        item.usage = agentCounts[scoped] ?? 0
        if (!bareAgentClaimed.has(item.name)) {
          item.usage += agentCounts[item.name] ?? 0
          bareAgentClaimed.add(item.name)
        }
      } else if (item.type === 'agent') {
        item.usage = agentCounts[item.name] ?? 0
      }
    }
  } catch {
    // No usage data available — items keep usage: 0
  }

  return items
})
