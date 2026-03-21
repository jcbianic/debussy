<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Header -->
    <div
      class="flex-shrink-0 border-b border-neutral-200 px-8 py-5 dark:border-neutral-800"
    >
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">Claude Setup</h1>
          <p class="mt-0.5 font-mono text-xs text-neutral-400">
            ~/Projets/Libon-Data/debussy
          </p>
        </div>
        <UBadge
          label="No conflicts"
          color="success"
          variant="subtle"
          size="sm"
        />
      </div>
      <div class="flex items-center gap-6">
        <div
          v-for="stat in headerStats"
          :key="stat.label"
          class="flex items-baseline gap-1.5"
        >
          <span class="text-lg font-semibold tabular-nums">{{
            stat.value
          }}</span>
          <span class="text-xs text-neutral-400">{{ stat.label }}</span>
        </div>
        <div class="ml-auto flex items-center gap-1.5 text-xs text-neutral-400">
          <UIcon name="i-heroicons-information-circle" class="size-3.5" />
          <span>Usage data requires hooks</span>
        </div>
      </div>
    </div>

    <!-- Split panel -->
    <div class="flex min-h-0 flex-1">
      <!-- Left: filter + list -->
      <div
        class="flex w-72 flex-shrink-0 flex-col overflow-hidden border-r border-neutral-200 dark:border-neutral-800"
      >
        <!-- Type filter -->
        <div
          class="flex-shrink-0 border-b border-neutral-100 px-3 py-2.5 dark:border-neutral-800/60"
        >
          <div class="flex flex-wrap gap-0.5">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="rounded px-2 py-1 text-xs transition-colors"
              :class="
                activeTab === tab.key
                  ? 'bg-neutral-900 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-900 dark:hover:text-neutral-200'
              "
            >
              {{ tab.label }}
              <span class="ml-0.5 tabular-nums opacity-50">{{
                tab.count
              }}</span>
            </button>
          </div>
        </div>

        <!-- Item list -->
        <div class="flex-1 overflow-y-auto py-1.5">
          <template v-for="group in groupedItems" :key="group.label">
            <div
              v-if="activeTab === 'all' && group.label"
              class="px-4 pt-3 pb-1"
            >
              <span
                class="text-xs font-medium tracking-wider text-neutral-400 uppercase dark:text-neutral-500"
                >{{ group.label }}</span
              >
            </div>
            <button
              v-for="item in group.items"
              :key="item.id"
              @click="selected = item"
              class="mx-1.5 flex w-[calc(100%-12px)] items-center gap-2.5 rounded-md px-3 py-1.5 text-left transition-colors"
              :class="
                selected?.id === item.id
                  ? 'bg-neutral-100 dark:bg-neutral-800'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
              "
            >
              <UIcon
                :name="typeIcon(item.type)"
                class="size-3.5 flex-shrink-0"
                :class="typeColor(item.type)"
              />
              <span
                class="flex-1 truncate font-mono text-xs"
                :class="
                  selected?.id === item.id
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-600 dark:text-neutral-400'
                "
                >{{ item.name }}</span
              >
              <span
                v-if="item.usage > 0"
                class="flex-shrink-0 text-xs text-neutral-400 tabular-nums"
                >{{ item.usage }}×</span
              >
            </button>
          </template>
        </div>
      </div>

      <!-- Right: detail -->
      <div class="flex-1 overflow-y-auto">
        <!-- Overview (nothing selected) -->
        <div v-if="!selected" class="px-8 py-6">
          <h2 class="mb-4 text-sm font-semibold">Installed plugins</h2>
          <div class="space-y-3">
            <div
              v-for="plugin in plugins"
              :key="plugin.id"
              class="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
            >
              <!-- Plugin header -->
              <div
                class="flex cursor-pointer items-center gap-3 border-b border-neutral-100 bg-white px-5 py-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-900/80"
                @click="selected = plugin"
              >
                <UIcon
                  name="i-heroicons-puzzle-piece"
                  class="size-4 flex-shrink-0 text-blue-500"
                />
                <span class="font-mono text-sm font-medium">{{
                  plugin.name
                }}</span>
                <span
                  v-if="plugin.version"
                  class="font-mono text-xs text-neutral-400"
                  >v{{ plugin.version }}</span
                >
                <UBadge
                  v-if="plugin.scope"
                  :label="plugin.scope"
                  color="neutral"
                  variant="outline"
                  size="xs"
                />
                <span class="flex-1" />
                <span class="text-xs text-neutral-400">{{
                  pluginTotalUsage(plugin.id) > 0
                    ? `${pluginTotalUsage(plugin.id)}×`
                    : ''
                }}</span>
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="size-3.5 text-neutral-300 dark:text-neutral-600"
                />
              </div>
              <!-- Provides -->
              <div
                class="flex flex-wrap gap-x-4 gap-y-1.5 bg-neutral-50 px-5 py-3 dark:bg-neutral-950/30"
              >
                <template
                  v-for="group in pluginProvides(plugin.id)"
                  :key="group.type"
                >
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-xs font-medium text-neutral-400">{{
                      group.label
                    }}</span>
                    <button
                      v-for="item in group.items"
                      :key="item.id"
                      @click="selected = item"
                      class="font-mono text-xs text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    >
                      {{ item.name }}
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail view -->
        <div v-else class="px-8 py-6">
          <!-- Item header -->
          <div class="mb-5 flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <div class="mb-2 flex items-center gap-2">
                <UIcon
                  :name="typeIcon(selected.type)"
                  class="size-5 flex-shrink-0"
                  :class="typeColor(selected.type)"
                />
                <h2 class="font-mono text-base font-semibold">
                  {{ selected.name }}
                </h2>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <UBadge
                  :label="selected.type"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                />
                <span v-if="selected.plugin" class="text-xs text-neutral-400"
                  >from
                  <span class="font-mono">{{ selected.plugin }}</span></span
                >
                <span
                  v-if="selected.version"
                  class="font-mono text-xs text-neutral-300 dark:text-neutral-600"
                  >v{{ selected.version }}</span
                >
                <UBadge
                  v-if="selected.scope"
                  :label="selected.scope"
                  color="neutral"
                  variant="outline"
                  size="xs"
                />
              </div>
            </div>
            <div class="ml-8 flex-shrink-0 text-right">
              <div
                class="text-2xl font-semibold tabular-nums"
                :class="
                  usageFor(selected) > 0
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-300 dark:text-neutral-700'
                "
              >
                {{ usageFor(selected) > 0 ? usageFor(selected) : '—' }}
              </div>
              <div class="text-xs text-neutral-400">
                {{ usageFor(selected) > 0 ? 'invocations' : 'no data yet' }}
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div
            v-if="selectedMeta.length"
            class="mb-5 flex gap-8 rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-3.5 dark:border-neutral-800 dark:bg-neutral-900/50"
          >
            <div v-for="m in selectedMeta" :key="m.label">
              <div class="mb-0.5 text-xs text-neutral-400">{{ m.label }}</div>
              <div class="font-mono text-xs font-medium">{{ m.value }}</div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selected.description" class="mb-5">
            <p
              class="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
            >
              {{ selected.description }}
            </p>
          </div>

          <!-- ── PLUGIN: provides grouped by type ── -->
          <template v-if="selected.type === 'plugin'">
            <div
              v-for="group in pluginProvides(selected.id)"
              :key="group.type"
              class="mb-5"
            >
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                {{ group.label }}
                <span class="font-normal opacity-60">{{
                  group.items.length
                }}</span>
              </h3>
              <div
                class="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
              >
                <button
                  v-for="(item, i) in group.items"
                  :key="item.id"
                  @click="selected = item"
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  :class="
                    i < group.items.length - 1
                      ? 'border-b border-neutral-100 dark:border-neutral-800'
                      : ''
                  "
                >
                  <UIcon
                    :name="typeIcon(item.type)"
                    class="size-3.5 flex-shrink-0"
                    :class="typeColor(item.type)"
                  />
                  <span
                    class="flex-1 font-mono text-xs text-neutral-700 dark:text-neutral-300"
                    >{{ item.name }}</span
                  >
                  <span
                    v-if="item.description"
                    class="hidden max-w-xs truncate text-xs text-neutral-400 lg:block"
                    >{{ item.description }}</span
                  >
                  <span
                    v-if="item.usage > 0"
                    class="ml-3 flex-shrink-0 text-xs text-neutral-400 tabular-nums"
                    >{{ item.usage }}×</span
                  >
                  <UIcon
                    name="i-heroicons-chevron-right"
                    class="size-3 flex-shrink-0 text-neutral-300 dark:text-neutral-600"
                  />
                </button>
              </div>
            </div>
          </template>

          <!-- ── COMMAND: frontmatter + body ── -->
          <template v-if="selected.type === 'command'">
            <!-- Allowed tools -->
            <div v-if="selected.allowedTools" class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Allowed tools
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tool in selected.allowedTools.split(', ')"
                  :key="tool"
                  class="rounded border border-neutral-200 bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
                  >{{ tool }}</span
                >
              </div>
            </div>
            <!-- Argument hint -->
            <div v-if="selected.argHint" class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Usage
              </h3>
              <code
                class="font-mono text-sm text-neutral-700 dark:text-neutral-300"
                >{{ selected.name }} {{ selected.argHint }}</code
              >
            </div>
            <!-- Body content -->
            <div v-if="selected.body" class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Content
              </h3>
              <pre
                class="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300"
                >{{ selected.body }}</pre
              >
            </div>
            <!-- Delegates to skill -->
            <div v-if="selected.delegatesTo" class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Delegates to
              </h3>
              <button
                @click="selectByName(selected.delegatesTo)"
                class="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
              >
                <UIcon
                  name="i-heroicons-sparkles"
                  class="size-3.5 text-violet-500"
                />
                <span
                  class="font-mono text-xs text-neutral-700 dark:text-neutral-300"
                  >{{ selected.delegatesTo }}</span
                >
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="ml-1 size-3 text-neutral-400"
                />
              </button>
            </div>
          </template>

          <!-- ── SKILL: triggers -->
          <template
            v-if="selected.type === 'skill' && selected.triggers?.length"
          >
            <div class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Triggers on
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="t in selected.triggers"
                  :key="t"
                  class="rounded border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
                  >{{ t }}</span
                >
              </div>
            </div>
          </template>

          <!-- ── HOOK: fires on ── -->
          <template v-if="selected.type === 'hook'">
            <div v-if="selected.triggers?.length" class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Fires on
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="t in selected.triggers"
                  :key="t"
                  class="rounded border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
                  >{{ t }}</span
                >
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type ItemType = 'plugin' | 'skill' | 'command' | 'hook'

