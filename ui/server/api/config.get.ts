import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { DEFAULT_STRATES } from '~~/types/config'
import type { StrateConfig } from '~~/types/config'

export default defineEventHandler(async () => {
  const root = await resolveDebussyPath()
  let name = 'debussy'
  let description = ''
  let repoUrl = ''
  const strates: StrateConfig = { ...DEFAULT_STRATES }

  // Read .debussy/config.yaml
  try {
    const raw = await readFile(
      path.join(root, '.debussy', 'config.yaml'),
      'utf8'
    )
    const cfg = parseYaml(raw)
    if (cfg?.project?.name) name = cfg.project.name
    if (cfg?.project?.description) description = cfg.project.description
    if (cfg?.strates && typeof cfg.strates === 'object') {
      // Detect legacy 4-strate format (presence of roadmap/architecture/policy keys)
      const isLegacyFormat =
        'roadmap' in cfg.strates ||
        'architecture' in cfg.strates ||
        'policy' in cfg.strates

      if (isLegacyFormat) {
        strates.strategy =
          cfg.strates.strategy === true || cfg.strates.roadmap === true
        strates.engineering =
          cfg.strates.architecture === true || cfg.strates.policy === true
      } else {
        for (const key of Object.keys(DEFAULT_STRATES)) {
          if (typeof cfg.strates[key] === 'boolean') {
            strates[key as keyof StrateConfig] = cfg.strates[key]
          }
        }
      }
    }
  } catch {
    // config.yaml missing — fall back to package.json + all strates enabled
  }

  // Fall back to package.json for name/repoUrl if not set by config.yaml
  try {
    const pkg = JSON.parse(
      await readFile(path.join(root, 'package.json'), 'utf8')
    )
    if (name === 'debussy' && typeof pkg.name === 'string' && pkg.name)
      name = pkg.name
    const repo = pkg.repository
    if (typeof repo === 'string') repoUrl = repo
    else if (typeof repo?.url === 'string') repoUrl = repo.url
  } catch {
    // package.json missing or unreadable — use defaults
  }

  return { name, description, path: root, repoUrl, strates }
})
