export type ItemType = 'plugin' | 'skill' | 'command' | 'hook'

/** A Claude Code plugin, skill, command, or hook tracked in the setup view. */
export interface SetupItem {
  id: string
  name: string
  type: ItemType
  plugin?: string
  version?: string
  scope?: string
  description?: string
  usage: number
  installedAt?: string
  // plugin
  provides?: string[]
  // command
  argHint?: string
  allowedTools?: string
  body?: string
  delegatesTo?: string
  // hook
  triggers?: string[]
}

// ─── Plugins ────────────────────────────────────────────────────────────────

const plugins: SetupItem[] = [
  {
    id: 'debussy@debussy',
    name: 'debussy',
    type: 'plugin',
    version: '0.1.0',
    scope: 'user',
    installedAt: '2026-03-16',
    description:
      'Strategy, roadmap, feedback, and workflow-run skills for solo builders using Claude Code.',
    usage: 0,
    provides: [
      'debussy:strategy',
      'debussy:roadmap',
      'debussy:feedback',
      'debussy:workflow-run',
    ],
  },
  {
    id: 'rpikit@rpikit',
    name: 'rpikit',
    type: 'plugin',
    version: '0.5.1',
    scope: 'user',
    installedAt: '2026-02-28',
    description:
      'Rigorous planning, implementation, and code review toolkit for disciplined engineering.',
    usage: 0,
    provides: [
      'rpikit:brainstorming',
      'rpikit:writing-plans',
      'rpikit:researching-codebase',
      'rpikit:implementing-plans',
      'rpikit:reviewing-code',
      'rpikit:systematic-debugging',
      'rpikit:test-driven-development',
      'rpikit:verification-before-completion',
      'rpikit:security-review',
      'rpikit:finishing-work',
      'rpikit:parallel-agents',
      'rpikit:markdown-validation',
      'rpikit:documenting-decisions',
      'rpikit:git-worktrees',
      'rpikit:receiving-code-review',
      '/research',
      '/plan',
      '/brainstorm',
      '/implement',
      '/review-code',
      '/review-security',
      '/decision',
    ],
  },
  {
    id: 'frontend-design@claude-plugins-official',
    name: 'frontend-design',
    type: 'plugin',
    scope: 'user',
    installedAt: '2026-02-19',
    description:
      'Create distinctive, production-grade frontend interfaces with high design quality.',
    usage: 0,
    provides: ['frontend-design:frontend-design'],
  },
  {
    id: 'code-review@claude-plugins-official',
    name: 'code-review',
    type: 'plugin',
    scope: 'user',
    installedAt: '2026-02-19',
    description:
      'Code review pull requests with structured, actionable feedback.',
    usage: 0,
    provides: ['code-review:code-review', '/code-review'],
  },
  {
    id: 'ralph-loop@claude-plugins-official',
    name: 'ralph-loop',
    type: 'plugin',
    scope: 'user',
    installedAt: '2026-02-19',
    description:
      'Self-referential loops for automated Claude Code workflows with a Stop hook.',
    usage: 0,
    provides: [
      'ralph-loop:help',
      'ralph-loop:ralph-loop',
      'ralph-loop:cancel-ralph',
      'hook:stop',
    ],
  },
  {
    id: 'commit-commands@claude-plugins-official',
    name: 'commit-commands',
    type: 'plugin',
    scope: 'user',
    installedAt: '2026-02-19',
    description:
      'Git commit, push, and PR creation commands for structured commit workflows.',
    usage: 0,
    provides: [
      'commit-commands:commit',
      'commit-commands:commit-push-pr',
      'commit-commands:clean_gone',
      '/commit',
      '/commit-push-pr',
      '/clean_gone',
    ],
  },
]

// ─── Skills ─────────────────────────────────────────────────────────────────

