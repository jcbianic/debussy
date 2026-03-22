// Single source of truth for all mock data.
// Replace the return value of this composable with real API calls when ready.

export interface Round {
  roundNumber: number
  proposedAt: string
  content: string
  code?: string
  feedback?: string
  feedbackAt?: string
  feedbackStatus?: 'approved' | 'changes-requested' | 'rejected'
}

export interface ReviewItem {
  id: string
  title: string
  subtitle: string
  status: 'pending' | 'approved' | 'rejected'
  type: 'feedback' | 'code-review' | 'workflow'
  createdAt: string
  rounds: Round[]
}

export interface ReviewGroup {
  id: string
  title: string
  icon: string
  source: string
  type: string
  items: ReviewItem[]
}

export interface Lane {
  id: string
  branch: string
  path: string
  isActive: boolean
  /** Human-readable intent this lane is working on. */
  intent?: string
  groups: ReviewGroup[]
}

export interface WorkflowStep {
  name: string
  state: 'done' | 'running' | 'waiting' | 'pending'
  detail?: string
  duration?: string
}

export interface WorkflowRun {
  file: string
  status: string
  currentStep: number
  totalSteps: number
  elapsed: string
  startedAt: string
  steps: WorkflowStep[]
}

export interface Commit {
  hash: string
  message: string
  author: string
  date: string
  pr?: string
}

export interface ReviewDetail {
  id: string
  title: string
  source: string
  status: 'pending' | 'approved' | 'rejected'
  body: string
  code: string | null
}

