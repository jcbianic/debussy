export interface AdrSection {
  title: string
  content: string[]
  table?: { headers: string[]; rows: string[][] }
}

export interface Adr {
  key: string
  id: string
  shortTitle: string
  title: string
  status: string
  date: string
  issue?: string
  issueLabel?: string
  supersedes?: string
  affectedPrinciples?: string[]
  sections: AdrSection[]
}

export interface Principle {
  num: string
  name: string
  description: string
  relatedAdrs?: string[]
}

export type ViewType =
  | 'principles-index'
  | 'principle'
  | 'decisions-index'
  | 'adr'

/**
 * Provide navigation state, search, flagging, and filtered views for architecture docs.
 * @returns `view` — current view; `goTo(v, key)` — navigate; `filteredPrinciples`/`filteredAdrs` — search results; `flagged`/`toggleFlag` — flag state.
 */
export function useArchitecture() {
  const { data: principlesData, refresh: refreshPrinciples } = useFetch<
    Principle[]
  >('/api/architecture/principles')
  const { data: adrsData, refresh: refreshAdrs } = useFetch<Adr[]>(
    '/api/architecture/adrs'
  )

  async function refresh() {
    await Promise.all([refreshPrinciples(), refreshAdrs()])
  }

  const principles = computed(() => principlesData.value ?? [])
  const adrs = computed(() => adrsData.value ?? [])

  const view = ref<ViewType>('principles-index')
  const detailKey = ref<string | null>(null)

  function goTo(v: ViewType, key?: string) {
    view.value = v
    detailKey.value = key ?? null
  }

  const currentPrinciple = computed(() =>
    view.value === 'principle'
      ? (principles.value.find((p) => p.num === detailKey.value) ?? null)
      : null
  )
  const currentAdr = computed(() =>
    view.value === 'adr'
      ? (adrs.value.find((a) => a.key === detailKey.value) ?? null)
      : null
  )

  const principleSearch = ref('')
  const adrSearch = ref('')

  const filteredPrinciples = computed(() => {
    const q = principleSearch.value.toLowerCase()
    if (!q) return principles.value
    return principles.value.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  })

  const filteredAdrs = computed(() => {
    const q = adrSearch.value.toLowerCase()
    if (!q) return adrs.value
    return adrs.value.filter(
      (a) => a.title.toLowerCase().includes(q) || a.id.includes(q)
    )
  })

  const flagged = ref(new Set<string>())

  function toggleFlag(key: string) {
    const next = new Set(flagged.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    flagged.value = next
  }

  const flaggedPrinciplesCount = computed(
    () =>
      principles.value.filter((p) => flagged.value.has('principle:' + p.num))
        .length
  )
  const proposedCount = computed(
    () => adrs.value.filter((a) => a.status === 'Proposed').length
  )
  const hasProposedForPrinciples = computed(() =>
    adrs.value.some(
      (a) => a.status === 'Proposed' && a.affectedPrinciples?.length
    )
  )

  return {
    view,
    goTo,
    currentPrinciple,
    currentAdr,
    principles,
    adrs,
    principleSearch,
    adrSearch,
    filteredPrinciples,
    filteredAdrs,
    flagged,
    toggleFlag,
    flaggedPrinciplesCount,
    proposedCount,
    hasProposedForPrinciples,
    refresh,
  }
}
