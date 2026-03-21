<template>
  <div class="flex h-full">

    <!-- Left panel: artifact list -->
    <div class="w-56 flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div class="px-5 py-5 border-b border-neutral-200 dark:border-neutral-800">
        <h1 class="text-sm font-semibold">Product of debussy</h1>
        <p class="mt-0.5 text-xs text-neutral-400 font-mono">~/Projets/Libon-Data/debussy</p>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="artifact in artifacts"
          :key="artifact.key"
          class="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
          :class="selected === artifact.key
            ? 'bg-neutral-50 dark:bg-neutral-800'
            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'"
          @click="selected = artifact.key"
        >
          <UIcon :name="artifact.icon" class="size-4 text-neutral-400 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ artifact.name }}</div>
            <div class="text-xs text-neutral-400 mt-0.5 font-mono truncate">{{ artifact.file }}</div>
          </div>
          <UBadge
            :label="artifact.status"
            :color="artifact.status === 'reviewed' ? 'success' : 'warning'"
            variant="subtle"
            size="xs"
          />
        </div>
      </div>
      <div class="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
        Last run 2 days ago
      </div>
    </div>

    <!-- Right panel: content -->
    <div class="flex-1 overflow-auto px-8 py-8">
      <div v-if="currentArtifact">

        <div class="flex items-start justify-between mb-8">
          <div>
            <h2 class="text-xl font-semibold">{{ currentArtifact.name }}</h2>
            <div class="flex items-center gap-3 mt-1.5">
              <span class="text-xs text-neutral-400 font-mono">{{ currentArtifact.file }}</span>
              <UBadge
                :label="currentArtifact.status"
                :color="currentArtifact.status === 'reviewed' ? 'success' : 'warning'"
                variant="subtle"
                size="xs"
              />
            </div>
          </div>
          <UButton label="Request revision" icon="i-heroicons-pencil" size="sm" color="neutral" variant="outline" />
        </div>

        <div class="space-y-8">
          <div v-for="section in currentArtifact.sections" :key="section.title">
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">{{ section.title }}</h3>
            <div class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-3">
              <p v-for="(para, i) in section.content" :key="i">{{ para }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
interface ArtifactSection { title: string; content: string[] }
interface Artifact { key: string; name: string; file: string; icon: string; status: 'reviewed' | 'draft'; sections: ArtifactSection[] }

const artifacts: Artifact[] = [
  {
    key: 'vision', name: 'Vision', file: 'docs/strategy/vision.md', icon: 'i-heroicons-eye', status: 'reviewed',
    sections: [
      { title: 'Problem', content: [
        'Solo builders using Claude Code face three compounding frictions: review UX is poor (no keyboard nav, slow startup), workflow runs are opaque (no live progress), and parallel work across worktrees has no management layer.',
        'Each friction is small individually, but together they break the async AI-assisted development flow that makes Claude Code compelling for solo work.',
      ]},
      { title: 'Vision', content: [
        'Debussy is a Claude Code plugin that restores flow. It makes the review loop fast, workflow runs observable, and parallel lanes manageable — without requiring a separate app, a database, or a running service.',
        'Everything runs locally, on-demand, and disappears when not needed.',
      ]},
      { title: 'Success looks like', content: [
        'A 20-item review session takes under 2 minutes. Running /strategy produces artifacts you trust without manual prompting. Two independent features can be developed in parallel without git conflicts or context bleed.',
      ]},
    ],
  },
  {
    key: 'landscape', name: 'Landscape', file: 'docs/strategy/landscape.md', icon: 'i-heroicons-globe-alt', status: 'reviewed',
    sections: [
      { title: 'Adjacent tools', content: [
        'Linear, GitHub Projects, and Notion address project management at a team level. They require configuration, have their own UIs, and are designed for collaboration — not for a single developer in a terminal.',
        'Claude Code itself has no project management layer. MCP servers can extend it, but none currently address the review-loop or parallel-lane problem.',
      ]},
      { title: 'Differentiation', content: [
        'Debussy lives inside Claude Code as a plugin. It has no database, no login, no cloud. The UX is the terminal and a lightweight local web view. The audience is a single developer who wants to move fast without managing infrastructure.',
      ]},
      { title: 'Key competitors', content: [
        'GasTown (multi-agent orchestration, 20-30 parallel agents), Superpowers (structured methodology, TDD enforcement), and Claude-Mem (persistent vector memory) are the nearest differentiators in the Claude Code ecosystem.',
        'None of them address the browser-based review loop, structured product discovery, or lane management that Debussy targets.',
      ]},
    ],
  },
  {
    key: 'product', name: 'Product', file: 'docs/strategy/product.md', icon: 'i-heroicons-cube', status: 'draft',
    sections: [
      { title: 'Core capabilities (draft)', content: [
        'Review loop: serve review items from any skill session in a browser UI with keyboard navigation, group hierarchy, and approve/reject/discuss actions.',
        'Workflow monitoring: show live progress for /workflow-run sessions — current step, elapsed time, what it\'s waiting on.',
        'Lane management: launch independent work in git worktrees, switch between them, stage a branch to root, and see cross-lane inbox.',
      ]},
      { title: 'Open questions', content: [
        'What is the right persistence model for review decisions? File-based? Git notes?',
        'Should lane management require a running server, or can it be purely file-driven?',
      ]},
    ],
  },
  {
    key: 'audiences', name: 'Audiences', file: 'docs/strategy/audiences.md', icon: 'i-heroicons-users', status: 'reviewed',
    sections: [
      { title: 'Primary audience', content: [
        'A1: Solo Builders — individual developers using Claude Code as their primary coding assistant. They run multiple workstreams in parallel (feature development, bug fixes, documentation) and need lightweight coordination without team tooling overhead.',
      ]},
      { title: 'Secondary audience', content: [
        'Small teams (2-3 developers) who share a Claude Code setup but work independently on separate branches. They could benefit from cross-lane visibility and shared review queues.',
      ]},
    ],
  },
  {
    key: 'problems', name: 'Problems', file: 'docs/strategy/problems.md', icon: 'i-heroicons-exclamation-triangle', status: 'reviewed',
    sections: [
      { title: 'P1 — Review friction', content: [
        'The browser-based review UIs (feedback, strategy) require manual server startup, have no keyboard navigation, and are slow to load. A 5-item review takes several minutes when it should take seconds.',
      ]},
      { title: 'P2 — Workflow opacity', content: [
        'Long-running workflow-run sessions have no live progress indicator. The developer must tail logs or wait blindly for completion.',
      ]},
      { title: 'P3 — Lane management', content: [
        'Working across multiple git worktrees is powerful but unmanaged. There is no way to see all active worktrees, their pending reviews, or switch between them from a single interface.',
      ]},
    ],
  },
]

const selected = ref('vision')
const currentArtifact = computed(() => artifacts.find(a => a.key === selected.value))
</script>
