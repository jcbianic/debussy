<template>
  <div>
    <div class="mb-3 text-xs text-neutral-400">
      {{ searchResults.length }} result{{
        searchResults.length === 1 ? '' : 's'
      }}
      for "{{ searchQuery }}"
    </div>
    <div class="space-y-2">
      <FeatureCard
        v-for="f in searchResults"
        :key="f.name"
        :feature="f"
        :is-selected="selectedFeatureName === f.name"
        :compact="compact"
        :search-query="searchQuery"
        @select="emit('select', $event)"
      />
    </div>
    <EmptyState
      v-if="searchResults.length === 0"
      variant="bare"
      icon="i-heroicons-magnifying-glass"
      :text="`No features match &quot;${searchQuery}&quot;`"
    />
  </div>
</template>

<script setup lang="ts">
import type { EnrichedFeature } from '~/composables/useFeatureSpace'

defineProps<{
  searchResults: EnrichedFeature[]
  searchQuery: string
  selectedFeatureName: string | null
  compact: boolean
}>()

const emit = defineEmits<{ select: [EnrichedFeature] }>()
</script>
