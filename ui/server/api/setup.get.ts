import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {
  parseInstalledPlugins,
  parsePluginManifest,
  parseSkillFrontmatter,
  parseCommandFrontmatter,
  parseHooksJson,
  buildSetupItems,
} from '../utils/setup'
import type { PluginData } from '../utils/setup'
import { resolveDebussyPath } from '../utils/debussy'

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
      const skill = parseSkillFrontmatter(skillMd)
      if (skill) skills.push(skill)
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
    })
  }

  // 3. Scan project-level skills
  try {
    const projectSkillsDir = await resolveDebussyPath('.claude', 'skills')
    const projDirs = await safeReaddir(projectSkillsDir)
    const projSkills = []
    for (const dir of projDirs) {
      const dirPath = path.join(projectSkillsDir, dir)
      if (!(await isDirectory(dirPath))) continue
      const skillMd = await safeRead(path.join(dirPath, 'SKILL.md'))
      if (!skillMd) continue
      const skill = parseSkillFrontmatter(skillMd)
      if (skill) projSkills.push(skill)
    }

    if (projSkills.length > 0) {
      pluginDataList.push({
        id: 'project',
        name: 'Project Skills',
        scope: 'project',
        installPath: projectSkillsDir,
        skills: projSkills,
        commands: [],
        hooks: [],
      })
    }
  } catch {
    // No project-level skills — that's fine
  }

  // 4. Build and return SetupItem[]
  return buildSetupItems(pluginDataList)
})
