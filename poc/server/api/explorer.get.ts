import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, relative, resolve } from 'path'
import { homedir } from 'os'

interface SkillInfo {
  name: string
  description: string
  version?: string
  source: 'project' | 'user'
  path: string
  files: string[]
}

interface MdFile {
  name: string
  path: string
  size: number
  modified: string
  preview: string
}

function parseSkillMd(skillDir: string): { name: string; description: string; version?: string } {
  const skillMd = join(skillDir, 'SKILL.md')
  if (!existsSync(skillMd)) return { name: '', description: '' }

  const content = readFileSync(skillMd, 'utf-8')
  // Parse YAML frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return { name: '', description: '' }

  const frontmatter = match[1]
  const name = frontmatter.match(/name:\s*(.+)/)?.[1]?.trim() || ''
  const descMatch = frontmatter.match(/description:\s*>-?\n([\s\S]*?)(?=\n\w|\n---)/)?.[1]?.trim()
    || frontmatter.match(/description:\s*(.+)/)?.[1]?.trim() || ''
  const version = frontmatter.match(/version:\s*"?(.+?)"?\s*$/m)?.[1]?.trim()

  return { name, description: descMatch.replace(/\n\s+/g, ' '), version }
}

function listFilesRecursive(dir: string, base: string): string[] {
  if (!existsSync(dir)) return []
  const result: string[] = []
  try {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      try {
        const stat = statSync(full)
        if (stat.isDirectory()) {
          result.push(...listFilesRecursive(full, base))
        } else {
          result.push(relative(base, full))
        }
      } catch {}
    }
  } catch {}
  return result
}

function getSkills(dir: string, source: 'project' | 'user'): SkillInfo[] {
  if (!existsSync(dir)) return []
  const skills: SkillInfo[] = []

  try {
    for (const name of readdirSync(dir)) {
      const skillDir = join(dir, name)
      try {
        if (!statSync(skillDir).isDirectory()) continue
      } catch { continue }

      const meta = parseSkillMd(skillDir)
      skills.push({
        name: meta.name || name,
        description: meta.description,
        version: meta.version,
        source,
        path: skillDir,
        files: listFilesRecursive(skillDir, skillDir),
      })
    }
  } catch {}

  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

function getMdFiles(projectRoot: string): MdFile[] {
  const files: MdFile[] = []
  const dirs = [projectRoot, join(projectRoot, 'specs'), join(projectRoot, '.tessl')]

  for (const dir of dirs) {
    if (!existsSync(dir)) continue
    try {
      for (const name of readdirSync(dir)) {
        if (!name.endsWith('.md')) continue
        const full = join(dir, name)
        try {
          const stat = statSync(full)
          if (!stat.isFile()) continue
          const content = readFileSync(full, 'utf-8')
          files.push({
            name,
            path: relative(projectRoot, full),
            size: stat.size,
            modified: stat.mtime.toISOString(),
            preview: content.slice(0, 500),
          })
        } catch {}
      }
    } catch {}
  }

  // Also find .tessl rules markdown files
  const rulesDir = join(projectRoot, '.tessl', 'tiles')
  if (existsSync(rulesDir)) {
    const mdFiles = listFilesRecursive(rulesDir, projectRoot).filter(f => f.endsWith('.md'))
    for (const relPath of mdFiles) {
      const full = join(projectRoot, relPath)
      try {
        const stat = statSync(full)
        const content = readFileSync(full, 'utf-8')
        files.push({
          name: relPath.split('/').pop()!,
          path: relPath,
          size: stat.size,
          modified: stat.mtime.toISOString(),
          preview: content.slice(0, 500),
        })
      } catch {}
    }
  }

  return files.sort((a, b) => a.name.localeCompare(b.name))
}

export default defineEventHandler(async () => {
  const projectRoot = process.env.PROJECT_ROOT || resolve(process.cwd(), '..')
  const homeDir = homedir()

  const projectSkillsDir = join(projectRoot, '.claude', 'skills')
  const userSkillsDir = join(homeDir, '.claude', 'skills')

  return {
    skills: [
      ...getSkills(projectSkillsDir, 'project'),
      ...getSkills(userSkillsDir, 'user'),
    ],
    mdFiles: getMdFiles(projectRoot),
  }
})
