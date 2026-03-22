<template>
  <div>
    <button
      class="mb-6 flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
      @click="emit('navigate', 'principles-index')"
    >
      <UIcon name="i-heroicons-arrow-left" class="size-3.5" />
      Design Principles
    </button>
    <div class="mb-6 flex items-start justify-between">
      <div class="flex items-start gap-4">
        <div
          class="bg-surface-sunken flex size-8 flex-shrink-0 items-center justify-center rounded-full"
        >
          <span class="text-sm font-bold text-neutral-500">{{
            principle.num
          }}</span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-semibold">
              {{ principle.name }}
            </h2>
            <span
              v-if="principleNeedsReview"
              class="text-xs font-medium text-amber-600 dark:text-amber-400"
              >· under discussion</span
            >
          </div>
        </div>
      </div>
      <button
        class="flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
        :class="
          flagged.has('principle:' + principle.num)
            ? 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
            : 'bg-surface text-content-subtle border-line-raised hover:border-neutral-300'
        "
        @click="emit('toggleFlag', 'principle:' + principle.num)"
      >
        <UIcon name="i-heroicons-flag" class="size-3.5" />
        {{
          flagged.has('principle:' + principle.num)
            ? 'Revisit flagged'
            : 'Flag for revisit'
        }}
      </button>
    </div>

    <p class="text-content-muted mb-8 text-sm leading-relaxed">
      {{ principle.description }}
    </p>

    <div v-if="principle.relatedAdrs?.length">
      <h3 class="text-content-secondary mb-3 text-sm font-semibold">
        Related decisions
      </h3>
      <div class="space-y-2">
        <div
          v-for="adrKey in principle.relatedAdrs"
          :key="adrKey"
          class="border-line bg-surface flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          @click="emit('navigate', 'adr', adrKey)"
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
              adrStatusColor(adrs.find((a) => a.key === adrKey)?.status || '')
            "
            variant="subtle"
            size="xs"
          />
          <UIcon
            name="i-heroicons-chevron-right"
            class="text-content-ghost size-4 flex-shrink-0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Principle, Adr, ViewType } from '~/composables/useArchitecture'

const props = defineProps<{
  principle: Principle
  adrs: Adr[]
  flagged: Set<string>
}>()

const emit = defineEmits<{
  navigate: [view: ViewType, key?: string]
  toggleFlag: [key: string]
}>()

const principleNeedsReview = computed(() =>
  props.principle.relatedAdrs?.some(
    (key) => props.adrs.find((a) => a.key === key)?.status === 'Proposed'
  )
)
</script>
