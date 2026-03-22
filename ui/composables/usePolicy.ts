export interface PolicyItem {
  rule: string
  note?: string
}

export interface PolicySection {
  title: string
  items?: PolicyItem[]
  content?: string[]
}

export interface PolicyTopic {
  key: string
  name: string
  description: string
  icon: string
  file?: string
  status?: string
  sections: PolicySection[]
}

const topics: PolicyTopic[] = [
  {
    key: 'branching',
    name: 'Branching',
    description: 'Branch naming conventions and lifecycle.',
    icon: 'i-heroicons-code-bracket-square',
    status: 'defined',
    sections: [
      {
        title: 'Conventions',
        items: [
          {
            rule: 'feat/<issue-id>-<slug>',
            note: 'New features and enhancements',
          },
          { rule: 'fix/<issue-id>-<slug>', note: 'Bug fixes' },
          { rule: 'chore/<slug>', note: 'Maintenance, deps, config' },
          { rule: 'docs/<slug>', note: 'Documentation only' },
        ],
      },
      {
        title: 'Lifecycle',
        content: [
          'Branches are created from main. Feature branches must pass CI before merging. Branches are deleted after merge.',
          'Worktrees follow the same naming conventions as branches.',
        ],
      },
    ],
  },
  {
    key: 'commits',
    name: 'Commits',
    description: 'Conventional commits and message format.',
    icon: 'i-heroicons-document-check',
    status: 'defined',
    sections: [
      {
        title: 'Format',
        items: [
          { rule: 'feat(scope): description', note: 'New feature' },
          { rule: 'fix(scope): description', note: 'Bug fix' },
          { rule: 'chore(scope): description', note: 'Maintenance' },
          { rule: 'docs(scope): description', note: 'Docs only' },
          { rule: 'refactor(scope): description', note: 'No behavior change' },
        ],
      },
      {
        title: 'Rules',
        content: [
          'Scope is the affected skill or module (e.g., strategy, roadmap, feedback, workflow-run, ui).',
          'Breaking changes use ! suffix: feat(api)!: change response format.',
          'Issue references go in the PR description, not the commit message.',
        ],
      },
    ],
  },
  {
    key: 'release',
    name: 'Release',
    description: 'Release process and versioning.',
    icon: 'i-heroicons-rocket-launch',
    status: 'draft',
    sections: [
      {
        title: 'Versioning',
        items: [
          {
            rule: 'Semantic versioning (MAJOR.MINOR.PATCH)',
            note: 'Breaking plugin API changes bump MAJOR',
          },
          { rule: 'MINOR for new skills or skill commands', note: '' },
          { rule: 'PATCH for bug fixes and non-breaking changes', note: '' },
        ],
      },
      {
        title: 'Process (draft)',
        content: [
          '1. All intents for the release must be merged to main.',
          '2. Build the UI: cd ui && npm run build.',
          '3. Commit the built .output/ directory.',
          '4. Tag the release: git tag vX.Y.Z.',
          '5. Push tag to trigger marketplace sync.',
        ],
      },
    ],
  },
  {
    key: 'testing',
    name: 'Testing',
    description: 'Testing strategy and quality gates.',
    icon: 'i-heroicons-beaker',
    status: 'draft',
    sections: [
      {
        title: 'Strategy',
        content: [
          'Skills are tested end-to-end by running them on the debussy project itself (dogfooding). Unit tests are not required for skill YAML/markdown files.',
          'The UI is tested visually via the mock data wireframe. API routes will require integration tests when implemented.',
        ],
      },
      {
        title: 'Quality gates',
        items: [
          { rule: 'TypeScript compilation must pass', note: 'nuxi typecheck' },
          { rule: 'No ESLint errors', note: 'Enforced in CI' },
          {
            rule: 'Skill dogfood must run without manual workarounds',
            note: 'Done-when criterion for each skill intent',
          },
        ],
      },
    ],
  },
  {
    key: 'quality',
    name: 'Quality Stack',
    description: 'Linting, formatting, and toolchain.',
    icon: 'i-heroicons-wrench-screwdriver',
    status: 'defined',
    sections: [
      {
        title: 'Frontend (ui/)',
        items: [
          {
            rule: 'ESLint with @nuxt/eslint',
            note: 'Auto-configured via Nuxt',
          },
          {
            rule: 'TypeScript strict mode',
            note: 'tsconfig.json extends Nuxt defaults',
          },
          { rule: 'Tailwind CSS via @nuxt/ui', note: 'No custom CSS files' },
        ],
      },
      {
        title: 'Plugin / Skills',
        items: [
          {
            rule: 'Markdown linting via markdownlint',
            note: 'Applied to all .md files',
          },
          {
            rule: 'YAML linting for workflow files',
            note: '.claude/workflows/*.yml',
          },
          { rule: 'No shell scripts — use Node.js for tooling', note: '' },
        ],
      },
    ],
  },
  {
    key: 'claude-md',
    name: 'CLAUDE.md',
    description: 'Agent instructions and AGENTS.md governance.',
    icon: 'i-heroicons-cpu-chip',
    file: 'CLAUDE.md',
    status: 'defined',
    sections: [
      {
        title: 'Purpose',
        content: [
          'CLAUDE.md is the primary instructions file for the Claude Code agent. It describes the project structure, distribution model, and next steps.',
          'AGENTS.md delegates to .tessl/RULES.md for detailed agent rules. This separation keeps top-level instructions concise.',
        ],
      },
      {
        title: 'What belongs in CLAUDE.md',
        items: [
          {
            rule: 'Project description and structure',
            note: 'What is this, what are the skills',
          },
          { rule: 'Distribution model', note: 'How to install the plugin' },
          {
            rule: 'Dogfooding instructions',
            note: 'How to test the plugin on itself',
          },
          { rule: 'Pointers to AGENTS.md', note: 'Delegate detailed rules' },
        ],
      },
      {
        title: 'What does NOT belong',
        content: [
          'Detailed coding rules, commit conventions, or toolchain choices. Those live in AGENTS.md and .tessl/RULES.md where they can be managed as structured data.',
        ],
      },
    ],
  },
]

/** Provide policy topics and selection state. */
export const usePolicy = () => {
  const selected = ref('branching')
  const currentTopic = computed(() =>
    topics.find((t) => t.key === selected.value)
  )
  return { topics, selected, currentTopic }
}
