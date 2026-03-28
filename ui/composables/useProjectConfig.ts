import {
  DEFAULT_STRATES,
  DEFAULT_STRATEGY_DEPTH,
  DEFAULT_ENGINEERING_DEPTH,
  isStrateEnabled as _isEnabled,
  resolveStrategyDepth,
  resolveEngineeringDepth,
} from '~~/types/config'
import type {
  StrateName,
  StrateConfig,
  OptionsConfig,
  StrategyDepth,
  EngineeringDepth,
} from '~~/types/config'

interface ProjectConfig {
  name: string
  description: string
  path: string
  repoUrl: string
  strates: StrateConfig
  options: OptionsConfig
}

/**
 *
 */
export function useProjectConfig() {
  const { data, refresh } = useFetch<ProjectConfig>('/api/config')

  const name = computed(() => data.value?.name ?? '')
  const description = computed(() => data.value?.description ?? '')
  const path = computed(() => data.value?.path ?? '')
  const repoUrl = computed(() => data.value?.repoUrl ?? '')
  const strates = computed<StrateConfig>(
    () => data.value?.strates ?? { ...DEFAULT_STRATES }
  )
  const options = computed<OptionsConfig>(
    () => data.value?.options ?? { statusline: true }
  )

  function isStrateEnabled(strate: StrateName): boolean {
    const val = strates.value[strate]
    if (val === undefined) return true
    return _isEnabled(val)
  }

  const strategyDepth = computed<StrategyDepth>(() => {
    const val = strates.value.strategy
    if (!val) return DEFAULT_STRATEGY_DEPTH
    return resolveStrategyDepth(val)
  })

  const engineeringDepth = computed<EngineeringDepth>(() => {
    const val = strates.value.engineering
    if (!val) return DEFAULT_ENGINEERING_DEPTH
    return resolveEngineeringDepth(val)
  })

  return {
    name,
    description,
    path,
    repoUrl,
    strates,
    options,
    isStrateEnabled,
    strategyDepth,
    engineeringDepth,
    refresh,
  }
}
