<template>
  <div>
    <h3 class="text-content-secondary mb-3 text-sm font-semibold">
      Related decisions
    </h3>
    <div class="space-y-2">
      <button
        v-for="adrKey in relatedAdrKeys"
        :key="adrKey"
        type="button"
        class="border-line bg-surface flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
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
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Adr, ViewType } from '~/composables/useArchitecture'

defineProps<{
  relatedAdrKeys: string[]
  adrs: Adr[]
}>()

const emit = defineEmits<{
  navigate: [view: ViewType, key?: string]
}>()
</script>
