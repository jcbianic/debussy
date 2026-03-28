import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import {
  DEFAULT_STRATES,
  DEFAULT_STRATEGY_DEPTH,
  DEFAULT_ENGINEERING_DEPTH,
} from '~~/types/config'
import type {
  StrateConfig,
  StrategyDepth,
  EngineeringDepth,
} from '~~/types/config'

function parseStrategyValue(raw: unknown): StrateConfig['strategy'] {
  if (raw === false) return false
  if (raw === true) return { depth: DEFAULT_STRATEGY_DEPTH }
  if (raw && typeof raw === 'object' && 'depth' in raw) {
    const d = (raw as Record<string, unknown>).depth
    if (d === 'pitch' || d === 'foundation' || d === 'full')
      return { depth: d as StrategyDepth }
  }
  return { depth: DEFAULT_STRATEGY_DEPTH }
}

function parseEngineeringValue(raw: unknown): StrateConfig['engineering'] {
  if (raw === false) return false
  if (raw === true) return { depth: DEFAULT_ENGINEERING_DEPTH }
  if (raw && typeof raw === 'object' && 'depth' in raw) {
    const d = (raw as Record<string, unknown>).depth
    if (d === 'lite' || d === 'standard' || d === 'full')
      return { depth: d as EngineeringDepth }
  }
  return { depth: DEFAULT_ENGINEERING_DEPTH }
}

export default defineEventHandler(async () => {
  const root = await resolveDebussyPath()
  let name = 'debussy'
  let description = ''
  let repoUrl = ''
  const options = { statusline: true }
  const strates: StrateConfig = {
    strategy: { ...(DEFAULT_STRATES.strategy as { depth: StrategyDepth }) },
    product: DEFAULT_STRATES.product,
    engineering: {
      ...(DEFAULT_STRATES.engineering as { depth: EngineeringDepth }),
    },
    work: DEFAULT_STRATES.work,
  }

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
      // Detect legacy 2-strate format (no product/work keys, engineering is boolean)
      const hasNewFormat = 'product' in cfg.strates || 'work' in cfg.strates

      if (!hasNewFormat) {
        // Legacy: { strategy: bool|{depth}, engineering: bool }
        if ('strategy' in cfg.strates) {
          strates.strategy = parseStrategyValue(cfg.strates.strategy)
        }
        // Legacy engineering was a boolean — upgrade to depth config
        if (typeof cfg.strates.engineering === 'boolean') {
          strates.engineering = cfg.strates.engineering
            ? { depth: DEFAULT_ENGINEERING_DEPTH }
            : false
        }
        // Product defaults to true in legacy format
        strates.product = true
        strates.work = true
      } else {
        // New 4-strate format
        if ('strategy' in cfg.strates) {
          strates.strategy = parseStrategyValue(cfg.strates.strategy)
        }
        if (typeof cfg.strates.product === 'boolean') {
          strates.product = cfg.strates.product
        }
        if ('engineering' in cfg.strates) {
          strates.engineering = parseEngineeringValue(cfg.strates.engineering)
        }
        if (typeof cfg.strates.work === 'boolean') {
          strates.work = cfg.strates.work
        }
      }
    }
    if (cfg?.options && typeof cfg.options === 'object') {
      if (typeof cfg.options.statusline === 'boolean') {
        options.statusline = cfg.options.statusline
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

  return { name, description, path: root, repoUrl, strates, options }
})
