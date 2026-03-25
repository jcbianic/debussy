export type StrateName = 'strategy' | 'engineering'

export type StrateConfig = Record<StrateName, boolean>

export const DEFAULT_STRATES: StrateConfig = {
  strategy: true,
  engineering: true,
}
