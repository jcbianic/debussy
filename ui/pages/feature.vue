<template>
  <TwoPanelLayout left-width="w-60">
    <!-- Left panel: groups -->
    <template #left>
      <div class="border-line border-b px-5 py-4">
        <h1 class="text-sm font-semibold">Features of debussy</h1>
        <p class="mt-0.5 font-mono text-xs text-neutral-400">
          ~/Projets/Libon-Data/debussy
        </p>
        <SegmentedControl
          :model-value="groupByMode"
          :options="groupByOptions"
          stretch
          class="mt-3"
          @update:model-value="setGroupBy($event as GroupByMode)"
        />
      </div>
      <div class="flex-1 overflow-y-auto">
        <button
          v-for="group in groups"
          :key="group.key"
          type="button"
          class="border-line-subtle flex w-full cursor-pointer items-center gap-3 border-b px-5 py-3 text-left transition-colors last:border-b-0"
          :class="
            selected === group.key
              ? 'bg-surface-hover-subtle'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          "
          @click="selected = group.key"
        >
          <UIcon
            :name="group.icon"
            class="size-4 flex-shrink-0"
            :class="group.color"
          />
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium">{{ group.name }}</div>
            <div class="mt-0.5 text-xs text-neutral-400">
              {{ group.count }} features
            </div>
          </div>
        </button>
      </div>
      <div class="border-line border-t px-5 py-3 text-xs text-neutral-400">
        .debussy/strategy/feature-space.md
      </div>
    </template>

    <!-- Right panel -->
    <FeatureListPanel
      v-model:selectedFeature="selectedFeature"
      v-model:searchQuery="searchQuery"
      :search-results="searchResults"
      :current-group="currentGroup"
      :related-features="relatedFeatures"
      :group-by-mode="groupByMode"
    />
  </TwoPanelLayout>
</template>

<script setup lang="ts">
import { groupByOptions } from '~/composables/useFeatureSpace'
import type { GroupByMode } from '~/composables/useFeatureSpace'

const {
  groupByMode,
  selected,
  searchQuery,
  selectedFeature,
  groups,
  currentGroup,
  relatedFeatures,
  searchResults,
  setGroupBy,
} = useFeatureSpace()
</script>
