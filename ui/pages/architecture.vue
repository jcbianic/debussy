<template>
  <TwoPanelLayout>
    <!-- Left panel -->
    <template #left>
      <div class="border-line border-b px-5 py-5">
        <h1 class="text-sm font-semibold">
          Architecture of {{ projectName }}
        </h1>
        <p class="mt-0.5 font-mono text-xs text-neutral-400">
          {{ projectPath }}
        </p>
      </div>
      <nav class="flex-1 overflow-y-auto">
        <!-- Principles nav -->
        <div class="border-line-subtle border-b px-5 py-2.5">
          <div
            class="text-xs font-medium tracking-wider text-neutral-400 uppercase"
          >
            Principles
          </div>
        </div>
        <button
          class="border-line-subtle flex w-full items-center gap-3 border-b px-5 py-3 text-left transition-colors"
          :class="
            view === 'principles-index' || view === 'principle'
              ? 'bg-surface-hover-subtle'
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
        <div class="border-line-subtle border-b px-5 py-2.5">
          <div
            class="text-xs font-medium tracking-wider text-neutral-400 uppercase"
          >
            Decisions
          </div>
        </div>
        <button
          class="border-line-subtle flex w-full items-center gap-3 border-b px-5 py-3 text-left transition-colors"
          :class="
            view === 'decisions-index' || view === 'adr'
              ? 'bg-surface-hover-subtle'
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
      <ArchitecturePrinciplesIndex
        v-if="view === 'principles-index'"
        v-model:principle-search="principleSearch"
        :principles="filteredPrinciples"
        :adrs="adrs"
        :flagged="flagged"
        @navigate="goTo"
      />
      <ArchitecturePrincipleDetail
        v-else-if="view === 'principle' && currentPrinciple"
        :principle="currentPrinciple"
        :adrs="adrs"
        :flagged="flagged"
        @navigate="goTo"
        @toggle-flag="toggleFlag"
      />
      <ArchitectureDecisionsIndex
        v-else-if="view === 'decisions-index'"
        v-model:adr-search="adrSearch"
        :adrs="filteredAdrs"
        :flagged="flagged"
        @navigate="goTo"
      />
      <ArchitectureAdrDetail
        v-else-if="view === 'adr' && currentAdr"
        :adr="currentAdr"
        :adrs="adrs"
        :principles="principles"
        :flagged="flagged"
        @navigate="goTo"
        @toggle-flag="toggleFlag"
      />
    </div>
  </TwoPanelLayout>
</template>

<script setup lang="ts">
const { name: projectName, path: projectPath } = useProjectConfig()
const {
  view,
  goTo,
  currentPrinciple,
  currentAdr,
  principleSearch,
  adrSearch,
  filteredPrinciples,
  filteredAdrs,
  principles,
  adrs,
  flagged,
  toggleFlag,
  flaggedPrinciplesCount,
  proposedCount,
  hasProposedForPrinciples,
  refresh,
} = useArchitecture()

// Live reload when principles or ADR files change
let es: EventSource | null = null
onMounted(() => {
  es = new EventSource('/api/watch')
  es.onmessage = () => refresh()
})
onUnmounted(() => es?.close())
</script>