const lanes: Lane[] = [
  {
    id: 'root',
    branch: 'feat/42-unified-ui',
    path: '~/debussy',
    isActive: true,
    intent: 'Unified UI',
    groups: [
      {
        id: 'rg-1',
        title: 'Unified UI — Implementation Plan',
        icon: 'i-heroicons-document-text',
        source: '/feedback session',
        type: 'feedback',
        items: [
          {
            id: 'r-1',
            title: 'Layout structure and sidebar navigation',
            subtitle: 'Round 2 pending',
            status: 'pending',
            type: 'feedback',
            createdAt: '2h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '3h ago',
                content:
                  'The layout uses a persistent left sidebar (w-60) with a project header, a lane list, and a separator above the Overview link. The main area fills remaining space and scrolls independently. Dark mode follows system preference.',
                feedback:
                  'The sidebar width feels too narrow for lane names that include branch names. Can we bump it to w-72 and add a collapsed state?',
                feedbackAt: '2h 30m ago',
                feedbackStatus: 'changes-requested',
              },
              {
                roundNumber: 2,
                proposedAt: '2h ago',
                content:
                  'Updated: sidebar is now w-72 with a collapse toggle in the header. Collapsed state shows only icons. Branch names truncate with ellipsis and show a tooltip on hover. Dark mode still follows system preference.',
              },
            ],
          },
          {
            id: 'r-2',
            title: 'Lane stage/unstage interaction model',
            subtitle: 'Approve or request changes',
            status: 'pending',
            type: 'feedback',
            createdAt: '2h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '2h ago',
                content:
                  'The staged lane is marked with a filled blue dot in the sidebar. Non-staged lanes show a faint Stage button on hover. The lane detail page shows a prominent "Stage" or "Push back" button in its header.',
              },
            ],
          },
          {
            id: 'r-3',
            title: 'Inbox hierarchy and review groups',
            subtitle: 'Approved 10m ago',
            status: 'approved',
            type: 'feedback',
            createdAt: '4h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '4h ago',
                content:
                  'Reviews are grouped by session or PR. Each group is collapsible. Individual items within a group link to the review detail page.',
                feedback: 'LGTM — this matches the mental model I had in mind.',
                feedbackAt: '10m ago',
                feedbackStatus: 'approved',
              },
            ],
          },
        ],
      },
      {
        id: 'rg-2',
        title: 'PR #42 — feat/42-unified-ui',
        icon: 'i-heroicons-code-bracket',
        source: 'code review',
        type: 'code-review',
        items: [
          {
            id: 'r-4',
            title: 'Nuxt layout structure',
            subtitle: 'layouts/default.vue',
            status: 'pending',
            type: 'code-review',
            createdAt: '1h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '1h ago',
                content:
                  'The layout wraps everything in a full-height flex container. Sidebar is w-60 with flex-col. Main area is flex-1 overflow-auto.',
                code: `// layouts/default.vue\n<aside class="w-60 flex-shrink-0 flex flex-col ...">\n  <!-- project header, nav, lanes -->\n</aside>\n<main class="flex-1 overflow-auto">\n  <slot />\n</main>`,
                feedback:
                  'Use w-72 per the updated layout spec. Also missing aria-label on <aside>.',
                feedbackAt: '45m ago',
                feedbackStatus: 'changes-requested',
              },
              {
                roundNumber: 2,
                proposedAt: '30m ago',
                content:
                  'Updated sidebar width to w-72, added aria-label="Sidebar navigation", and added role="main" to the main element.',
                code: `// layouts/default.vue\n<aside aria-label="Sidebar navigation" class="w-72 flex-shrink-0 flex flex-col ...">\n  <!-- project header, nav, lanes -->\n</aside>\n<main role="main" class="flex-1 overflow-auto">\n  <slot />\n</main>`,
              },
            ],
          },
          {
            id: 'r-5',
            title: 'NavItem component',
            subtitle: 'components/NavItem.vue',
            status: 'approved',
            type: 'code-review',
            createdAt: '2h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '2h ago',
                content:
                  'Simple component wrapping NuxtLink with active state detection and optional badge.',
                feedback: 'Good. Approved as-is.',
                feedbackAt: '1h ago',
                feedbackStatus: 'approved',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wt-feedback',
    branch: 'feat/feedback-ui',
    path: '~/debussy/.worktrees/feedback',
    isActive: false,
    intent: 'Feedback UI Enhancement',
    groups: [
      {
        id: 'rg-3',
        title: 'Feedback UI Enhancement — Spec',
        icon: 'i-heroicons-document-text',
        source: '/feedback session',
        type: 'feedback',
        items: [
          {
            id: 'r-6',
            title: 'Keyboard navigation shortcuts',
            subtitle: '⌘K / j·k / Enter',
            status: 'pending',
            type: 'feedback',
            createdAt: '5h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '5h ago',
                content:
                  'Proposed shortcuts: j/k to move between items, Enter to open, a to approve, r to request changes, x to reject, ? for help. ⌘K opens a command palette.',
              },
            ],
          },
          {
            id: 'r-7',
            title: 'Server startup sequence',
            subtitle: 'Port detection + auto-open',
            status: 'pending',
            type: 'feedback',
            createdAt: '5h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '5h ago',
                content:
                  'On skill invocation: scan for available port starting at 3001, write port to .port file, start Nitro server, open browser to that port. On skill exit: kill server, delete .port file.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wt-workflow',
    branch: 'feat/workflow-mon',
    path: '~/debussy/.worktrees/workflow',
    isActive: false,
    intent: 'Workflow Monitoring',
    groups: [],
  },
  {
    id: 'wt-fix',
    branch: 'fix/review-server',
    path: '~/debussy/.worktrees/fix',
    isActive: false,
    intent: 'Fix: server startup crash',
    groups: [
      {
        id: 'rg-4',
        title: 'Fix: review server startup crash',
        icon: 'i-heroicons-bug-ant',
        source: 'workflow gate',
        type: 'workflow',
        items: [
          {
            id: 'r-8',
            title: 'Root cause — port conflict on 3001',
            subtitle: 'Proposed fix: dynamic port allocation',
            status: 'pending',
            type: 'workflow',
            createdAt: '6h ago',
            rounds: [
              {
                roundNumber: 1,
                proposedAt: '6h ago',
                content:
                  'The review server crashes on startup when port 3001 is already in use from a previous session that was not cleanly terminated. Fix: scan for a free port starting at 3001, use the first available, write it to .port file.',
              },
            ],
          },
        ],
      },
    ],
  },
]

const workflowByLane: Record<string, WorkflowRun | null> = {
  root: {
    file: 'feat-delivery.yml',
    status: 'running',
    currentStep: 4,
    totalSteps: 7,
    elapsed: '12m 34s',
    startedAt: '14:22',
    steps: [
      { name: 'Setup environment', state: 'done', duration: '8s' },
      { name: 'Install dependencies', state: 'done', duration: '42s' },
      { name: 'Lint & typecheck', state: 'done', duration: '18s' },
      {
        name: 'Run tests',
        state: 'running',
        detail: 'ui/pages/roadmap.test.ts — 14/32 passing',
      },
      { name: 'Build UI', state: 'pending' },
      {
        name: 'Human review gate',
        state: 'pending',
        detail: 'Will pause for approval before continuing',
      },
      { name: 'Commit & push', state: 'pending' },
    ],
  },
  'wt-feedback': {
    file: 'feedback-spec.yml',
    status: 'done',
    currentStep: 5,
    totalSteps: 5,
    elapsed: '6m 02s',
    startedAt: '11:45',
    steps: [
      {
        name: 'Research keyboard nav patterns',
        state: 'done',
        duration: '1m 12s',
      },
      { name: 'Draft spec', state: 'done', duration: '2m 44s' },
      { name: 'Generate feedback session', state: 'done', duration: '38s' },
      {
        name: 'Human review gate',
        state: 'done',
        duration: '1m 28s',
        detail: '2 items approved, 1 pending',
      },
      { name: 'Write spec to disk', state: 'done', duration: '0s' },
    ],
  },
  'wt-workflow': {
    file: 'workflow-monitoring.yml',
    status: 'running',
    currentStep: 2,
    totalSteps: 6,
    elapsed: '3m 11s',
    startedAt: '14:31',
    steps: [
      {
        name: 'Research Nitro SSE patterns',
        state: 'done',
        duration: '1m 55s',
      },
      {
        name: 'Design progress API',
        state: 'running',
        detail: 'Drafting server/api/workflow/progress.get.ts',
      },
      { name: 'Implement SSE endpoint', state: 'pending' },
      { name: 'Wire up UI component', state: 'pending' },
      {
        name: 'Human review gate',
        state: 'pending',
        detail: 'Review progress panel design',
      },
      { name: 'Write implementation', state: 'pending' },
    ],
  },
  'wt-fix': null,
}

const commitsByLane: Record<string, Commit[]> = {
  root: [
    {
      hash: 'a1b2c3d',
      message: 'feat(ui): add architecture + policy + feature pages',
      author: 'jcbianic',
      date: '1h ago',
      pr: '#42',
    },
    {
      hash: 'e4f5a6b',
      message: 'feat(ui): add product two-panel layout with strategy artifacts',
      author: 'jcbianic',
      date: '2h ago',
      pr: '#42',
    },
    {
      hash: 'c7d8e9f',
      message: 'feat(ui): restructure sidebar nav with lanes and overview',
      author: 'jcbianic',
      date: '3h ago',
      pr: '#42',
    },
    {
      hash: 'f1a2b3c',
      message: 'chore(ui): init Nuxt 4 app with @nuxt/ui and i18n',
      author: 'jcbianic',
      date: '5h ago',
      pr: '#42',
    },
  ],
  'wt-feedback': [
    {
      hash: 'b4c5d6e',
      message: 'feat(feedback): draft keyboard nav spec',
      author: 'jcbianic',
      date: '2h ago',
    },
    {
      hash: 'a7b8c9d',
      message: 'chore(feedback): branch setup',
      author: 'jcbianic',
      date: '3h ago',
    },
  ],
  'wt-workflow': [
    {
      hash: 'e1f2a3b',
      message: 'feat(workflow): draft SSE progress endpoint design',
      author: 'jcbianic',
      date: '45m ago',
    },
    {
      hash: 'c4d5e6f',
      message: 'chore(workflow): branch setup',
      author: 'jcbianic',
      date: '3h ago',
    },
  ],
  'wt-fix': [
    {
      hash: 'a7b8c9e',
      message: 'fix(server): dynamic port allocation to avoid conflicts',
      author: 'jcbianic',
      date: '30m ago',
    },
    {
      hash: 'f1a2b4c',
      message: 'debug(server): reproduce port 3001 conflict',
      author: 'jcbianic',
      date: '1h ago',
    },
  ],
}

const reviewDetails: Record<string, ReviewDetail> = {
  'r-1': {
    id: 'r-1',
    title: 'Layout structure and sidebar navigation',
    source: 'Unified UI — Implementation Plan · /feedback session',
    status: 'pending',
    body: 'The layout uses a persistent left sidebar (w-60) with a project header, a lane list, and a separator above the Overview link. The main area fills remaining space and scrolls independently. Dark mode follows system preference with a manual toggle in the sidebar footer.',
    code: null,
  },
  'r-2': {
    id: 'r-2',
    title: 'Lane stage/unstage interaction model',
    source: 'Unified UI — Implementation Plan · /feedback session',
    status: 'pending',
    body: 'The staged lane is marked with a filled blue dot in the sidebar. Non-staged lanes show a faint Stage button on hover. The lane detail page shows a prominent "Stage" or "Push back" button in its header. Staging means checking out the lane\'s branch in the root folder.',
    code: null,
  },
  'r-3': {
    id: 'r-3',
    title: 'Inbox hierarchy and review groups',
    source: 'Unified UI — Implementation Plan · /feedback session',
    status: 'approved',
    body: 'Reviews are grouped by session or PR. Each group is collapsible. Individual items within a group link to the review detail page. Groups show a pending count badge. The inbox shows an empty state when there are no pending reviews.',
    code: null,
  },
  'r-4': {
    id: 'r-4',
    title: 'Nuxt layout structure',
    source: 'PR #42 · layouts/default.vue',
    status: 'pending',
    body: 'The layout wraps everything in a full-height flex container. Sidebar is w-60 with flex-col. Main area is flex-1 overflow-auto. Works correctly in both light and dark modes. No layout shift on navigation.',
    code: `// layouts/default.vue\n<aside class="w-60 flex-shrink-0 flex flex-col ...">\n  <!-- project header -->\n  <!-- primary nav -->\n  <!-- lanes list -->\n</aside>\n<main class="flex-1 overflow-auto">\n  <slot />\n</main>`,
  },
  'r-6': {
    id: 'r-6',
    title: 'Keyboard navigation shortcuts',
    source: 'Feedback UI Enhancement — Spec · /feedback session',
    status: 'pending',
    body: 'Proposed shortcuts: j/k to move between items, Enter to open, a to approve, r to request changes, x to reject, ? to show help overlay. ⌘K opens a command palette. All actions work without the mouse.',
    code: null,
  },
  'r-8': {
    id: 'r-8',
    title: 'Root cause — port conflict on 3001',
    source: 'Fix: review server startup crash · workflow gate',
    status: 'pending',
    body: 'The review server crashes on startup when port 3001 is already in use from a previous session. Proposed fix: scan for a free port starting at 3001, use the first available, write the chosen port to a .port file for the client to read.',
    code: null,
  },
}

/**
 * Provide reactive access to all mock lane, review, workflow, and commit data.
 * Replace the returned values with real API calls when the backend is ready.
 */
export function useMockData() {
  const pendingCount = (items: ReviewItem[]) =>
    items.filter((i) => i.status === 'pending').length

  const lanesWithPending = computed(() =>
    lanes.map((l) => ({
      ...l,
      pending: l.groups
        .flatMap((g) => g.items)
        .filter((i) => i.status === 'pending').length,
    }))
  )

  const totalPending = computed(() =>
    lanesWithPending.value.reduce((sum, l) => sum + l.pending, 0)
  )

  const getLane = (id: string) => lanes.find((l) => l.id === id) ?? lanes[0]!

  const getWorkflow = (laneId: string): WorkflowRun | null =>
    workflowByLane[laneId] ?? null

  const getCommits = (laneId: string): Commit[] => commitsByLane[laneId] ?? []

  const getReview = (id: string): ReviewDetail =>
    reviewDetails[id] ?? {
      id,
      title: 'Review item',
      source: 'Unknown source',
      status: 'pending',
      body: 'Review content would appear here.',
      code: null,
    }

  return {
    lanes,
    lanesWithPending,
    totalPending,
    getLane,
    getWorkflow,
    getCommits,
    getReview,
    pendingCount,
  }
}
