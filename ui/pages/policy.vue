<template>
  <div class="flex h-full">

    <!-- Left panel -->
    <div class="w-56 flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div class="px-5 py-5 border-b border-neutral-200 dark:border-neutral-800">
        <h1 class="text-sm font-semibold">Policy of debussy</h1>
        <p class="mt-0.5 text-xs text-neutral-400 font-mono">~/Projets/Libon-Data/debussy</p>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="topic in topics"
          :key="topic.key"
          class="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
          :class="selected === topic.key
            ? 'bg-neutral-50 dark:bg-neutral-800'
            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'"
          @click="selected = topic.key"
        >
          <UIcon :name="topic.icon" class="size-4 text-neutral-400 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ topic.name }}</div>
            <div v-if="topic.file" class="text-xs text-neutral-400 mt-0.5 font-mono truncate">{{ topic.file }}</div>
          </div>
          <UBadge v-if="topic.status" :label="topic.status" :color="topic.status === 'defined' ? 'success' : 'warning'" variant="subtle" size="xs" />
        </div>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 overflow-auto px-8 py-8">
      <div v-if="currentTopic">

        <div class="flex items-start justify-between mb-8">
          <div>
            <h2 class="text-xl font-semibold">{{ currentTopic.name }}</h2>
            <p class="mt-1 text-sm text-neutral-400">{{ currentTopic.description }}</p>
          </div>
          <UBadge v-if="currentTopic.file" :label="currentTopic.file" color="neutral" variant="subtle" size="sm" />
        </div>

        <div class="space-y-6">
          <div v-for="section in currentTopic.sections" :key="section.title">
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">{{ section.title }}</h3>
            <div v-if="section.items" class="space-y-2">
              <div
                v-for="item in section.items"
                :key="item.rule"
                class="flex items-start gap-3 rounded-md border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3"
              >
                <UIcon name="i-heroicons-check-circle" class="size-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div class="text-sm font-medium">{{ item.rule }}</div>
                  <div v-if="item.note" class="text-xs text-neutral-400 mt-0.5">{{ item.note }}</div>
                </div>
              </div>
            </div>
            <div v-if="section.content" class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2">
              <p v-for="(para, i) in section.content" :key="i">{{ para }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
interface PolicyItem { rule: string; note?: string }
interface PolicySection { title: string; items?: PolicyItem[]; content?: string[] }
interface PolicyTopic { key: string; name: string; description: string; icon: string; file?: string; status?: string; sections: PolicySection[] }

const topics: PolicyTopic[] = [
  {
    key: 'branching',
    name: 'Branching',
    description: 'Branch naming conventions and lifecycle.',
    icon: 'i-heroicons-code-bracket-square',
    status: 'defined',
    sections: [
      { title: 'Conventions', items: [
        { rule: 'feat/<issue-id>-<slug>', note: 'New features and enhancements' },
        { rule: 'fix/<issue-id>-<slug>', note: 'Bug fixes' },
        { rule: 'chore/<slug>', note: 'Maintenance, deps, config' },
        { rule: 'docs/<slug>', note: 'Documentation only' },
      ]},
      { title: 'Lifecycle', content: [
        'Branches are created from main. Feature branches must pass CI before merging. Branches are deleted after merge.',
        'Worktrees follow the same naming conventions as branches.',
      ]},
    ],
  },
  {
    key: 'commits',
    name: 'Commits',
    description: 'Conventional commits and message format.',
    icon: 'i-heroicons-document-check',
    status: 'defined',
    sections: [
      { title: 'Format', items: [
        { rule: 'feat(scope): description', note: 'New feature' },
        { rule: 'fix(scope): description', note: 'Bug fix' },
        { rule: 'chore(scope): description', note: 'Maintenance' },
        { rule: 'docs(scope): description', note: 'Docs only' },
        { rule: 'refactor(scope): description', note: 'No behavior change' },
      ]},
      { title: 'Rules', content: [
        'Scope is the affected skill or module (e.g., strategy, roadmap, feedback, workflow-run, ui).',
        'Breaking changes use ! suffix: feat(api)!: change response format.',
        'Issue references go in the PR description, not the commit message.',
      ]},
    ],
  },
  {
    key: 'release',
    name: 'Release',
    description: 'Release process and versioning.',
    icon: 'i-heroicons-rocket-launch',
    status: 'draft',
    sections: [
      { title: 'Versioning', items: [
        { rule: 'Semantic versioning (MAJOR.MINOR.PATCH)', note: 'Breaking plugin API changes bump MAJOR' },
        { rule: 'MINOR for new skills or skill commands', note: '' },
        { rule: 'PATCH for bug fixes and non-breaking changes', note: '' },
      ]},
      { title: 'Process (draft)', content: [
        '1. All intents for the release must be merged to main.',
        '2. Build the UI: cd ui && npm run build.',
        '3. Commit the built .output/ directory.',
        '4. Tag the release: git tag vX.Y.Z.',
        '5. Push tag to trigger marketplace sync.',
      ]},
    ],
  },
  {
    key: 'testing',
    name: 'Testing',
    description: 'Testing strategy and quality gates.',
    icon: 'i-heroicons-beaker',
    status: 'draft',
    sections: [
      { title: 'Strategy', content: [
        'Skills are tested end-to-end by running them on the debussy project itself (dogfooding). Unit tests are not required for skill YAML/markdown files.',
        'The UI is tested visually via the mock data wireframe. API routes will require integration tests when implemented.',
      ]},
      { title: 'Quality gates', items: [
        { rule: 'TypeScript compilation must pass', note: 'nuxi typecheck' },
        { rule: 'No ESLint errors', note: 'Enforced in CI' },
        { rule: 'Skill dogfood must run without manual workarounds', note: 'Done-when criterion for each skill intent' },
      ]},
    ],
  },
  {
    key: 'quality',
    name: 'Quality Stack',
    description: 'Linting, formatting, and toolchain.',
    icon: 'i-heroicons-wrench-screwdriver',
    status: 'defined',
    sections: [
      { title: 'Frontend (ui/)', items: [
        { rule: 'ESLint with @nuxt/eslint', note: 'Auto-configured via Nuxt' },
        { rule: 'TypeScript strict mode', note: 'tsconfig.json extends Nuxt defaults' },
        { rule: 'Tailwind CSS via @nuxt/ui', note: 'No custom CSS files' },
      ]},
      { title: 'Plugin / Skills', items: [
        { rule: 'Markdown linting via markdownlint', note: 'Applied to all .md files' },
        { rule: 'YAML linting for workflow files', note: '.claude/workflows/*.yml' },
        { rule: 'No shell scripts — use Node.js for tooling', note: '' },
      ]},
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
      { title: 'Purpose', content: [
        'CLAUDE.md is the primary instructions file for the Claude Code agent. It describes the project structure, distribution model, and next steps.',
        'AGENTS.md delegates to .tessl/RULES.md for detailed agent rules. This separation keeps top-level instructions concise.',
      ]},
      { title: 'What belongs in CLAUDE.md', items: [
        { rule: 'Project description and structure', note: 'What is this, what are the skills' },
        { rule: 'Distribution model', note: 'How to install the plugin' },
        { rule: 'Dogfooding instructions', note: 'How to test the plugin on itself' },
        { rule: 'Pointers to AGENTS.md', note: 'Delegate detailed rules' },
      ]},
      { title: 'What does NOT belong', content: [
        'Detailed coding rules, commit conventions, or toolchain choices. Those live in AGENTS.md and .tessl/RULES.md where they can be managed as structured data.',
      ]},
    ],
  },
]

const selected = ref('branching')
const currentTopic = computed(() => topics.find(t => t.key === selected.value))
</script>
