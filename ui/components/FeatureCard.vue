<template>
  <button
    type="button"
    class="w-full cursor-pointer rounded-lg border text-left transition-colors"
    :class="
      isSelected
        ? 'bg-surface-hover-subtle border-line-active'
        : 'border-line bg-surface hover:border-neutral-300 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50'
    "
    @click="emit('select', feature)"
  >
    <div :class="compact ? 'p-3' : 'p-4'">
      <div
        class="flex items-start justify-between gap-3"
        :class="compact ? '' : 'mb-1'"
      >
        <h3
          class="text-sm font-semibold"
          v-html="highlight(feature.name, searchQuery ?? '')"
        />
        <div
          class="flex flex-shrink-0 flex-wrap items-center justify-end gap-1"
        >
          <span
            v-for="p in feature.problems"
            :key="p"
            class="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
            :class="problemBadgeClass(p)"
            :title="problemMeta[p]?.description"
          >{{ p }}</span>
          <span
            v-if="showDomain !== false"
            class="inline-flex items-center rounded px-2 py-0.5 text-xs"
            :class="domainBadgeClass(feature.domain)"
          >{{ domainMeta[feature.domain]?.name }}</span>
          <span
            v-if="showType"
            class="inline-flex items-center rounded px-2 py-0.5 text-xs"
            :class="typeBadgeClass(feature.type)"
          >{{ typeMeta[feature.type]?.shortName }}</span>
          <UBadge
            v-if="showOwner && feature.owner"
            :label="feature.owner"
            color="primary"
            variant="subtle"
            size="xs"
          />
          <UBadge
            v-if="showOwner && feature.tag"
            :label="feature.tag"
            color="neutral"
            variant="subtle"
            size="xs"
          />
        </div>
      </div>
      <p
        v-if="!compact"
        class="text-content-subtle text-sm leading-relaxed"
        v-html="highlight(feature.description, searchQuery ?? '')"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import type { EnrichedFeature } from '~/composables/useFeatureSpace'

withDefaults(
  defineProps<{
    feature: EnrichedFeature
    isSelected: boolean
    compact: boolean
    searchQuery?: string
    showType?: boolean
    showOwner?: boolean
    showDomain?: boolean
  }>(),
  { showDomain: true }
)

const emit = defineEmits<{ select: [EnrichedFeature] }>()
</script>
