<template>
  <TwoPanelLayout left-width="w-60">
    <!-- Left panel: groups -->
    <template #left>
      <div
        class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800"
      >
        <h1 class="text-sm font-semibold">Features of debussy</h1>
        <p class="mt-0.5 font-mono text-xs text-neutral-400">
          ~/Projets/Libon-Data/debussy
        </p>
        <SegmentedControl
          :model-value="groupByMode"
          :options="groupByOptions"
          stretch
          class="mt-3"
          @update:model-value="setGroupBy($event as GroupByMode)"
        />
      </div>
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="group in groups"
          :key="group.key"
          class="flex cursor-pointer items-center gap-3 border-b border-neutral-100 px-5 py-3 transition-colors last:border-b-0 dark:border-neutral-800"
          :class="
            selected === group.key
              ? 'bg-neutral-50 dark:bg-neutral-800'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          "
          @click="selected = group.key"
        >
          <UIcon
            :name="group.icon"
            class="size-4 flex-shrink-0"
            :class="group.color"
          />
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium">{{ group.name }}</div>
            <div class="mt-0.5 text-xs text-neutral-400">
              {{ group.count }} features
            </div>
          </div>
        </div>
      </div>
      <div
        class="border-t border-neutral-200 px-5 py-3 text-xs text-neutral-400 dark:border-neutral-800"
      >
        .debussy/strategy/feature-space.md
      </div>
    </template>

    <!-- Right panel -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Search bar -->
      <div
        class="flex flex-shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="relative flex-1">
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search features…"
            class="w-full rounded-lg border-0 bg-neutral-100 py-2 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-neutral-300 dark:bg-neutral-800 dark:focus:ring-neutral-600"
          />
          <button
            v-if="searchQuery"
            class="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            @click="searchQuery = ''"
          >
            <UIcon name="i-heroicons-x-mark" class="size-3.5" />
          </button>
        </div>
      </div>

      <!-- Content: feature list + optional detail panel -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Feature list -->
        <div
          class="overflow-auto py-5 transition-[width,padding]"
          :class="
            selectedFeature
              ? 'w-96 flex-shrink-0 border-r border-neutral-200 px-4 dark:border-neutral-800'
              : 'flex-1 px-6'
          "
        >
          <!-- Search results -->
          <div v-if="searchQuery">
            <div class="mb-3 text-xs text-neutral-400">
              {{ searchResults.length }} result{{
                searchResults.length === 1 ? '' : 's'
              }}
              for "{{ searchQuery }}"
            </div>
            <div class="space-y-2">
              <div
                v-for="f in searchResults"
                :key="f.name"
                class="cursor-pointer rounded-lg border transition-colors"
                :class="
                  selectedFeature?.name === f.name
                    ? 'border-neutral-400 bg-neutral-50 dark:border-neutral-500 dark:bg-neutral-800'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50'
                "
                @click="selectedFeature = f"
              >
                <div :class="selectedFeature ? 'p-3' : 'p-4'">
                  <div class="mb-1 flex items-start justify-between gap-3">
                    <h3
                      class="text-sm font-semibold"
                      v-html="highlight(f.name)"
                    />
                    <div
                      class="flex flex-shrink-0 flex-wrap items-center justify-end gap-1"
                    >
                      <span
                        v-for="p in f.problems"
                        :key="p"
                        class="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
                        :class="problemBadgeClass(p)"
                        >{{ p }}</span
                      >
                      <span
                        class="inline-flex items-center rounded px-2 py-0.5 text-xs"
                        :class="domainBadgeClass(f.domain)"
                        >{{ domainMeta[f.domain]?.name }}</span
                      >
                    </div>
                  </div>
                  <p
                    v-if="!selectedFeature"
                    class="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400"
                    v-html="highlight(f.description)"
                  />
                </div>
              </div>
            </div>
            <EmptyState
              v-if="searchResults.length === 0"
              variant="bare"
              icon="i-heroicons-magnifying-glass"
              :text="`No features match &quot;${searchQuery}&quot;`"
            />
          </div>

          <!-- Group view -->
          <div v-else-if="currentGroup">
            <div
              class="mb-4 flex items-center gap-2"
              :class="selectedFeature ? '' : 'mb-5'"
            >
              <UIcon
                :name="currentGroup.icon"
                :class="[
                  selectedFeature ? 'size-4' : 'size-5',
                  currentGroup.color,
                ]"
              />
              <div v-if="!selectedFeature">
                <h2 class="text-xl font-semibold">{{ currentGroup.name }}</h2>
                <p class="mt-0.5 text-sm text-neutral-400">
                  {{ currentGroup.description }}
                </p>
              </div>
              <template v-else>
                <h2 class="text-sm font-semibold">{{ currentGroup.name }}</h2>
                <span class="text-xs text-neutral-400">{{
                  currentGroup.count
                }}</span>
              </template>
            </div>
            <div class="space-y-2">
              <div
                v-for="f in currentGroup.features"
                :key="f.name"
                class="cursor-pointer rounded-lg border transition-colors"
                :class="
                  selectedFeature?.name === f.name
                    ? 'border-neutral-400 bg-neutral-50 dark:border-neutral-500 dark:bg-neutral-800'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50'
                "
                @click="selectedFeature = f"
              >
                <div :class="selectedFeature ? 'p-3' : 'p-4'">
                  <div class="flex items-start justify-between gap-3">
                    <h3 class="text-sm font-semibold">{{ f.name }}</h3>
                    <div
                      class="flex flex-shrink-0 flex-wrap items-center justify-end gap-1"
                    >
                      <span
                        v-for="p in f.problems"
                        :key="p"
                        class="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
                        :class="problemBadgeClass(p)"
                        :title="problemMeta[p]?.description"
                        >{{ p }}</span
                      >
                      <span
                        v-if="groupByMode !== 'domain'"
                        class="inline-flex items-center rounded px-2 py-0.5 text-xs"
                        :class="domainBadgeClass(f.domain)"
                        >{{ domainMeta[f.domain]?.name }}</span
                      >
                      <span
                        v-if="groupByMode !== 'type'"
                        class="inline-flex items-center rounded px-2 py-0.5 text-xs"
                        :class="typeBadgeClass(f.type)"
                        >{{ typeMeta[f.type]?.shortName }}</span
                      >
                      <UBadge
                        v-if="f.owner"
                        :label="f.owner"
                        color="primary"
                        variant="subtle"
                        size="xs"
                      />
                      <UBadge
                        v-if="f.tag"
                        :label="f.tag"
                        color="neutral"
                        variant="subtle"
                        size="xs"
                      />
                    </div>
                  </div>
                  <p
                    v-if="!selectedFeature"
                    class="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400"
                  >
                    {{ f.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail panel -->
        <div v-if="selectedFeature" class="flex-1 overflow-auto px-6 py-5">
          <!-- Header -->
          <div class="mb-4 flex items-start justify-between gap-4">
            <h2 class="text-base leading-tight font-semibold">
              {{ selectedFeature.name }}
            </h2>
            <button
              class="flex-shrink-0 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
              @click="selectedFeature = null"
            >
              <UIcon name="i-heroicons-x-mark" class="size-4" />
            </button>
          </div>

          <!-- All badges -->
          <div class="mb-5 flex flex-wrap gap-1.5">
            <span
              v-for="p in selectedFeature.problems"
              :key="p"
              class="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
              :class="problemBadgeClass(p)"
              :title="problemMeta[p]?.description"
              >{{ p }}</span
            >
            <span
              class="inline-flex items-center rounded px-2 py-0.5 text-xs"
              :class="domainBadgeClass(selectedFeature.domain)"
              >{{ domainMeta[selectedFeature.domain]?.name }}</span
            >
            <span
              class="inline-flex items-center rounded px-2 py-0.5 text-xs"
              :class="typeBadgeClass(selectedFeature.type)"
              >{{ typeMeta[selectedFeature.type]?.shortName }}</span
            >
            <UBadge
              v-if="selectedFeature.owner"
              :label="selectedFeature.owner"
              color="primary"
              variant="subtle"
              size="xs"
            />
            <UBadge
              v-if="selectedFeature.tag"
              :label="selectedFeature.tag"
              color="neutral"
              variant="subtle"
              size="xs"
            />
          </div>

          <!-- Problem cross-references -->
          <div v-if="selectedFeature.problems.length" class="mb-5">
            <div
              class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Addresses
            </div>
            <div class="space-y-2">
              <div
                v-for="p in selectedFeature.problems"
                :key="p"
                class="flex items-start gap-3 rounded-lg border p-3"
                :class="problemCardClass(p)"
              >
                <UIcon
                  :name="problemMeta[p]?.icon"
                  class="mt-0.5 size-4 flex-shrink-0"
                  :class="problemMeta[p]?.color"
                />
                <div>
                  <div class="text-xs font-semibold">
                    {{ problemMeta[p]?.name }}
                  </div>
                  <div
                    class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400"
                  >
                    {{ problemMeta[p]?.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-5">
            <div
              class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Description
            </div>
            <p
              class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              {{ selectedFeature.description }}
            </p>
          </div>

          <!-- Breakdown items -->
          <div v-if="selectedFeature.items?.length" class="mb-5">
            <div
              class="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Breakdown
            </div>
            <ul class="space-y-2.5">
              <li
                v-for="item in selectedFeature.items"
                :key="item"
                class="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-400"
              >
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="mt-0.5 size-3.5 flex-shrink-0 text-neutral-400"
                />
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- Related features -->
          <div
            v-if="relatedFeatures.length"
            class="border-t border-neutral-200 pt-4 dark:border-neutral-800"
          >
            <div
              class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Related
            </div>
            <div class="space-y-1">
              <div
                v-for="f in relatedFeatures"
                :key="f.name"
                class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                @click="selectedFeature = f"
              >
                <span
                  v-if="f.problems[0]"
                  class="inline-flex flex-shrink-0 items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
                  :class="problemBadgeClass(f.problems[0])"
                  >{{ f.problems[0] }}</span
                >
                <span
                  v-else
                  class="flex-shrink-0 text-xs text-neutral-300 dark:text-neutral-600"
                  >—</span
                >
                <span class="flex-1 truncate text-sm">{{ f.name }}</span>
                <span
                  class="flex-shrink-0 text-xs"
                  :class="domainMeta[f.domain]?.color"
                  >{{ domainMeta[f.domain]?.name }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TwoPanelLayout>
</template>

<script setup lang="ts">
type GroupByMode = 'type' | 'domain' | 'problem'

interface Feature {
  name: string
  description: string
  owner?: string
  tag?: string
  domain: string
  problems: string[]
  items?: string[]
}

interface EnrichedFeature extends Feature {
  type: string
}

interface CategoryDef {
  key: string
  name: string
  description: string
  icon: string
  color: string
  features: Feature[]
}

interface Group {
  key: string
  name: string
  description: string
  icon: string
  color: string
  count: number
  features: EnrichedFeature[]
}

const domainMeta: Record<
  string,
  {
    name: string
    icon: string
    color: string
    description: string
    badgeClass: string
  }
> = {
  'review-ux': {
    name: 'Review UX',
    icon: 'i-heroicons-cursor-arrow-rays',
    color: 'text-purple-500',
    description: 'Browser review UI, keyboard navigation, feedback loops',
    badgeClass:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  },
  'workflow-monitoring': {
    name: 'Workflow Monitoring',
    icon: 'i-heroicons-queue-list',
    color: 'text-sky-500',
    description: 'Observability, audit trails, live step progress',
    badgeClass: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  },
  'lane-management': {
    name: 'Lane Management',
    icon: 'i-heroicons-squares-2x2',
    color: 'text-emerald-500',
    description: 'Git worktrees, parallel work, cross-lane visibility',
    badgeClass:
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  },
  'product-discovery': {
    name: 'Product Discovery',
    icon: 'i-heroicons-map',
    color: 'text-orange-500',
    description: 'Strategy, roadmap, and vision artifacts',
    badgeClass:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  },
  'dev-core': {
    name: 'Dev Core',
    icon: 'i-heroicons-code-bracket',
    color: 'text-neutral-500',
    description: 'Git, commits, tests, security, documentation',
    badgeClass:
      'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
  },
  'context-memory': {
    name: 'Context & Memory',
    icon: 'i-heroicons-cpu-chip',
    color: 'text-pink-500',
    description: 'Token efficiency, persistent knowledge across sessions',
    badgeClass:
      'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  },
  'cost-perf': {
    name: 'Cost & Perf',
    icon: 'i-heroicons-chart-bar',
    color: 'text-amber-500',
    description: 'Budget controls, token tracking, cost transparency',
    badgeClass:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  },
}

const problemMeta: Record<
  string,
  {
    name: string
    icon: string
    color: string
    description: string
    badgeClass: string
  }
> = {
  P1: {
    name: 'P1 — Review friction',
    icon: 'i-heroicons-cursor-arrow-rays',
    color: 'text-violet-500',
    description:
      'Review UIs are slow, lack keyboard nav, require manual startup.',
    badgeClass:
      'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
  },
  P2: {
    name: 'P2 — Workflow opacity',
    icon: 'i-heroicons-eye-slash',
    color: 'text-sky-500',
    description: 'Long-running sessions have no live progress indicator.',
    badgeClass:
      'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
  },
  P3: {
    name: 'P3 — Lane management',
    icon: 'i-heroicons-squares-2x2',
    color: 'text-emerald-500',
    description: 'No way to see, switch, or manage multiple active worktrees.',
    badgeClass:
      'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  },
}

const typeMeta: Record<string, { shortName: string; badgeClass: string }> = {
  'table-stakes': {
    shortName: 'Table Stakes',
    badgeClass:
      'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400',
  },
  differentiators: {
    shortName: 'Differentiator',
    badgeClass:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  },
  gaps: {
    shortName: 'Gap',
    badgeClass:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  'anti-patterns': {
    shortName: 'Anti-Pattern',
    badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
}

const categoryDefs: CategoryDef[] = [
  {
    key: 'table-stakes',
    name: 'Table Stakes',
    description:
      'Features every Claude Code plugin is expected to have. Absence is a dealbreaker.',
    icon: 'i-heroicons-check-badge',
    color: 'text-neutral-400',
    features: [
      {
        name: 'Git / GitHub integration',
        description:
          'Branching, committing, and PR creation. Debussy has this via workflow-run and roadmap GitHub Issue sync.',
        owner: 'debussy',
        tag: 'covered',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Multi-file codebase awareness',
        description:
          'Reason across files, not just the current buffer. Inherited from Claude Code core.',
        owner: 'debussy',
        tag: 'inherited',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Conventional commit & PR automation',
        description:
          'Produce clean git history with conventional commits and automated PR descriptions.',
        tag: 'partial',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Code review automation',
        description:
          'The official code-review plugin has 129K+ installs. Code review is expected, not novel.',
        tag: 'external',
        domain: 'review-ux',
        problems: ['P1'],
      },
      {
        name: 'Test generation',
        description:
          "Jest, Vitest, Pytest support. Any workflow plugin that doesn't accommodate testing feels incomplete.",
        tag: 'gap',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Security scanning',
        description:
          'OWASP-based scanning before changes land. Users expect at least basic vulnerability flagging.',
        tag: 'gap',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Context management',
        description:
          'Token efficiency is a first-class concern for power users. Claude-Mem and context-mode address this.',
        tag: 'gap',
        domain: 'context-memory',
        problems: [],
      },
      {
        name: 'Documentation generation',
        description:
          'Create READMEs and API docs. Most coding assistants offer this.',
        tag: 'gap',
        domain: 'dev-core',
        problems: [],
      },
    ],
  },
  {
    key: 'differentiators',
    name: 'Differentiators',
    description:
      'Features that set leaders apart and create competitive advantage.',
    icon: 'i-heroicons-star',
    color: 'text-yellow-500',
    features: [
      {
        name: 'Browser-based review UI',
        description:
          'Structured triage in a browser rather than terminal-only review. Unique in the Claude Code plugin ecosystem — no competitor provides a dedicated browser UI for reviewing AI outputs.',
        owner: 'debussy',
        tag: 'unique',
        domain: 'review-ux',
        problems: ['P1'],
        items: [
          'Keyboard shortcuts: j/k to navigate, a to approve, r to reject, d to discuss',
          'Collapsible group hierarchy for related review items',
          'Session persistence — decisions survive page refresh',
          'Auto-starts from any debussy skill that emits review items',
          'Item metadata: source skill, timestamp, linked file or PR',
        ],
      },
      {
        name: 'Product discovery & strategic planning',
        description:
          'No Claude Code plugin helps with the "what to build" question. Debussy\'s strategy and roadmap skills are unique here.',
        owner: 'debussy',
        tag: 'unique',
        domain: 'product-discovery',
        problems: [],
        items: [
          'Research landscape: competitors, adjacent tools, pricing, differentiators',
          'Audience analysis: primary and secondary segments with jobs-to-be-done',
          'Generate vision.md, landscape.md, product.md, audiences.md, problems.md',
          'Produce intents with P/A cross-references for roadmap sync',
          'Browser review UI for iterating on strategy artifacts without re-running',
        ],
      },
      {
        name: 'Worktree lane management',
        description:
          'Launch independent feature work in isolated git worktrees, switch between active lanes, view cross-lane inbox, and stage branches to root — all from a single interface. Directly addresses P3.',
        owner: 'debussy',
        tag: 'planned',
        domain: 'lane-management',
        problems: ['P3'],
        items: [
          'Create lane from current HEAD or a remote branch with one command',
          'List all active lanes with status: idle / running / review-pending',
          'Switch active lane and restore context (CLAUDE.md scope, open files)',
          'Unified cross-lane inbox — all pending reviews across worktrees in one view',
          'Stage lane: open a PR or fast-forward merge to main',
        ],
      },
      {
        name: 'Live workflow progress',
        description:
          'Real-time step-by-step progress for /workflow-run sessions — current step, elapsed time, wait state, and error details without tailing logs. Directly addresses P2.',
        owner: 'debussy',
        tag: 'planned',
        domain: 'workflow-monitoring',
        problems: ['P2'],
        items: [
          'Step indicator: current step name, N of M count, elapsed time',
          'Visual state per step: queued / running / waiting-human / done / error',
          'Human-gate steps highlighted — unblock without switching terminal context',
          'Surface errors inline with skip / retry / abort actions',
          'Run history persisted to .workflow-runs/ for post-mortem review',
        ],
      },
      {
        name: 'Multi-agent orchestration',
        description:
          'GasTown coordinates 20-30 parallel agents with persistent identity, git-worktree isolation, and a Mayor coordinator. No other plugin manages agent swarms at this scale.',
        tag: 'competitor',
        domain: 'lane-management',
        problems: ['P3'],
        items: [
          'Mayor coordinator assigns tasks and resolves conflicts between workers',
          'Each worker runs in an isolated git worktree to prevent state bleed',
          'Persistent agent identity survives context resets',
          'Real-time coordination log visible to the Mayor',
          'Supports 20–30 concurrent agents with automatic load balancing',
        ],
      },
      {
        name: 'Structured development methodology',
        description:
          'Superpowers enforces Socratic brainstorming, TDD cycles, systematic debugging, and subagent-driven development with two-stage review.',
        tag: 'competitor',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Persistent memory with vector embeddings',
        description:
          'Claude-Mem uses SQLite + vector embeddings for cross-session context. Goes beyond CLAUDE.md-style flat files.',
        tag: 'competitor',
        domain: 'context-memory',
        problems: [],
      },
      {
        name: 'End-to-end ship workflow',
        description:
          'Single command from commit through linting, testing, review, and production deployment.',
        tag: 'competitor',
        domain: 'workflow-monitoring',
        problems: ['P2'],
      },
      {
        name: 'Design-to-code pipeline',
        description:
          'Reads live Figma frames and produces production-grade interfaces. Bridges design and implementation.',
        tag: 'competitor',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Cost & token tracking',
        description:
          'Manifest tracks token usage, cost, and model usage across agents. Addresses the #1 developer complaint (cost opacity).',
        tag: 'competitor',
        domain: 'cost-perf',
        problems: [],
      },
      {
        name: 'Arena Mode for model comparison',
        description:
          'Windsurf side-by-side blind model evaluation with voting. No Claude Code plugin offers objective model comparison.',
        tag: 'competitor',
        domain: 'dev-core',
        problems: [],
      },
    ],
  },
  {
    key: 'gaps',
    name: 'Gaps',
    description:
      'Features users want but nobody provides well. These are opportunities.',
    icon: 'i-heroicons-light-bulb',
    color: 'text-blue-500',
    features: [
      {
        name: 'Feedback loops from human to agent',
        description:
          "No structured way to teach an agent about codebase patterns, review quality, or personal preferences. Debussy's feedback skill partially addresses this but could go further with persistent preference learning.",
        owner: 'debussy',
        tag: 'opportunity',
        domain: 'review-ux',
        problems: ['P1'],
        items: [
          'Approve / reject review items with optional free-text rationale',
          'Aggregate decisions across sessions into a persistent feedback history',
          'Export accumulated feedback as CLAUDE.md preference fragments',
          'Per-skill or global scope: configure which feedback applies where',
          'Drift detection: alert when agent behavior diverges from feedback history',
        ],
      },
      {
        name: 'Workflow observability and audit trails',
        description:
          'The ecosystem lacks lightweight workflow logging that records what an agent did, why, and what the outcome was — reviewable after the fact.',
        owner: 'debussy',
        tag: 'opportunity',
        domain: 'workflow-monitoring',
        problems: ['P2'],
        items: [
          'Per-step log: prompt summary, response, duration, token cost',
          'Human-readable replay of any past workflow run',
          'Diff view: files changed per step with before/after context',
          'Filter by outcome: errors, human gates, or high-cost steps',
          'Export run as a Markdown audit report',
        ],
      },
      {
        name: 'Plugin compatibility management',
        description:
          'Developers report conflicts between simultaneous plugin usage. No tool manages plugin interactions or detects conflicts.',
        owner: 'debussy',
        tag: 'opportunity',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Cost predictability and budget controls',
        description:
          'Developers want to set budgets, get warnings, and see projected costs before starting a task. Manifest tracks usage after the fact but no predictive budgets.',
        tag: 'open',
        domain: 'cost-perf',
        problems: [],
      },
      {
        name: 'Deterministic / reproducible runs',
        description:
          'Developers want consistency. No plugin guarantees deterministic outputs for the same input.',
        tag: 'open',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Plugin update mechanism',
        description:
          'Installed plugins have no built-in update detection or upgrade path. Users must manually check each marketplace repo.',
        tag: 'open',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Offline / local-first development',
        description:
          'Only Lovable AI provides offline functionality across 12 tools surveyed. Claude Code plugins all require internet connectivity.',
        tag: 'open',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Collaborative multi-user workflows',
        description:
          'No Claude Code plugin supports multiple humans reviewing or contributing to the same agent session.',
        tag: 'open',
        domain: 'review-ux',
        problems: ['P1'],
      },
      {
        name: 'Mobile development tooling',
        description:
          'Very few plugins address mobile. Android, React Native, and Flutter are underserved.',
        tag: 'open',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Database management and migration',
        description:
          'The plugin ecosystem lacks dedicated database schema management, migration generation, or query optimization tools.',
        tag: 'open',
        domain: 'dev-core',
        problems: [],
      },
    ],
  },
  {
    key: 'anti-patterns',
    name: 'Anti-Patterns',
    description:
      'Features that seem good but frustrate users in practice. Avoid these.',
    icon: 'i-heroicons-exclamation-triangle',
    color: 'text-red-500',
    features: [
      {
        name: 'Autonomous sessions without checkpoints',
        description:
          'Long autonomous runs produce messy codebases. Developers report: "incredibly exhausting...codebase becomes messy, filled with unnecessary code." Lesson: autonomy needs review gates, not just context resets.',
        tag: 'avoid',
        domain: 'workflow-monitoring',
        problems: ['P2'],
      },
      {
        name: 'Over-generation without quality control',
        description:
          'Optimizing for speed over correctness creates maintenance debt. "What does fast matter if the output is wrong?" Every generation step should have a verification step.',
        tag: 'avoid',
        domain: 'dev-core',
        problems: [],
      },
      {
        name: 'Token-hungry browser automation',
        description:
          'Playwright and Xcode MCP-based UI testing are noted as costly in token consumption. Features that burn tokens for marginal gains lose trust.',
        tag: 'avoid',
        domain: 'cost-perf',
        problems: [],
      },
      {
        name: 'Hidden voting / opaque evaluation',
        description:
          "Windsurf's Arena Mode uses hidden model identities. Opaque methodology makes it hard to trust results. Transparency in evaluation criteria matters more than gamification.",
        tag: 'avoid',
        domain: 'review-ux',
        problems: ['P1'],
      },
      {
        name: 'Magic that varies by run',
        description:
          'Tools that produce different outputs for the same input frustrate developers who need predictability. Consistency and reliability beat cleverness.',
        tag: 'avoid',
        domain: 'dev-core',
        problems: [],
      },
    ],
  },
]

const groupByOptions = [
  { value: 'type', label: 'Type' },
  { value: 'domain', label: 'Domain' },
  { value: 'problem', label: 'Problem' },
]

const groupByMode = ref<GroupByMode>('type')
const selected = ref('differentiators')
const searchQuery = ref('')
const selectedFeature = ref<EnrichedFeature | null>(null)

function setGroupBy(mode: GroupByMode) {
  groupByMode.value = mode
  selected.value = groups.value[0]?.key ?? ''
}

const allFeatures = computed<EnrichedFeature[]>(() =>
  categoryDefs.flatMap((c) => c.features.map((f) => ({ ...f, type: c.key })))
)

const groups = computed<Group[]>(() => {
  if (groupByMode.value === 'type') {
    return categoryDefs.map((c) => ({
      key: c.key,
      name: c.name,
      description: c.description,
      icon: c.icon,
      color: c.color,
      count: c.features.length,
      features: c.features.map((f) => ({ ...f, type: c.key })),
    }))
  }

  if (groupByMode.value === 'domain') {
    return Object.entries(domainMeta)
      .map(([key, meta]) => {
        const features = allFeatures.value.filter((f) => f.domain === key)
        return {
          key,
          name: meta.name,
          description: meta.description,
          icon: meta.icon,
          color: meta.color,
          count: features.length,
          features,
        }
      })
      .filter((g) => g.count > 0)
  }

  // problem mode
  const problemGroups = Object.entries(problemMeta).map(([key, meta]) => {
    const features = allFeatures.value.filter((f) => f.problems.includes(key))
    return {
      key,
      name: meta.name,
      description: meta.description,
      icon: meta.icon,
      color: meta.color,
      count: features.length,
      features,
    }
  })
  const unlinked = allFeatures.value.filter((f) => f.problems.length === 0)
  problemGroups.push({
    key: 'general',
    name: 'General',
    description: 'Features not directly linked to a top-level product problem.',
    icon: 'i-heroicons-minus-circle',
    color: 'text-neutral-400',
    count: unlinked.length,
    features: unlinked,
  })
  return problemGroups
})

const currentGroup = computed(() =>
  groups.value.find((g) => g.key === selected.value)
)

const relatedFeatures = computed<EnrichedFeature[]>(() => {
  if (!selectedFeature.value) return []
  const sf = selectedFeature.value
  return allFeatures.value
    .filter(
      (f) =>
        f.name !== sf.name &&
        (f.domain === sf.domain ||
          (sf.problems.length > 0 &&
            f.problems.some((p) => sf.problems.includes(p))))
    )
    .slice(0, 5)
})

const searchResults = computed<EnrichedFeature[]>(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase()
  return allFeatures.value.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q)
  )
})

function problemBadgeClass(p: string): string {
  return (
    problemMeta[p]?.badgeClass ??
    'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
  )
}

function domainBadgeClass(d: string): string {
  return (
    domainMeta[d]?.badgeClass ??
    'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
  )
}

function typeBadgeClass(t: string): string {
  return (
    typeMeta[t]?.badgeClass ??
    'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
  )
}

function problemCardClass(p: string): string {
  const classes: Record<string, string> = {
    P1: 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20',
    P2: 'border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20',
    P3: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20',
  }
  return (
    classes[p] ??
    'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50'
  )
}

const highlight = (text: string) => {
  if (!searchQuery.value.trim()) return text
  const escaped = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="bg-yellow-100 dark:bg-yellow-900/40 text-inherit rounded px-0.5">$1</mark>'
  )
}
</script>
