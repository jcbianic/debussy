/** A single deliverable scoped to one release. */
export interface Intent {
  id: string
  title: string
  /** Which pain point or audience segment this intent addresses. */
  addresses: string
  state: 'done' | 'in-progress' | 'open' | 'out-of-scope'
  lane?: string
  laneId?: string
  issue?: number
  priority?: string
  description?: string
  doneWhen?: string
}

/** A versioned group of intents shipped together. */
export interface Release {
  id: string
  name: string
  theme: string
  intents: Intent[]
}

/** Derive the overall status label for a release. */
export function releaseStatus(
  r: Release
): 'shipped' | 'in progress' | 'backlog' | 'planned' {
  const active = r.intents.filter((i) => i.state !== 'out-of-scope')
  if (active.every((i) => i.state === 'done')) return 'shipped'
  if (active.some((i) => i.state === 'in-progress')) return 'in progress'
  if (r.id === 'backlog') return 'backlog'
  return 'planned'
}

/** Map release status to Nuxt UI badge color token. */
export function releaseStatusColor(
  r: Release
): 'success' | 'primary' | 'neutral' {
  const s = releaseStatus(r)
  if (s === 'shipped') return 'success'
  if (s === 'in progress') return 'primary'
  return 'neutral'
}

/** Count non-out-of-scope intents in a release. */
export function meaningfulCount(r: Release): number {
  return r.intents.filter((i) => i.state !== 'out-of-scope').length
}

/** Provide roadmap data, computed state, and mutation helpers. */
export const useRoadmap = () => {
  const { data: releasesData, refresh } = useFetch<Release[]>(
    '/api/roadmap/releases'
  )

  const releases = computed(() => releasesData.value ?? [])

  // Collapse state — past and backlog collapsed by default
  const collapsed = ref(new Set(['r0', 'backlog']))
  const toggleCollapse = (id: string) => {
    if (collapsed.value.has(id)) collapsed.value.delete(id)
    else collapsed.value.add(id)
    collapsed.value = new Set(collapsed.value)
  }

  const doneCount = (r: Release) =>
    r.intents.filter((i) => i.state === 'done').length

  const shippedReleases = computed(() =>
    releases.value.filter((r) => releaseStatus(r) === 'shipped')
  )
  const currentRelease = computed(
    () => releases.value.find((r) => releaseStatus(r) === 'in progress') ?? null
  )
  const plannedReleases = computed(() =>
    releases.value.filter((r) => releaseStatus(r) === 'planned')
  )

  const activeFilter = ref('all')
  const filterTabs = computed(() => [
    { value: 'all', label: 'All', count: releases.value.length },
    {
      value: 'shipped',
      label: 'Shipped',
      count: shippedReleases.value.length,
    },
    {
      value: 'current',
      label: 'Current',
      count: currentRelease.value ? 1 : 0,
    },
    {
      value: 'planned',
      label: 'Planned',
      count: plannedReleases.value.length,
    },
  ])

  const visibleReleases = computed(() => {
    if (activeFilter.value === 'all') return releases.value
    if (activeFilter.value === 'shipped') return shippedReleases.value
    if (activeFilter.value === 'current')
      return currentRelease.value ? [currentRelease.value] : []
    if (activeFilter.value === 'planned') return plannedReleases.value
    return releases.value
  })

  const selectedIntent = ref<Intent | null>(null)

  const syncing = ref(false)
  const triggerSync = async () => {
    syncing.value = true
    await new Promise((r) => setTimeout(r, 1800))
    syncing.value = false
  }

  const moveIntent = (
    intent: Intent,
    sourceRelease: Release,
    targetId: string
  ) => {
    const target = releases.value.find((r) => r.id === targetId)
    if (!target || target === sourceRelease) return
    sourceRelease.intents.splice(sourceRelease.intents.indexOf(intent), 1)
    target.intents.push(intent)
  }

  return {
    releases,
    collapsed,
    toggleCollapse,
    releaseStatus,
    releaseStatusColor,
    doneCount,
    meaningfulCount,
    shippedReleases,
    currentRelease,
    plannedReleases,
    activeFilter,
    filterTabs,
    visibleReleases,
    selectedIntent,
    syncing,
    triggerSync,
    moveIntent,
    refresh,
  }
}
