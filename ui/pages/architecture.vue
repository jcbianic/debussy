<template>
  <TwoPanelLayout>
    <!-- Left panel -->
    <template #left>
      <div
        class="border-b border-neutral-200 px-5 py-5 dark:border-neutral-800"
      >
        <h1 class="text-sm font-semibold">Architecture of debussy</h1>
        <p class="mt-0.5 font-mono text-xs text-neutral-400">
          ~/Projets/Libon-Data/debussy
        </p>
      </div>
      <nav class="flex-1 overflow-y-auto">
        <!-- Principles nav -->
        <div
          class="border-b border-neutral-100 px-5 py-2.5 dark:border-neutral-800"
        >
          <div
            class="text-xs font-medium tracking-wider text-neutral-400 uppercase"
          >
            Principles
          </div>
        </div>
        <button
          class="flex w-full items-center gap-3 border-b border-neutral-100 px-5 py-3 text-left transition-colors dark:border-neutral-800"
          :class="
            view === 'principles-index' || view === 'principle'
              ? 'bg-neutral-50 dark:bg-neutral-800'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          "
          @click="goTo('principles-index')"
        >
          <UIcon
            name="i-heroicons-scale"
            class="size-4 flex-shrink-0 text-neutral-400"
          />
          <span class="flex-1 text-sm font-medium">Design Principles</span>
          <div
            v-if="hasProposedForPrinciples"
            class="size-2 flex-shrink-0 rounded-full bg-amber-400"
          />
          <UBadge
            v-if="flaggedPrinciplesCount"
            :label="String(flaggedPrinciplesCount)"
            color="error"
            variant="subtle"
            size="xs"
          />
        </button>

        <!-- Decisions nav -->
        <div
          class="border-b border-neutral-100 px-5 py-2.5 dark:border-neutral-800"
        >
          <div
            class="text-xs font-medium tracking-wider text-neutral-400 uppercase"
          >
            Decisions
          </div>
        </div>
        <button
          class="flex w-full items-center gap-3 border-b border-neutral-100 px-5 py-3 text-left transition-colors dark:border-neutral-800"
          :class="
            view === 'decisions-index' || view === 'adr'
              ? 'bg-neutral-50 dark:bg-neutral-800'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          "
          @click="goTo('decisions-index')"
        >
          <UIcon
            name="i-heroicons-document-text"
            class="size-4 flex-shrink-0 text-neutral-400"
          />
          <span class="flex-1 text-sm font-medium">All Decisions</span>
          <UBadge
            v-if="proposedCount"
            :label="String(proposedCount)"
            color="warning"
            variant="subtle"
            size="xs"
          />
        </button>
      </nav>
    </template>

    <!-- Right panel -->
    <div class="flex-1 overflow-auto px-8 py-8">
      <!-- Principles index -->
      <div v-if="view === 'principles-index'">
        <div class="mb-6">
          <h2 class="text-xl font-semibold">Design Principles</h2>
          <p class="mt-1 text-sm text-neutral-400">
            Architectural constraints that govern all decisions.
          </p>
        </div>
        <div class="mb-5">
          <UInput
            v-model="principleSearch"
            placeholder="Search principles…"
            icon="i-heroicons-magnifying-glass"
            size="sm"
            class="max-w-sm"
          />
        </div>
        <div class="space-y-2">
          <div
            v-for="p in filteredPrinciples"
            :key="p.num"
            class="cursor-pointer rounded-lg border bg-white p-4 transition-colors dark:bg-neutral-900"
            :class="
              principleNeedsReview(p)
                ? 'border-amber-200 hover:bg-amber-50/30 dark:border-amber-900/60 dark:hover:bg-amber-950/20'
                : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50'
            "
            @click="goTo('principle', p.num)"
          >
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
              >
                <span class="text-xs font-bold text-neutral-500">{{
                  p.num
                }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="mb-1 flex items-center gap-2">
                  <h3 class="text-sm font-semibold">{{ p.name }}</h3>
                  <span
                    v-if="principleNeedsReview(p)"
                    class="text-xs text-amber-600 dark:text-amber-400"
                    >· under discussion</span
                  >
                  <span
                    v-if="flagged.has('principle:' + p.num)"
                    class="text-xs text-red-500 dark:text-red-400"
                    >· revisit flagged</span
                  >
                </div>
                <p
                  class="line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400"
                >
                  {{ p.description }}
                </p>
                <div
                  v-if="p.relatedAdrs?.length"
                  class="mt-2 flex flex-wrap gap-1.5"
                >
                  <span
                    v-for="adrKey in p.relatedAdrs"
                    :key="adrKey"
                    class="rounded border px-1.5 py-0.5 font-mono text-xs"
                    :class="adrChipClass(adrKey)"
                    >{{ adrs.find((a) => a.key === adrKey)?.id }}</span
                  >
                </div>
              </div>
              <UIcon
                name="i-heroicons-chevron-right"
                class="mt-1 size-4 flex-shrink-0 text-neutral-300 dark:text-neutral-600"
              />
            </div>
          </div>
          <div
            v-if="filteredPrinciples.length === 0"
            class="py-10 text-center text-sm text-neutral-400"
          >
            No principles match "{{ principleSearch }}"
          </div>
        </div>
      </div>

      <!-- Principle detail -->
      <div v-else-if="view === 'principle' && currentPrinciple">
        <button
          class="mb-6 flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
          @click="goTo('principles-index')"
        >
          <UIcon name="i-heroicons-arrow-left" class="size-3.5" />
          Design Principles
        </button>
        <div class="mb-6 flex items-start justify-between">
          <div class="flex items-start gap-4">
            <div
              class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
            >
              <span class="text-sm font-bold text-neutral-500">{{
                currentPrinciple.num
              }}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-semibold">
                  {{ currentPrinciple.name }}
                </h2>
                <span
                  v-if="principleNeedsReview(currentPrinciple)"
                  class="text-xs font-medium text-amber-600 dark:text-amber-400"
                  >· under discussion</span
                >
              </div>
            </div>
          </div>
          <button
            class="flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            :class="
              flagged.has('principle:' + currentPrinciple.num)
                ? 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
            "
            @click="toggleFlag('principle:' + currentPrinciple.num)"
          >
            <UIcon name="i-heroicons-flag" class="size-3.5" />
            {{
              flagged.has('principle:' + currentPrinciple.num)
                ? 'Revisit flagged'
                : 'Flag for revisit'
            }}
          </button>
        </div>

        <p
          class="mb-8 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
        >
          {{ currentPrinciple.description }}
        </p>

        <div v-if="currentPrinciple.relatedAdrs?.length">
          <h3
            class="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            Related decisions
          </h3>
          <div class="space-y-2">
            <div
              v-for="adrKey in currentPrinciple.relatedAdrs"
              :key="adrKey"
              class="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/50"
              @click="goTo('adr', adrKey)"
            >
              <UIcon
                name="i-heroicons-document-text"
                class="size-4 flex-shrink-0 text-neutral-400"
              />
              <span class="flex-shrink-0 font-mono text-xs text-neutral-400">{{
                adrs.find((a) => a.key === adrKey)?.id
              }}</span>
              <span class="flex-1 text-sm font-medium">{{
                adrs.find((a) => a.key === adrKey)?.title
              }}</span>
              <UBadge
                :label="adrs.find((a) => a.key === adrKey)?.status || ''"
                :color="
                  statusColor(adrs.find((a) => a.key === adrKey)?.status || '')
                "
                variant="subtle"
                size="xs"
              />
              <UIcon
                name="i-heroicons-chevron-right"
                class="size-4 flex-shrink-0 text-neutral-300 dark:text-neutral-600"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Decisions index -->
      <div v-else-if="view === 'decisions-index'">
        <div class="mb-6">
          <h2 class="text-xl font-semibold">Decisions</h2>
          <p class="mt-1 text-sm text-neutral-400">
            Architecture Decision Records — what was decided and why.
          </p>
        </div>
        <div class="mb-5">
          <UInput
            v-model="adrSearch"
            placeholder="Search decisions…"
            icon="i-heroicons-magnifying-glass"
            size="sm"
            class="max-w-sm"
          />
        </div>
        <div
          class="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
        >
          <table class="w-full text-sm">
            <thead>
              <tr
                class="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <th
                  class="w-12 px-4 py-2.5 text-left text-xs font-medium text-neutral-500"
                >
                  ID
                </th>
                <th
                  class="px-4 py-2.5 text-left text-xs font-medium text-neutral-500"
                >
                  Title
                </th>
                <th
                  class="px-4 py-2.5 text-left text-xs font-medium text-neutral-500"
                >
                  Principles
                </th>
                <th
                  class="w-24 px-4 py-2.5 text-left text-xs font-medium text-neutral-500"
                >
                  Status
                </th>
                <th
                  class="w-28 px-4 py-2.5 text-left text-xs font-medium text-neutral-500"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="adr in filteredAdrs"
                :key="adr.key"
                class="cursor-pointer border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
                @click="goTo('adr', adr.key)"
              >
                <td class="px-4 py-3 font-mono text-xs text-neutral-400">
                  {{ adr.id }}
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ adr.title }}</div>
                  <div
                    v-if="flagged.has('adr:' + adr.key)"
                    class="mt-0.5 text-xs text-red-500 dark:text-red-400"
                  >
                    revision flagged
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="num in adr.affectedPrinciples || []"
                      :key="num"
                      class="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-500 dark:bg-neutral-800"
                      >P{{ num }}</span
                    >
                  </div>
                </td>
                <td class="px-4 py-3">
                  <UBadge
                    :label="adr.status"
                    :color="statusColor(adr.status)"
                    variant="subtle"
                    size="xs"
                  />
                </td>
                <td class="px-4 py-3 font-mono text-xs text-neutral-400">
                  {{ adr.date }}
                </td>
              </tr>
              <tr v-if="filteredAdrs.length === 0">
                <td
                  colspan="5"
                  class="px-4 py-10 text-center text-sm text-neutral-400"
                >
                  No decisions match "{{ adrSearch }}"
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ADR detail -->
      <div v-else-if="view === 'adr' && currentAdr">
        <button
          class="mb-6 flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
          @click="goTo('decisions-index')"
        >
          <UIcon name="i-heroicons-arrow-left" class="size-3.5" />
          Decisions
        </button>
        <div class="mb-8 flex items-start justify-between">
          <div>
            <div class="mb-1 font-mono text-xs text-neutral-400">
              {{ currentAdr.id }} · {{ currentAdr.date }}
            </div>
            <h2 class="text-xl font-semibold">{{ currentAdr.title }}</h2>
            <div class="mt-2 flex items-center gap-2">
              <UBadge
                :label="currentAdr.status"
                :color="statusColor(currentAdr.status)"
                variant="subtle"
                size="sm"
              />
              <a
                v-if="currentAdr.issue"
                :href="currentAdr.issue"
                class="font-mono text-xs text-blue-500 hover:underline"
                >{{ currentAdr.issueLabel }}</a
              >
              <span
                v-if="currentAdr.supersedes"
                class="text-xs text-neutral-400"
              >
                supersedes
                <button
                  class="font-mono text-blue-500 hover:underline"
                  @click="goTo('adr', currentAdr.supersedes!)"
                >
                  {{ adrs.find((a) => a.key === currentAdr?.supersedes)?.id }}
                </button>
              </span>
            </div>
          </div>
          <button
            class="flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            :class="
              flagged.has('adr:' + currentAdr.key)
                ? 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
            "
            @click="toggleFlag('adr:' + currentAdr.key)"
          >
            <UIcon name="i-heroicons-flag" class="size-3.5" />
            {{
              flagged.has('adr:' + currentAdr.key)
                ? 'Revision flagged'
                : 'Flag for revision'
            }}
          </button>
        </div>

        <!-- Affects principles callout -->
        <div
          v-if="currentAdr.affectedPrinciples?.length"
          class="mb-6 flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50"
        >
          <UIcon
            name="i-heroicons-scale"
            class="mt-0.5 size-4 flex-shrink-0 text-neutral-400"
          />
          <div>
            <div class="mb-1.5 text-xs font-medium text-neutral-500">
              Affects principles
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="num in currentAdr.affectedPrinciples"
                :key="num"
                class="rounded border border-neutral-200 bg-white px-2 py-0.5 font-mono text-xs text-neutral-600 transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                @click="goTo('principle', num)"
              >
                P{{ num }} · {{ principles.find((p) => p.num === num)?.name }}
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-8">
          <div v-for="section in currentAdr.sections" :key="section.title">
            <h3
              class="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {{ section.title }}
            </h3>
            <div
              class="space-y-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              <p v-for="(para, i) in section.content" :key="i">{{ para }}</p>
            </div>
            <div
              v-if="section.table"
              class="mt-4 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
            >
              <table class="w-full text-xs">
                <thead>
                  <tr
                    class="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <th
                      v-for="col in section.table.headers"
                      :key="col"
                      class="px-4 py-2.5 text-left font-medium text-neutral-500"
                    >
                      {{ col }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, i) in section.table.rows"
                    :key="i"
                    class="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800"
                  >
                    <td
                      v-for="(cell, j) in row"
                      :key="j"
                      class="px-4 py-2.5 text-neutral-600 dark:text-neutral-400"
                    >
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TwoPanelLayout>
</template>

<script setup lang="ts">
interface AdrSection {
  title: string
  content: string[]
  table?: { headers: string[]; rows: string[][] }
}
interface Adr {
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
interface Principle {
  num: string
  name: string
  description: string
  relatedAdrs?: string[]
}

const principles: Principle[] = [
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

const adrs: Adr[] = [
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

type ViewType = 'principles-index' | 'principle' | 'decisions-index' | 'adr'

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
  () => principles.filter((p) => flagged.value.has('principle:' + p.num)).length
)
const proposedCount = computed(
  () => adrs.filter((a) => a.status === 'Proposed').length
)
const hasProposedForPrinciples = computed(() =>
  adrs.some((a) => a.status === 'Proposed' && a.affectedPrinciples?.length)
)

function statusColor(status: string) {
  if (status === 'Accepted') return 'success'
  if (status === 'Proposed') return 'warning'
  return 'neutral'
}

function principleNeedsReview(p: Principle) {
  return p.relatedAdrs?.some(
    (key) => adrs.find((a) => a.key === key)?.status === 'Proposed'
  )
}

function adrChipClass(adrKey: string) {
  const adr = adrs.find((a) => a.key === adrKey)
  if (adr?.status === 'Proposed') {
    return 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
  }
  return 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
}
</script>
