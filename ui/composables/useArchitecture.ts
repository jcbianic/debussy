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

/** Core architectural principles that govern all decisions in the codebase. */
export const principles: Principle[] = [
  {
    num: '1',
    name: 'Local first, no cloud',
    description:
      "Debussy has no database, no login, no external service. Everything runs in the user's machine. Skills launch processes that terminate when done. No persistent daemon.",
    relatedAdrs: ['adr-001', 'adr-003'],
  },
  {
    num: '2',
    name: 'One process, one port',
    description:
      'The unified UI runs as a single Nitro SSR server. No Python API server alongside a static frontend. No CORS. No port management by the user.',
    relatedAdrs: ['adr-001', 'adr-003', 'adr-004'],
  },
  {
    num: '3',
    name: 'Zero build step at install',
    description:
      'The built .output/ directory is committed to the repository. Plugin users run node ui/.output/server/index.mjs — no npm install, no build, no Node version conflicts.',
    relatedAdrs: ['adr-001', 'adr-002'],
  },
  {
    num: '4',
    name: 'File I/O as the protocol',
    description:
      'Claude reads and writes files. The UI reads and writes files. The protocol between the agent and the UI is the filesystem, not a message bus or a socket. This keeps both sides independently simple.',
    relatedAdrs: ['adr-003'],
  },
  {
    num: '5',
    name: 'Skills disappear when not needed',
    description:
      'No background process, no watching, no polling unless a skill is actively running. The footprint is zero when idle.',
  },
  {
    num: '6',
    name: 'Markdown is the truth store',
    description:
      'All persistent state — workflow runs, feedback decisions, strategy artifacts, ADRs — lives in human-readable markdown files. No JSON databases, no SQLite, no binary formats. State can be read with cat and edited with any text editor.',
  },
  {
    num: '7',
    name: 'Composable, not coupled',
    description:
      'Skills share infrastructure (the UI server, the file protocol) but not code. Strategy does not import roadmap internals. Adding a skill means adding a page and a server/api/ directory — not modifying existing skills. Removal is symmetric.',
    relatedAdrs: ['adr-004'],
  },
  {
    num: '8',
    name: 'Human in the loop, always',
    description:
      'No skill silently modifies a file the user has not seen. The agent proposes; the review UI surfaces the proposal; the human accepts or rejects. Automated writes happen only to designated scratch directories (e.g., .workflow-runs/) and are explicitly scoped.',
  },
]

