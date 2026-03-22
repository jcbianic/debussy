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
  const releases = reactive<Release[]>([
    {
      id: 'r0',
      name: 'Release 0.x',
      theme: 'Early exploration',
      intents: [
        {
          id: '—',
          title: 'Plugin scaffold and distribution model',
          addresses: 'Foundation',
          state: 'done',
          issue: 29,
          description:
            'Strip repo to plugin-only core, define distribution model via .claude-plugin/',
          doneWhen:
            'Plugin installs cleanly via npx claude code --install-plugin.',
        },
        {
          id: '—',
          title: 'Strategy skill — research + artifact generation',
          addresses: 'P1: Review Friction',
          state: 'done',
          issue: 30,
          description:
            'First end-to-end skill: research the landscape and audiences, generate vision/landscape/product artifacts, serve a browser review UI.',
          doneWhen:
            'Running /strategy produces all three artifacts without manual prompting.',
        },
        {
          id: '—',
          title: 'Roadmap skill — intents + GitHub Issue sync',
          addresses: 'P1: Review Friction',
          state: 'done',
          issue: 32,
          doneWhen:
            'Running /roadmap produces intents.md and syncs each intent to a GitHub Issue.',
        },
        {
          id: '—',
          title: 'GitHub Pages project site',
          addresses: 'Distribution',
          state: 'done',
          issue: 33,
          doneWhen: 'docs/ site live at jcbianic.github.io/debussy.',
        },
      ],
    },
    {
      id: 'r1',
      name: 'Release 1.0',
      theme: 'Foundation',
      intents: [
        {
          id: '001',
          title: 'Roadmap Skill Iteration',
          addresses: 'P1: Documentation Artifact Review Friction',
          state: 'done',
          issue: 34,
          priority: 'now',
          description:
            'Dogfood the roadmap skill on debussy, fix known bugs, validate the full loop works without manual workarounds.',
          doneWhen:
            'The skill runs end-to-end on debussy with no manual workarounds.',
        },
        {
          id: '002',
          title: 'Feedback UI Enhancement',
          addresses: 'P1: Documentation Artifact Review Friction',
          state: 'in-progress',
          issue: 38,
          priority: 'next',
          lane: 'feat/feedback-ui',
          laneId: 'wt-feedback',
          description:
            'Faster startup, keyboard navigation, no manual port management. Reduce a 20-item review to under 2 minutes.',
          doneWhen:
            'A 20-item review session takes under 2 minutes. Keyboard shortcuts handle approve/reject/discuss.',
        },
        {
          id: '003',
          title: 'Workflow Progress Monitoring',
          addresses: 'P2: Workflow Observability',
          state: 'open',
          issue: 40,
          priority: 'next',
          description:
            "Add live progress visibility: current step, elapsed time, what it's waiting on — without tailing a log file.",
          doneWhen:
            'During any workflow run, a status display shows current step and completed steps. Works for runs over 10 minutes.',
        },
        {
          id: '004',
          title: 'Unified UI',
          addresses: 'P1–P3: All friction points',
          state: 'in-progress',
          issue: 42,
          priority: 'next',
          lane: 'feat/42-unified-ui',
          laneId: 'root',
          description:
            'Replace per-skill browser UIs with a single Nuxt 4 app. Consolidates feedback review, workflow monitoring, roadmap, and product views.',
          doneWhen:
            'All existing skill UIs are replaced by routes in the unified app. Per-skill HTML files removed.',
        },
      ],
    },
    {
      id: 'r2',
      name: 'Release 2.0',
      theme: 'Parallel Work',
      intents: [
        {
          id: '005',
          title: 'Parallel Lanes',
          addresses: 'P3: Worktree Staging and Session Tracking',
          state: 'open',
          issue: 43,
          priority: 'later',
          description:
            'Worktree-aware task management: launch independent work in isolated git worktrees, switch between them, merge cleanly.',
          doneWhen:
            'Two independent tasks run in separate worktrees. Switching requires one command. No git conflicts at merge.',
        },
        {
          id: '006',
          title: 'Structured Project Documentation',
          addresses: 'P4: Structured Project Documentation',
          state: 'open',
          priority: 'later',
          description:
            'Standardized documentation structure covering features, architecture decisions, and testing strategy.',
          doneWhen:
            'After context compaction, Claude resumes correctly from the docs alone — no re-briefing required.',
        },
        {
          id: '007',
          title: 'Claude Setup Observability',
          addresses: 'P5: Claude Setup Observability',
          state: 'open',
          priority: 'later',
          description:
            'Single command listing all loaded plugins, skills, agents, hooks, and their active status. Detects conflicts.',
          doneWhen:
            'Running the command lists all active Claude Code extensions with context footprint. Conflicts detected and reported.',
        },
        {
          id: '008',
          title: 'Plugin compatibility management',
          addresses: 'Gap: Plugin conflicts',
          state: 'open',
          priority: 'later',
          description:
            'Detect and report conflicts between installed plugins. Suggest resolutions for common incompatibilities.',
        },
      ],
    },
    {
      id: 'backlog',
      name: 'Backlog',
      theme: 'Not yet scoped',
      intents: [
        {
          id: '—',
          title: 'Persistent preference learning from feedback loops',
          addresses: 'Gap: Human-to-agent feedback',
          state: 'out-of-scope',
        },
        {
          id: '—',
          title: 'Cost predictability and budget controls',
          addresses: 'Gap: Cost opacity',
          state: 'out-of-scope',
        },
        {
          id: '—',
          title: 'Plugin update mechanism',
          addresses: 'Gap: Plugin updates',
          state: 'out-of-scope',
        },
        {
          id: '—',
          title: 'Workflow audit trails',
          addresses: 'Gap: Observability',
          state: 'out-of-scope',
        },
        {
          id: '—',
          title: 'Collaborative multi-user workflows',
          addresses: 'Gap: Collaboration',
          state: 'out-of-scope',
        },
      ],
    },
  ])

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
    releases.filter((r) => releaseStatus(r) === 'shipped')
  )
  const currentRelease = computed(
    () => releases.find((r) => releaseStatus(r) === 'in progress') ?? null
  )
  const plannedReleases = computed(() =>
    releases.filter((r) => releaseStatus(r) === 'planned')
  )

  const activeFilter = ref('all')
  const filterTabs = computed(() => [
    { value: 'all', label: 'All', count: releases.length },
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
    if (activeFilter.value === 'all') return releases
    if (activeFilter.value === 'shipped') return shippedReleases.value
    if (activeFilter.value === 'current')
      return currentRelease.value ? [currentRelease.value] : []
    if (activeFilter.value === 'planned') return plannedReleases.value
    return releases
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
    const target = releases.find((r) => r.id === targetId)
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
  }
}
