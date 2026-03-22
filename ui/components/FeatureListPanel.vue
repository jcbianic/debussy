<template>
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- Search bar -->
    <div
      class="border-line bg-surface flex flex-shrink-0 items-center gap-3 border-b px-6 py-4"
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
          aria-label="Search features"
          class="bg-surface-sunken w-full rounded-lg border-0 py-2 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600"
        >
        <button
          v-if="searchQuery"
          class="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          @click="searchQuery = ''"
        >
          <UIcon
            name="i-heroicons-x-mark"
            class="size-3.5"
          />
        </button>
      </div>
    </div>

    <!-- Content: list + optional detail panel -->
    <div class="flex flex-1 overflow-hidden">
      <div
        class="overflow-auto py-5 transition-[width,padding]"
        :class="
          selectedFeature
            ? 'border-line w-96 flex-shrink-0 border-r px-4'
            : 'flex-1 px-6'
        "
      >
        <FeatureSearchResults
          v-if="searchQuery"
          :search-results="searchResults"
          :search-query="searchQuery"
          :selected-feature-name="selectedFeature?.name ?? null"
          :compact="!!selectedFeature"
          @select="selectedFeature = $event"
        />
        <FeatureGroupView
          v-else-if="currentGroup"
          :group="currentGroup"
          :group-by-mode="groupByMode"
          :selected-feature-name="selectedFeature?.name ?? null"
          :compact="!!selectedFeature"
          @select="selectedFeature = $event"
        />
      </div>
      <FeatureDetailPanel
        v-if="selectedFeature"
        :feature="selectedFeature"
        :related="relatedFeatures"
        @close="selectedFeature = null"
        @select="selectedFeature = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  EnrichedFeature,
  Group,
  GroupByMode,
} from '~/composables/useFeatureSpace'

const selectedFeature = defineModel<EnrichedFeature | null>('selectedFeature', {
  required: true,
})
const searchQuery = defineModel<string>('searchQuery', { required: true })

defineProps<{
  searchResults: EnrichedFeature[]
  currentGroup: Group | undefined
  relatedFeatures: EnrichedFeature[]
  groupByMode: GroupByMode
}>()
</script>