const skills: SetupItem[] = [
  {
    id: 'debussy:strategy',
    name: 'debussy:strategy',
    type: 'skill',
    plugin: 'debussy@debussy',
    version: '0.1.0',
    usage: 12,
    description:
      'Research-first product discovery — map the space, produce structured artifacts under docs/strategy/, and review them in a browser UI.',
  },
  {
    id: 'debussy:roadmap',
    name: 'debussy:roadmap',
    type: 'skill',
    plugin: 'debussy@debussy',
    version: '0.1.0',
    usage: 8,
    description:
      'Shape a product roadmap: consume strategy artifacts, produce intents with P{N}/A{N} cross-refs, and sync GitHub Issues.',
  },
  {
    id: 'debussy:feedback',
    name: 'debussy:feedback',
    type: 'skill',
    plugin: 'debussy@debussy',
    version: '0.1.0',
    usage: 5,
    description:
      'Collect structured user feedback via a browser UI with configurable review workflows.',
  },
  {
    id: 'debussy:workflow-run',
    name: 'debussy:workflow-run',
    type: 'skill',
    plugin: 'debussy@debussy',
    version: '0.1.0',
    usage: 3,
    description:
      'Execute multi-step IIKit workflows defined in YAML files with interactive human review gates.',
  },
  {
    id: 'rpikit:brainstorming',
    name: 'rpikit:brainstorming',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 18,
    description:
      'Collaborative design methodology for creative work. Use before research or planning when requirements are unclear.',
  },
  {
    id: 'rpikit:writing-plans',
    name: 'rpikit:writing-plans',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 23,
    description:
      'Create actionable implementation plans with verification criteria and dependency ordering.',
  },
  {
    id: 'rpikit:researching-codebase',
    name: 'rpikit:researching-codebase',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 15,
    description:
      'Thorough interrogation and codebase exploration before planning or implementation.',
  },
  {
    id: 'rpikit:implementing-plans',
    name: 'rpikit:implementing-plans',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 19,
    description:
      'Disciplined execution of implementation plans with checkpoint validation.',
  },
  {
    id: 'rpikit:reviewing-code',
    name: 'rpikit:reviewing-code',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 31,
    description:
      'Code review methodology using Conventional Comments for quality, design, and correctness.',
  },
  {
    id: 'rpikit:systematic-debugging',
    name: 'rpikit:systematic-debugging',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 9,
    description:
      'Root cause investigation methodology for bugs and failures before attempting fixes.',
  },
  {
    id: 'rpikit:test-driven-development',
    name: 'rpikit:test-driven-development',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 11,
    description:
      'Rigorous TDD methodology enforcing RED-GREEN-REFACTOR discipline.',
  },
  {
    id: 'rpikit:verification-before-completion',
    name: 'rpikit:verification-before-completion',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 27,
    description:
      'Evidence-before-claims discipline: run verification commands before claiming work complete.',
  },
  {
    id: 'rpikit:security-review',
    name: 'rpikit:security-review',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 7,
    description:
      'Security review methodology for evaluating code changes for vulnerabilities.',
  },
  {
    id: 'rpikit:finishing-work',
    name: 'rpikit:finishing-work',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 14,
    description:
      'Structured completion workflow: guides merge, PR creation, or cleanup decisions.',
  },
  {
    id: 'rpikit:parallel-agents',
    name: 'rpikit:parallel-agents',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 6,
    description:
      'Concurrent agent dispatch for independent problems to reduce total time.',
  },
  {
    id: 'rpikit:markdown-validation',
    name: 'rpikit:markdown-validation',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 8,
    description:
      'Validates markdown files using markdownlint after writing or editing.',
  },
  {
    id: 'rpikit:documenting-decisions',
    name: 'rpikit:documenting-decisions',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 4,
    description:
      'Record architectural decisions as ADRs from design documents.',
  },
  {
    id: 'rpikit:git-worktrees',
    name: 'rpikit:git-worktrees',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 5,
    description:
      'Isolated workspace creation for parallel development work using git worktrees.',
  },
  {
    id: 'rpikit:receiving-code-review',
    name: 'rpikit:receiving-code-review',
    type: 'skill',
    plugin: 'rpikit@rpikit',
    version: '0.5.1',
    usage: 12,
    description:
      'Verification-first approach to code review feedback. Evaluate suggestions rigorously.',
  },
  {
    id: 'frontend-design:frontend-design',
    name: 'frontend-design:frontend-design',
    type: 'skill',
    plugin: 'frontend-design@claude-plugins-official',
    usage: 9,
    description:
      'Create distinctive, production-grade frontend interfaces with high design quality.',
  },
  {
    id: 'code-review:code-review',
    name: 'code-review:code-review',
    type: 'skill',
    plugin: 'code-review@claude-plugins-official',
    usage: 15,
    description:
      'Code review a pull request with structured, actionable feedback.',
  },
  {
    id: 'ralph-loop:help',
    name: 'ralph-loop:help',
    type: 'skill',
    plugin: 'ralph-loop@claude-plugins-official',
    usage: 2,
    description: 'Explain Ralph Loop plugin and available commands.',
  },
  {
    id: 'ralph-loop:ralph-loop',
    name: 'ralph-loop:ralph-loop',
    type: 'skill',
    plugin: 'ralph-loop@claude-plugins-official',
    usage: 3,
    description: 'Start Ralph Loop in current session.',
  },
  {
    id: 'ralph-loop:cancel-ralph',
    name: 'ralph-loop:cancel-ralph',
    type: 'skill',
    plugin: 'ralph-loop@claude-plugins-official',
    usage: 1,
    description: 'Cancel active Ralph Loop.',
  },
  {
    id: 'commit-commands:clean_gone',
    name: 'commit-commands:clean_gone',
    type: 'skill',
    plugin: 'commit-commands@claude-plugins-official',
    usage: 4,
    description:
      'Clean up all git branches marked as [gone] including associated worktrees.',
  },
  {
    id: 'commit-commands:commit',
    name: 'commit-commands:commit',
    type: 'skill',
    plugin: 'commit-commands@claude-plugins-official',
    usage: 47,
    description: 'Create a git commit with a structured commit message.',
  },
  {
    id: 'commit-commands:commit-push-pr',
    name: 'commit-commands:commit-push-pr',
    type: 'skill',
    plugin: 'commit-commands@claude-plugins-official',
    usage: 21,
    description: 'Commit, push, and open a pull request in one workflow.',
  },
]

