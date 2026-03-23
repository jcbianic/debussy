<template>
  <div
    class="bg-surface-sunken mb-5 flex w-fit items-center gap-1 rounded-lg p-1"
  >
    <button
      v-for="round in rounds"
      :key="round.roundNumber"
      class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
      :class="
        activeRound === round.roundNumber
          ? 'bg-surface-elevated text-content shadow-sm'
          : 'text-content-subtle hover:text-content-secondary'
      "
      @click="emit('setRound', round.roundNumber)"
    >
      <span>Round {{ round.roundNumber }}</span>
      <span
        v-if="round.roundNumber === rounds.length"
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
import type { ReviewItem } from '~/composables/useLanes'

defineProps<{
  rounds: ReviewItem['rounds']
  activeRound: number
  currentStatus: ReviewItem['status']
}>()

const emit = defineEmits<{ setRound: [n: number] }>()
</script>
