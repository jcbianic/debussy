<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-semibold">
        Design Principles
      </h2>
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
      <button
        v-for="p in principles"
        :key="p.num"
        type="button"
        class="bg-surface w-full cursor-pointer rounded-lg border p-4 text-left transition-colors"
        :class="
          principleNeedsReview(p)
            ? 'border-amber-200 hover:bg-amber-50/30 dark:border-amber-900/60 dark:hover:bg-amber-950/20'
            : 'border-line hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
        "
        @click="emit('navigate', 'principle', p.num)"
      >
        <div class="flex items-start gap-3">
          <div
            class="bg-surface-sunken mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full"
          >
            <span class="text-xs font-bold text-neutral-500">{{ p.num }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-center gap-2">
              <h3 class="text-sm font-semibold">
                {{ p.name }}
              </h3>
              <span
                v-if="principleNeedsReview(p)"
                class="text-xs text-amber-600 dark:text-amber-400"
              >· under discussion</span>
              <span
                v-if="flagged.has('principle:' + p.num)"
                class="text-xs text-red-500 dark:text-red-400"
              >· revisit flagged</span>
            </div>
            <p class="text-content-subtle line-clamp-2 text-sm leading-relaxed">
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
              >{{ adrs.find((a) => a.key === adrKey)?.id }}</span>
            </div>
          </div>
          <UIcon
            name="i-heroicons-chevron-right"
            class="text-content-ghost mt-1 size-4 flex-shrink-0"
          />
        </div>
      </button>
      <div
        v-if="principles.length === 0"
        class="py-10 text-center text-sm text-neutral-400"
      >
        No principles match "{{ principleSearch }}"
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Principle, Adr, ViewType } from '~/composables/useArchitecture'

const principleSearch = defineModel<string>('principleSearch', {
  required: true,
})

const props = defineProps<{
  principles: Principle[]
  adrs: Adr[]
  flagged: Set<string>
}>()

const emit = defineEmits<{
  navigate: [view: ViewType, key?: string]
}>()

function principleNeedsReview(p: Principle) {
  return p.relatedAdrs?.some(
    (key) => props.adrs.find((a) => a.key === key)?.status === 'Proposed'
  )
}

function adrChipClass(adrKey: string) {
  const adr = props.adrs.find((a) => a.key === adrKey)
  if (adr?.status === 'Proposed') {
    return 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
  }
  return 'border-line-raised bg-surface-sunken text-content-muted'
}
</script>
