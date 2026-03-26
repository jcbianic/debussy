import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { stringify as stringifyYaml } from 'yaml'
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

interface ConfigureBody {
  project: {
    name: string
    description: string
  }
  strates: {
    strategy?: boolean | { depth?: string }
    product?: boolean
    engineering?: boolean | { depth?: string }
    work?: boolean
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ConfigureBody>(event)

  if (!body?.project?.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'project.name is required',
    })
  }

  const root = await resolveDebussyPath()
  const debussyDir = path.join(root, '.debussy')

  // Merge with defaults
  const strates: StrateConfig = {
    strategy: { depth: DEFAULT_STRATEGY_DEPTH },
    product: DEFAULT_STRATES.product,
    engineering: { depth: DEFAULT_ENGINEERING_DEPTH },
    work: DEFAULT_STRATES.work,
  }

  if (body.strates && typeof body.strates === 'object') {
    // Strategy: accept boolean (legacy) or { depth }
    const s = body.strates.strategy
    if (s === false) {
      strates.strategy = false
    } else if (s && typeof s === 'object' && 'depth' in s) {
      const d = s.depth
      if (d === 'pitch' || d === 'foundation' || d === 'full') {
        strates.strategy = { depth: d as StrategyDepth }
      }
    } else if (s === true) {
      strates.strategy = { depth: DEFAULT_STRATEGY_DEPTH }
    }

    // Product: boolean toggle
    if (typeof body.strates.product === 'boolean') {
      strates.product = body.strates.product
    }

    // Engineering: accept boolean or { depth }
    const e = body.strates.engineering
    if (e === false) {
      strates.engineering = false
    } else if (e && typeof e === 'object' && 'depth' in e) {
      const d = e.depth
      if (d === 'lite' || d === 'standard' || d === 'full') {
        strates.engineering = { depth: d as EngineeringDepth }
      }
    } else if (e === true) {
      strates.engineering = { depth: DEFAULT_ENGINEERING_DEPTH }
    }

    // Work: boolean toggle (always-on by default)
    if (typeof body.strates.work === 'boolean') {
      strates.work = body.strates.work
    }
  }

  const config = {
    project: {
      name: body.project.name,
      description: body.project.description || '',
    },
    strates,
  }

  await mkdir(debussyDir, { recursive: true })
  await writeFile(
    path.join(debussyDir, 'config.yaml'),
    stringifyYaml(config),
    'utf8'
  )

  return { ok: true, config }
})