// ─── Commands ───────────────────────────────────────────────────────────────

const commands: SetupItem[] = [
  {
    id: 'cmd:research',
    name: '/research',
    type: 'command',
    plugin: 'rpikit@rpikit',
    usage: 15,
    description: 'Deep codebase exploration before planning or implementation.',
    argHint: '<question or goal>',
    delegatesTo: 'rpikit:researching-codebase',
    body: `# Research Command instructions\n\nInvoke the rpikit:researching-codebase skill and follow it exactly as presented to you.`,
  },
  {
    id: 'cmd:plan',
    name: '/plan',
    type: 'command',
    plugin: 'rpikit@rpikit',
    usage: 23,
    description:
      'Create actionable implementation plan with verification criteria.',
    argHint: '<research findings to plan from>',
    delegatesTo: 'rpikit:writing-plans',
    body: `# Plan Command instructions\n\nInvoke the rpikit:writing-plans skill and follow it exactly as presented to you.`,
  },
  {
    id: 'cmd:brainstorm',
    name: '/brainstorm',
    type: 'command',
    plugin: 'rpikit@rpikit',
    usage: 18,
    description:
      'Explore ideas and design approaches before research or planning.',
    argHint: '<idea or feature to explore>',
    delegatesTo: 'rpikit:brainstorming',
    body: `# Brainstorm Command instructions\n\nInvoke the rpikit:brainstorming skill and follow it exactly as presented to you.`,
  },
  {
    id: 'cmd:implement',
    name: '/implement',
    type: 'command',
    plugin: 'rpikit@rpikit',
    usage: 19,
    description:
      'Execute approved plan with checkpoint validation and progress tracking.',
    argHint: '<plan to execute>',
    delegatesTo: 'rpikit:implementing-plans',
    body: `# Implement Command instructions\n\nInvoke the rpikit:implementing-plans skill and follow it exactly as presented to you.`,
  },
  {
    id: 'cmd:review-code',
    name: '/review-code',
    type: 'command',
    plugin: 'rpikit@rpikit',
    usage: 31,
    description:
      'Review code changes for quality, design, and maintainability.',
    argHint: '<files or changes to review>',
    delegatesTo: 'rpikit:reviewing-code',
    body: `# Code Review Command instructions\n\nInvoke the rpikit:reviewing-code skill and follow it exactly as presented to you.`,
  },
  {
    id: 'cmd:review-security',
    name: '/review-security',
    type: 'command',
    plugin: 'rpikit@rpikit',
    usage: 7,
    description: 'Review code changes for security vulnerabilities and risks.',
    argHint: '<files or changes to review>',
    delegatesTo: 'rpikit:security-review',
    body: `# Security Review Command instructions\n\nInvoke the rpikit:security-review skill and follow it exactly as presented to you.`,
  },
  {
    id: 'cmd:decision',
    name: '/decision',
    type: 'command',
    plugin: 'rpikit@rpikit',
    usage: 4,
    description:
      'Document architectural decisions as ADRs from design documents.',
    argHint: '<path-to-design-doc> [additional context]',
    delegatesTo: 'rpikit:documenting-decisions',
    body: `# Decision Command instructions\n\nInvoke the rpikit:documenting-decisions skill and follow it exactly as presented to you.`,
  },
  {
    id: 'cmd:commit',
    name: '/commit',
    type: 'command',
    plugin: 'commit-commands@claude-plugins-official',
    usage: 47,
    description: 'Create a git commit.',
    allowedTools: 'Bash(git add:*), Bash(git status:*), Bash(git commit:*)',
    body: `## Context\n\n- Current git status: !\`git status\`\n- Current git diff (staged and unstaged changes): !\`git diff HEAD\`\n- Current branch: !\`git branch --show-current\`\n- Recent commits: !\`git log --oneline -10\`\n\n## Your task\n\nBased on the above changes, create a single git commit.\n\nYou have the capability to call multiple tools in a single response. Stage and create the commit using a single message. Do not use any other tools or do anything else.`,
  },
  {
    id: 'cmd:commit-push-pr',
    name: '/commit-push-pr',
    type: 'command',
    plugin: 'commit-commands@claude-plugins-official',
    usage: 21,
    description: 'Commit, push, and open a PR.',
    allowedTools:
      'Bash(git checkout --branch:*), Bash(git add:*), Bash(git status:*), Bash(git push:*), Bash(git commit:*), Bash(gh pr create:*)',
    body: `## Context\n\n- Current git status: !\`git status\`\n- Current git diff (staged and unstaged changes): !\`git diff HEAD\`\n- Current branch: !\`git branch --show-current\`\n\n## Your task\n\nBased on the above changes:\n\n1. Create a new branch if on main\n2. Create a single commit with an appropriate message\n3. Push the branch to origin\n4. Create a pull request using \`gh pr create\`\n5. Do all of the above in a single message.`,
  },
  {
    id: 'cmd:clean_gone',
    name: '/clean_gone',
    type: 'command',
    plugin: 'commit-commands@claude-plugins-official',
    usage: 4,
    description:
      'Cleans up all git branches marked as [gone], including removing associated worktrees.',
    body: `## Your Task\n\nClean up stale local branches that have been deleted from the remote repository.\n\n1. List branches to identify any with [gone] status:\n   \`git branch -v\`\n\n2. Identify worktrees that need to be removed for [gone] branches:\n   \`git worktree list\`\n\n3. Remove worktrees and delete [gone] branches:\n   Process all [gone] branches, removing worktrees first if they exist, then deleting the branch with \`git branch -D\`.`,
  },
  {
    id: 'cmd:code-review',
    name: '/code-review',
    type: 'command',
    plugin: 'code-review@claude-plugins-official',
    usage: 15,
    description: 'Code review a pull request.',
    allowedTools:
      'Bash(gh issue view:*), Bash(gh pr comment:*), Bash(gh pr diff:*), Bash(gh pr view:*), Bash(gh pr list:*)',
    body: `Provide a code review for the given pull request.\n\n1. Check eligibility: closed, draft, automated, or already reviewed → skip\n2. Gather CLAUDE.md files from affected directories\n3. Summarize the PR change via a Haiku agent\n4. Launch 5 parallel Sonnet agents to review:\n   - CLAUDE.md compliance\n   - Obvious bugs (shallow scan)\n   - Historical git context (git blame)\n   - Prior PR comments on same files\n   - Code comment compliance\n5. Score each issue 0–100 for confidence\n6. Filter issues below 80 confidence\n7. Comment on the PR with results or "No issues found"`,
  },
]

