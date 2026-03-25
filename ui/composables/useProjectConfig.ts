import { DEFAULT_STRATES } from '~~/types/config'
import type { StrateName, StrateConfig } from '~~/types/config'

interface ProjectConfig {
  name: string
  description: string
  path: string
  repoUrl: string
  strates: StrateConfig
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

  function isStrateEnabled(strate: StrateName): boolean {
    return strates.value[strate] ?? true
  }

  return { name, description, path, repoUrl, strates, isStrateEnabled, refresh }
}
