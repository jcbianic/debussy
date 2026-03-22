<template>
  <div class="flex-1 overflow-auto px-6 py-5">
    <!-- Header -->
    <div class="mb-4 flex items-start justify-between gap-4">
      <h2 class="text-base leading-tight font-semibold">
        {{ feature.name }}
      </h2>
      <button
        class="flex-shrink-0 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
        @click="emit('close')"
      >
        <UIcon
          name="i-heroicons-x-mark"
          class="size-4"
        />
      </button>
    </div>

    <!-- Badges -->
    <div class="mb-5 flex flex-wrap gap-1.5">
      <span
        v-for="p in feature.problems"
        :key="p"
        class="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
        :class="problemBadgeClass(p)"
        :title="problemMeta[p]?.description"
      >{{ p }}</span>
      <span
        class="inline-flex items-center rounded px-2 py-0.5 text-xs"
        :class="domainBadgeClass(feature.domain)"
      >{{ domainMeta[feature.domain]?.name }}</span>
      <span
        class="inline-flex items-center rounded px-2 py-0.5 text-xs"
        :class="typeBadgeClass(feature.type)"
      >{{ typeMeta[feature.type]?.shortName }}</span>
      <UBadge
        v-if="feature.owner"
        :label="feature.owner"
        color="primary"
        variant="subtle"
        size="xs"
      />
      <UBadge
        v-if="feature.tag"
        :label="feature.tag"
        color="neutral"
        variant="subtle"
        size="xs"
      />
    </div>

    <FeatureProblemRefs
      v-if="feature.problems.length"
      :problems="feature.problems"
    />

    <!-- Description -->
    <div class="mb-5">
      <div
        class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
      >
        Description
      </div>
      <p class="text-content-muted text-sm leading-relaxed">
        {{ feature.description }}
      </p>
    </div>

    <!-- Breakdown -->
    <div
      v-if="feature.items?.length"
      class="mb-5"
    >
      <div
        class="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
      >
        Breakdown
      </div>
      <ul class="space-y-2.5">
        <li
          v-for="item in feature.items"
          :key="item"
          class="text-content-muted flex items-start gap-2.5 text-sm"
        >
          <UIcon
            name="i-heroicons-chevron-right"
            class="mt-0.5 size-3.5 flex-shrink-0 text-neutral-400"
          />
          {{ item }}
        </li>
      </ul>
    </div>

    <FeatureRelatedItems
      v-if="related.length"
      :related="related"
      @select="emit('select', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { EnrichedFeature } from '~/composables/useFeatureSpace'

defineProps<{ feature: EnrichedFeature; related: EnrichedFeature[] }>()
const emit = defineEmits<{ close: []; select: [EnrichedFeature] }>()
</script>
