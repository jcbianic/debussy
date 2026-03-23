interface ProjectConfig {
  name: string
  path: string
  repoUrl: string
}

/**
 *
 */
export function useProjectConfig() {
  const { data } = useFetch<ProjectConfig>('/api/config')

  const name = computed(() => data.value?.name ?? '')
  const path = computed(() => data.value?.path ?? '')
  const repoUrl = computed(() => data.value?.repoUrl ?? '')

  return { name, path, repoUrl }
}
