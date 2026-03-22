/** Summary entry for the next release shown on the dashboard. */
export interface DashboardIntent {
  id: string
  title: string
  state: 'done' | 'in-progress' | 'open'
  lane: string | null
}

/** Artifact card summary shown on the dashboard. */
export interface DashboardArtifact {
  key: string
  name: string
  icon: string
  status: 'reviewed' | 'draft'
}

/** Stat pill in the Claude Setup card. */
export interface DashboardStat {
  value: string
  label: string
}

/** Badge item in the Claude Setup card. */
export interface DashboardItem {
  name: string
}

const nextRelease: DashboardIntent[] = [
  { id: '001', title: 'Roadmap Skill Iteration', state: 'done', lane: null },
  {
    id: '002',
    title: 'Feedback UI Enhancement',
    state: 'in-progress',
    lane: 'feat/feedback-ui',
  },
  {
    id: '003',
    title: 'Workflow Progress Monitoring',
    state: 'open',
    lane: null,
  },
]

const dashboardArtifacts: DashboardArtifact[] = [
  {
    key: 'vision',
    name: 'Vision',
    icon: 'i-heroicons-eye',
    status: 'reviewed',
  },
  {
    key: 'landscape',
    name: 'Landscape',
    icon: 'i-heroicons-globe-alt',
    status: 'reviewed',
  },
  {
    key: 'product',
    name: 'Product',
    icon: 'i-heroicons-cube',
    status: 'draft',
  },
]

const claudeStats: DashboardStat[] = [
  { value: '4', label: 'Skills' },
  { value: '3', label: 'Hooks' },
  { value: '0', label: 'Conflicts' },
]

const claudeItems: DashboardItem[] = [
  { name: 'debussy:strategy' },
  { name: 'debussy:roadmap' },
  { name: 'debussy:feedback' },
  { name: 'debussy:workflow-run' },
  { name: 'PostToolUse' },
  { name: 'PreToolUse' },
  { name: 'Stop' },
]

/** Provide static summary data for the dashboard (Overview) page. */
export const useDashboard = () => ({
  nextRelease,
  nextReleaseName: 'Release 1.0 — Foundation',
  artifacts: dashboardArtifacts,
  claudeStats,
  claudeItems,
})