// ─── Hooks ──────────────────────────────────────────────────────────────────

const hooks: SetupItem[] = [
  {
    id: 'hook:stop',
    name: 'Stop',
    type: 'hook',
    plugin: 'ralph-loop@claude-plugins-official',
    usage: 3,
    description:
      'Fires when Claude Code session stops. Managed by Ralph Loop to handle self-referential loop termination.',
    triggers: ['Stop'],
  },
]

/** Map item type to its Heroicons icon name. */
export const typeIcon = (type: ItemType): string =>
  ({
    plugin: 'i-heroicons-puzzle-piece',
    skill: 'i-heroicons-sparkles',
    command: 'i-heroicons-command-line',
    hook: 'i-heroicons-bolt',
  })[type]

/** Map item type to its Tailwind text-color class. */
export const typeColor = (type: ItemType): string =>
  ({
    plugin: 'text-blue-500',
    skill: 'text-violet-500',
    command: 'text-emerald-500',
    hook: 'text-amber-500',
  })[type]

/** Provide Claude setup data, selection state, and derived helpers. */
export const useSetup = () => {
  const allItems = computed(() => [
    ...plugins,
    ...skills,
    ...commands,
    ...hooks,
  ])

  const activeTab = ref<'all' | ItemType>('all')

  const tabs = computed(() => [
    { key: 'all' as const, label: 'All', count: allItems.value.length },
    { key: 'plugin' as const, label: 'Plugins', count: plugins.length },
    { key: 'skill' as const, label: 'Skills', count: skills.length },
    { key: 'command' as const, label: 'Commands', count: commands.length },
    { key: 'hook' as const, label: 'Hooks', count: hooks.length },
  ])

  const groupedItems = computed(() => {
    if (activeTab.value !== 'all') {
      return [
        {
          label: '',
          items: allItems.value.filter((i) => i.type === activeTab.value),
        },
      ]
    }
    return [
      { label: 'Plugins', items: plugins },
      { label: 'Skills', items: skills },
      { label: 'Commands', items: commands },
      { label: 'Hooks', items: hooks },
    ]
  })

  const selected = ref<SetupItem | null>(null)

  function selectByName(name: string) {
    const found = allItems.value.find((i) => i.name === name || i.id === name)
    if (found) selected.value = found
  }

  function pluginProvides(pluginId: string) {
    const plugin = plugins.find((p) => p.id === pluginId)
    if (!plugin?.provides) return []
    const ids = new Set(plugin.provides)
    const allProvided = allItems.value.filter(
      (i) => ids.has(i.id) || ids.has(i.name)
    )
    const byType: Record<string, SetupItem[]> = {}
    for (const item of allProvided) {
      ;(byType[item.type] ??= []).push(item)
    }
    const typeOrder: ItemType[] = ['skill', 'command', 'hook']
    const typeLabels: Record<ItemType, string> = {
      plugin: 'Plugins',
      skill: 'Skills',
      command: 'Commands',
      hook: 'Hooks',
    }
    return typeOrder
      .filter((t) => byType[t]?.length)
      .map((t) => ({ type: t, label: typeLabels[t], items: byType[t] ?? [] }))
  }

  function pluginTotalUsage(pluginId: string) {
    const plugin = plugins.find((p) => p.id === pluginId)
    if (!plugin?.provides) return 0
    const ids = new Set(plugin.provides)
    return allItems.value
      .filter((i) => ids.has(i.id) || ids.has(i.name))
      .reduce((s, i) => s + i.usage, 0)
  }

  function usageFor(item: SetupItem) {
    if (item.type === 'plugin') return pluginTotalUsage(item.id)
    return item.usage
  }

  const selectedMeta = computed(() => {
    if (!selected.value) return []
    const m: { label: string; value: string }[] = []
    if (selected.value.installedAt)
      m.push({ label: 'Installed', value: selected.value.installedAt })
    if (selected.value.version)
      m.push({ label: 'Version', value: selected.value.version })
    if (selected.value.scope)
      m.push({ label: 'Scope', value: selected.value.scope })
    if (selected.value.plugin && selected.value.type !== 'plugin') {
      m.push({
        label: 'Plugin',
        value: selected.value.plugin.split('@')[0] ?? '',
      })
    }
    return m
  })

  const totalUsage = computed(() =>
    [...skills, ...commands, ...hooks].reduce((s, i) => s + i.usage, 0)
  )

  const headerStats = computed(() => [
    { value: plugins.length, label: 'plugins' },
    { value: skills.length, label: 'skills' },
    { value: commands.length, label: 'commands' },
    { value: hooks.length, label: 'hooks' },
    { value: totalUsage.value, label: 'total invocations' },
  ])

  return {
    plugins,
    allItems,
    activeTab,
    tabs,
    groupedItems,
    selected,
    selectByName,
    pluginProvides,
    usageFor,
    selectedMeta,
    headerStats,
  }
}
