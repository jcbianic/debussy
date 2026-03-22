<template>
  <div class="space-y-2.5">
    <div
      v-if="intent.priority"
      class="flex items-center justify-between"
    >
      <span class="text-xs text-neutral-400">Priority</span>
      <UBadge
        :label="intent.priority"
        :color="
          intent.priority === 'now' || intent.priority === 'next'
            ? 'primary'
            : 'neutral'
        "
        variant="subtle"
        size="xs"
      />
    </div>
    <div
      v-if="intent.lane"
      class="flex items-center justify-between"
    >
      <span class="text-xs text-neutral-400">Lane</span>
      <NuxtLink
        :to="`/lane/${intent.laneId}`"
        class="font-mono text-xs text-blue-500 hover:underline"
      >
        {{ intent.lane }}
      </NuxtLink>
    </div>
    <div
      v-if="intent.issue"
      class="flex items-center justify-between"
    >
      <span class="text-xs text-neutral-400">GitHub Issue</span>
      <a
        :href="`https://github.com/jcbianic/debussy/issues/${intent.issue}`"
        class="font-mono text-xs text-blue-500 hover:underline"
      >#{{ intent.issue }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Intent } from '~/composables/useRoadmap'

defineProps<{ intent: Intent }>()
</script>
