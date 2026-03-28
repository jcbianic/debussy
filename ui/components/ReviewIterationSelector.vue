<template>
  <div
    class="bg-surface-sunken mb-5 flex w-fit items-center gap-1 rounded-lg p-1"
  >
    <button
      v-for="iteration in iterations"
      :key="iteration.number"
      class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
      :class="
        activeIteration === iteration.number
          ? 'bg-surface-elevated text-content shadow-sm'
          : 'text-content-subtle hover:text-content-secondary'
      "
      @click="emit('setIteration', iteration.number)"
    >
      <span>Iteration {{ iteration.number }}</span>
      <span
        v-if="iteration.number === iterations.length"
        class="size-1.5 rounded-full"
        :class="
          currentStatus === 'pending'
            ? 'bg-amber-400'
            : currentStatus === 'approved'
              ? 'bg-green-400'
              : 'bg-red-400'
        "
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Iteration, ItemStatus } from '~/composables/useLanes'

defineProps<{
  iterations: Iteration[]
  activeIteration: number
  currentStatus: ItemStatus
}>()

const emit = defineEmits<{ setIteration: [n: number] }>()
</script>
