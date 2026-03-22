<template>
  <div>
    <div
      class="mb-4 flex items-center gap-2"
      :class="compact ? '' : 'mb-5'"
    >
      <UIcon
        :name="group.icon"
        :class="[compact ? 'size-4' : 'size-5', group.color]"
      />
      <div v-if="!compact">
        <h2 class="text-xl font-semibold">
          {{ group.name }}
        </h2>
        <p class="mt-0.5 text-sm text-neutral-400">
          {{ group.description }}
        </p>
      </div>
      <template v-else>
        <h2 class="text-sm font-semibold">
          {{ group.name }}
        </h2>
        <span class="text-xs text-neutral-400">{{ group.count }}</span>
      </template>
    </div>
    <div class="space-y-2">
      <FeatureCard
        v-for="f in group.features"
        :key="f.name"
        :feature="f"
        :is-selected="selectedFeatureName === f.name"
        :compact="compact"
        :show-domain="groupByMode !== 'domain'"
        :show-type="groupByMode !== 'type'"
        :show-owner="true"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  Group,
  GroupByMode,
  EnrichedFeature,
} from '~/composables/useFeatureSpace'

defineProps<{
  group: Group
  groupByMode: GroupByMode
  selectedFeatureName: string | null
  compact: boolean
}>()

const emit = defineEmits<{ select: [EnrichedFeature] }>()
</script>
