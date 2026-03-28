<template>
  <div class="px-3 py-3">
    <div
      class="text-content-faint mb-1.5 flex items-center justify-between px-2 text-xs font-medium tracking-wider uppercase"
    >
      <span>Lanes</span>
      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        icon="i-heroicons-plus"
        title="Create lane from issue"
        @click="$emit('create')"
      />
    </div>
    <div class="space-y-0.5">
      <NuxtLink
        v-for="lane in lanesWithPending"
        :key="lane.id"
        :to="`/lane/${lane.id}`"
        class="group hover:bg-surface-hover flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors"
        :class="
          currentPath.startsWith(`/lane/${lane.id}`) ? 'bg-surface-hover' : ''
        "
      >
        <div
          class="size-2 flex-shrink-0 rounded-full"
          :class="stateDotClass(lane)"
        />
        <div class="min-w-0 flex-1">
          <div
            class="truncate font-mono text-xs leading-tight"
            :class="
              lane.isActive ? 'text-content font-medium' : 'text-content-muted'
            "
          >
            {{ lane.branch }}
          </div>
        </div>
        <div class="flex flex-shrink-0 items-center gap-1">
          <UBadge
            v-if="lane.state"
            :label="lane.state"
            :color="stateBadgeColor(lane.state)"
            variant="subtle"
            size="xs"
          />
          <UBadge
            v-if="lane.pending > 0"
            :label="String(lane.pending)"
            color="warning"
            variant="subtle"
            size="xs"
          />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lane, LaneState } from '~/composables/useLanes'

defineProps<{
  lanesWithPending: (Lane & { pending: number })[]
  currentPath: string
}>()

defineEmits<{
  create: []
}>()

function stateDotClass(lane: Lane & { pending: number }): string {
  if (lane.state) {
    const map: Record<LaneState, string> = {
      created: 'bg-neutral-400',
      working: 'bg-blue-500',
      staged: 'bg-yellow-500',
      qa: 'bg-yellow-500',
      ready: 'bg-green-500',
      merged: 'bg-neutral-400',
    }
    return map[lane.state]
  }
  return lane.isActive ? 'bg-status-active' : 'bg-status-inactive'
}

function stateBadgeColor(state: LaneState): string {
  const map: Record<LaneState, string> = {
    created: 'neutral',
    working: 'primary',
    staged: 'warning',
    qa: 'warning',
    ready: 'success',
    merged: 'neutral',
  }
  return map[state]
}
</script>
