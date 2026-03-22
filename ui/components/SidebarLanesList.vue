<template>
  <div class="px-3 py-3">
    <div
      class="text-content-faint mb-1.5 px-2 text-xs font-medium tracking-wider uppercase"
    >
      Lanes
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
          :class="lane.isActive ? 'bg-status-active' : 'bg-status-inactive'"
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
            v-if="lane.pending > 0"
            :label="String(lane.pending)"
            color="warning"
            variant="subtle"
            size="xs"
          />
          <UButton
            v-if="!lane.isActive"
            variant="ghost"
            color="neutral"
            size="xs"
            icon="i-heroicons-arrow-up-tray"
            title="Stage this lane"
            class="opacity-0 transition-opacity group-hover:opacity-100"
            @click.prevent
          />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lane } from '~/composables/useMockData'

defineProps<{
  lanesWithPending: (Lane & { pending: number })[]
  currentPath: string
}>()
</script>