/** Architecture Decision Records — immutable log of decisions made and their rationale. */
export const adrs: Adr[] = [
  {
    key: 'adr-001',
    id: '001',
    shortTitle: 'Nuxt 4 + Nitro UI Stack',
    title: 'Unified UI Tech Stack: Nuxt 4 + Nitro',
    status: 'Accepted',
    date: '2026-03-20',
    issue: 'https://github.com/jcbianic/debussy/issues/42',
    issueLabel: '#42 — Unified Debussy UI',
    affectedPrinciples: ['2', '3'],
    sections: [
      {
        title: 'Context',
        content: [
          'Debussy previously shipped per-skill browser UIs — feedback.html served by feedback-server.py, and strategy-review.html served by strategy-server.py. Each was a self-contained Python stdlib server + single HTML file.',
          'This approach breaks down as requirements grow: the UI must react live to markdown files changing on disk, write decisions back to files, and share infrastructure across three skill UIs.',
        ],
      },
      {
        title: 'Decision',
        content: [
          'Use Nuxt 4 + @nuxt/ui v3 as the frontend framework, built with nuxt build (Nitro SSR mode, not static generation). The same stack is already used for the Debussy project site (docs/), so patterns and config are already established.',
        ],
      },
      {
        title: 'Why Nitro over static generation',
        content: [
          'Static generation produces a dist/ with no server. File watching and writes would require a separate Python or Node server — two processes, two ports, CORS concerns.',
          'Nitro SSR mode produces a single .output/server/index.mjs that serves the compiled frontend, exposes server API routes for file I/O, and runs SSE endpoints for live file-change streaming. One command, one process, one port.',
        ],
      },
      {
        title: 'Alternatives considered',
        content: [],
        table: {
          headers: ['Option', 'Rejected because'],
          rows: [
            [
              'Python + single HTML files (status quo)',
              'Cannot support live file watching, SSE, or write-back without significant bespoke infrastructure',
            ],
            [
              'Static Nuxt + Python API server',
              'Two processes, two ports; no benefit over Nitro',
            ],
            [
              'Vue + Vite without Nuxt',
              'Loses Nitro server routes — file I/O API would need a separate server',
            ],
            [
              'React / SvelteKit',
              'No familiarity advantage; Nuxt is already established in this repo',
            ],
          ],
        },
      },
      {
        title: 'Consequences',
        content: [
          'Node.js is a runtime dependency for the skill server (acceptable for Claude Code users).',
          '.output/ must be rebuilt and committed before each plugin release.',
          'Per-skill HTML files (feedback.html, strategy-review.html) are superseded by this UI and can be removed once the unified UI is stable.',
        ],
      },
    ],
  },
  {
    key: 'adr-002',
    id: '002',
    shortTitle: 'Committed .output/ Build',
    title: 'Commit .output/ Build Artifacts to the Repository',
    status: 'Accepted',
    date: '2026-03-20',
    affectedPrinciples: ['3'],
    sections: [
      {
        title: 'Context',
        content: [
          'Plugin users install Debussy by copying .claude/ into their project. They should not be expected to have Node.js available, run npm install, or execute a build step. The plugin must be usable immediately after installation.',
          'The Nuxt build produces .output/server/index.mjs — a self-contained Node server with no external dependencies beyond the Node.js runtime, which all Claude Code users already have.',
        ],
      },
      {
        title: 'Decision',
        content: [
          'Remove .output/ from .gitignore. Commit the build output to the repository. The start command (node ui/.output/server/index.mjs) is the only thing a plugin user ever runs.',
        ],
      },
      {
        title: 'Consequences',
        content: [
          'The repository is heavier (~10 MB) than a source-only repo.',
          'Every UI change requires a rebuild and a second commit before the plugin release.',
          'Contributors must not delete .output/ from their local clone — this would break the plugin for anyone who installs from that commit.',
        ],
      },
    ],
  },
  {
    key: 'adr-003',
    id: '003',
    shortTitle: 'SSE for File-Change Events',
    title: 'Server-Sent Events for Live File-Change Streaming',
    status: 'Accepted',
    date: '2026-03-20',
    affectedPrinciples: ['1', '2', '4'],
    sections: [
      {
        title: 'Context',
        content: [
          'The UI must react when Claude writes a markdown file — e.g., a new intent appears in intents.md, or a feedback decision is written back to decisions.md. Without live updates, the user must manually refresh to see changes.',
          'The solution must not require a second server or process (P2: one process, one port) and must not persist state externally (P1: local first).',
        ],
      },
      {
        title: 'Decision',
        content: [
          "Use Nitro's server-sent events (h3 eventStream) to stream file-change notifications from a server/api/watch.get.ts endpoint. The browser subscribes via EventSource. The server uses Node's fs.watch() to detect changes and pushes the file path and new content to the client.",
        ],
      },
      {
        title: 'Alternatives considered',
        content: [],
        table: {
          headers: ['Option', 'Rejected because'],
          rows: [
            [
              'Polling (setInterval + fetch)',
              'Wastes CPU and network; adds latency proportional to poll interval',
            ],
            [
              'WebSocket',
              'Bidirectional protocol; heavier setup; no benefit for read-only notifications',
            ],
            ['Manual refresh', 'Poor UX; breaks the live review workflow'],
          ],
        },
      },
      {
        title: 'Consequences',
        content: [
          'SSE connections are long-lived HTTP connections. The Nitro server must handle concurrent open connections without leaking file watchers.',
          'fs.watch() behavior differs across platforms (macOS FSEvents vs Linux inotify). The implementation must handle both.',
        ],
      },
    ],
  },
  {
    key: 'adr-004',
    id: '004',
    shortTitle: 'Skill-Namespaced API Routes',
    title: 'Skill-Namespaced API Route Conventions',
    status: 'Proposed',
    date: '2026-03-21',
    affectedPrinciples: ['2', '7'],
    sections: [
      {
        title: 'Context',
        content: [
          'As more skills gain UI pages, server API routes will multiply. Today they are ad-hoc (e.g., /api/files, /api/watch). With four or more active skills, route naming collisions become a maintenance risk and the flat namespace gives no signal about which skill owns which endpoint.',
        ],
      },
      {
        title: 'Proposed decision',
        content: [
          'Namespace all routes as /api/{skill}/{resource} — e.g., /api/roadmap/intents, /api/feedback/sessions, /api/strategy/artifacts, /api/ui/watch. Each skill owns its subtree. Shared infrastructure (file watching, generic file reads) lives under /api/ui/.',
        ],
      },
      {
        title: 'Open questions',
        content: [
          'Does this require a skill registration mechanism, or is the directory convention enough?',
          'How do we handle cross-skill resources — e.g., roadmap reading a strategy artifact? Does the roadmap page call /api/strategy/artifacts or does it have its own route that reads the same file?',
          'Should the convention be enforced in CI (e.g., a lint rule) or documented only?',
        ],
      },
    ],
  },
]

/**
 * Provide navigation state, search, flagging, and filtered views for architecture docs.
 * @returns `view` — current view; `goTo(v, key)` — navigate; `filteredPrinciples`/`filteredAdrs` — search results; `flagged`/`toggleFlag` — flag state.
 */
export function useArchitecture() {
  const view = ref<ViewType>('principles-index')
  const detailKey = ref<string | null>(null)

  function goTo(v: ViewType, key?: string) {
    view.value = v
    detailKey.value = key ?? null
  }

  const currentPrinciple = computed(() =>
    view.value === 'principle'
      ? (principles.find((p) => p.num === detailKey.value) ?? null)
      : null
  )
  const currentAdr = computed(() =>
    view.value === 'adr'
      ? (adrs.find((a) => a.key === detailKey.value) ?? null)
      : null
  )

  const principleSearch = ref('')
  const adrSearch = ref('')

  const filteredPrinciples = computed(() => {
    const q = principleSearch.value.toLowerCase()
    if (!q) return principles
    return principles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  })

  const filteredAdrs = computed(() => {
    const q = adrSearch.value.toLowerCase()
    if (!q) return adrs
    return adrs.filter(
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
      principles.filter((p) => flagged.value.has('principle:' + p.num)).length
  )
  const proposedCount = computed(
    () => adrs.filter((a) => a.status === 'Proposed').length
  )
  const hasProposedForPrinciples = computed(() =>
    adrs.some((a) => a.status === 'Proposed' && a.affectedPrinciples?.length)
  )

  return {
    view,
    goTo,
    currentPrinciple,
    currentAdr,
    principleSearch,
    adrSearch,
    filteredPrinciples,
    filteredAdrs,
    flagged,
    toggleFlag,
    flaggedPrinciplesCount,
    proposedCount,
    hasProposedForPrinciples,
  }
}