interface Item {
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

const plugins: Item[] = [
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

const skills: Item[] = [
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

const commands: Item[] = [
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

const hooks: Item[] = [
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

// ─── Derived collections ────────────────────────────────────────────────────

const allItems = computed(() => [...plugins, ...skills, ...commands, ...hooks])

// ─── Tabs ───────────────────────────────────────────────────────────────────

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

// ─── Selection ──────────────────────────────────────────────────────────────

const selected = ref<Item | null>(null)

function selectByName(name: string) {
  const found = allItems.value.find((i) => i.name === name || i.id === name)
  if (found) selected.value = found
}

// ─── Plugin helpers ─────────────────────────────────────────────────────────

function pluginProvides(pluginId: string) {
  const plugin = plugins.find((p) => p.id === pluginId)
  if (!plugin?.provides) return []

  const ids = new Set(plugin.provides)
  const allProvided = allItems.value.filter(
    (i) => ids.has(i.id) || ids.has(i.name)
  )

  const byType: Record<string, Item[]> = {}
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

function usageFor(item: Item) {
  if (item.type === 'plugin') return pluginTotalUsage(item.id)
  return item.usage
}

// ─── Detail metadata ────────────────────────────────────────────────────────

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

// ─── Header stats ───────────────────────────────────────────────────────────

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

// ─── Type helpers ────────────────────────────────────────────────────────────

function typeIcon(type: ItemType) {
  return {
    plugin: 'i-heroicons-puzzle-piece',
    skill: 'i-heroicons-sparkles',
    command: 'i-heroicons-command-line',
    hook: 'i-heroicons-bolt',
  }[type]
}

function typeColor(type: ItemType) {
  return {
    plugin: 'text-blue-500',
    skill: 'text-violet-500',
    command: 'text-emerald-500',
    hook: 'text-amber-500',
  }[type]
}
</script>
