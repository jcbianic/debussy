<template>
  <div class="border-line border-t pt-4">
    <div
      class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
    >
      Related
    </div>
    <div class="space-y-1">
      <button
        v-for="f in related"
        :key="f.name"
        type="button"
        class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
        @click="emit('select', f)"
      >
        <span
          v-if="f.problems[0]"
          class="inline-flex flex-shrink-0 items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
          :class="problemBadgeClass(f.problems[0])"
        >{{ f.problems[0] }}</span>
        <span
          v-else
          class="text-content-ghost flex-shrink-0 text-xs"
        >—</span>
        <span class="flex-1 truncate text-sm">{{ f.name }}</span>
        <span
          class="flex-shrink-0 text-xs"
          :class="domainMeta[f.domain]?.color"
        >{{ domainMeta[f.domain]?.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EnrichedFeature } from '~/composables/useFeatureSpace'

defineProps<{ related: EnrichedFeature[] }>()
const emit = defineEmits<{ select: [EnrichedFeature] }>()
</script>
