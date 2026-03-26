export type StrateName = 'strategy' | 'product' | 'engineering' | 'work'

export type StrategyDepth = 'pitch' | 'foundation' | 'full'
export type EngineeringDepth = 'lite' | 'standard' | 'full'

export interface StrategyStrateConfig {
  depth: StrategyDepth
}

export interface EngineeringStrateConfig {
  depth: EngineeringDepth
}

export type StrateValue =
  | boolean
  | StrategyStrateConfig
  | EngineeringStrateConfig

export type StrateConfig = {
  strategy: StrateValue
  product: boolean
  engineering: StrateValue
  work: boolean
}

export const DEFAULT_STRATEGY_DEPTH: StrategyDepth = 'foundation'
export const DEFAULT_ENGINEERING_DEPTH: EngineeringDepth = 'standard'

export const DEFAULT_STRATES: StrateConfig = {
  strategy: { depth: DEFAULT_STRATEGY_DEPTH },
  product: true,
  engineering: { depth: DEFAULT_ENGINEERING_DEPTH },
  work: true,
}

export function isStrateEnabled(value: StrateValue): boolean {
  if (typeof value === 'boolean') return value
  return true
}

export function resolveStrategyDepth(value: StrateValue): StrategyDepth {
  if (typeof value === 'boolean') return DEFAULT_STRATEGY_DEPTH
  if ('depth' in value && typeof value.depth === 'string') {
    const d = value.depth
    if (d === 'pitch' || d === 'foundation' || d === 'full') return d
  }
  return DEFAULT_STRATEGY_DEPTH
}

export function resolveEngineeringDepth(value: StrateValue): EngineeringDepth {
  if (typeof value === 'boolean') return DEFAULT_ENGINEERING_DEPTH
  if ('depth' in value && typeof value.depth === 'string') {
    const d = value.depth
    if (d === 'lite' || d === 'standard' || d === 'full') return d
  }
  return DEFAULT_ENGINEERING_DEPTH
}

export const STRATEGY_DEPTH_DOCUMENTS: Record<StrategyDepth, string[]> = {
  pitch: ['pitch'],
  foundation: ['vision', 'problem-space', 'landscape'],
  full: [
    'vision',
    'strategy',
    'audiences',
    'problems',
    'landscape',
    'opportunities',
  ],
}

export const ENGINEERING_DEPTH_DOCUMENTS: Record<EngineeringDepth, string[]> = {
  lite: ['policies'],
  standard: ['policies', 'principles'],
  full: ['policies', 'principles', 'decisions'],
}

// ─── Strategy manifest ──────────────────────────────────────────────────────

export interface ManifestEntry {
  key: string
}

export interface StrategyManifest {
  depth: StrategyDepth
  createdAt: string
  updatedAt: string
  artifacts: ManifestEntry[]
  subdirectories?: { competitors?: string[]; allies?: string[] }
  custom?: ManifestEntry[]
}
