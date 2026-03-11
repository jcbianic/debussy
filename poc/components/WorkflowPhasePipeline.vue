<template>
  <div class="flex flex-col gap-4">
    <!-- Loading state -->
    <div v-if="loading" data-testid="loading" class="flex items-center justify-center h-24 text-gray-500 text-sm">
      Loading phase status…
    </div>

    <template v-else>
      <!-- Pipeline: horizontal card row with arrow connectors -->
      <div class="overflow-x-auto">
        <div class="flex items-start gap-0 min-w-max px-2 py-2">
          <template v-for="(phase, i) in phases" :key="phase.id">
            <!-- Arrow connector -->
            <div v-if="i > 0" class="flex items-center self-center pb-4">
              <div class="w-4 h-px bg-gray-700"></div>
              <div class="text-gray-700 -ml-0.5 text-xs">▶</div>
            </div>

            <!-- Phase card -->
            <div
              :data-phase="phase.id"
              :data-status="phase.status"
              class="w-28 shrink-0 rounded-lg p-2.5 flex flex-col border"
              :class="cardClass(phase)"
            >
              <!-- Status indicator -->
              <div class="flex items-center gap-1.5 mb-1">
                <span
                  class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0"
                  :class="dotClass(phase)"
                >
                  <span v-if="phase.status === 'complete'">✓</span>
                  <span v-else-if="phase.status === 'skipped'">⊘</span>
                  <span v-else-if="phase.status === 'in_progress'">…</span>
                  <span v-else>{{ i + 1 }}</span>
                </span>
                <span class="font-semibold text-[10px] truncate leading-tight">{{ phase.name }}</span>
              </div>

              <!-- Progress percentage for in_progress phases -->
              <div
                v-if="phase.status === 'in_progress' && phase.progress !== null"
                class="text-[10px] text-amber-400 font-mono"
              >
                {{ phase.progress }}%
              </div>

              <!-- Progress bar for checklist/implement in_progress or complete -->
              <div
                v-if="phase.progress !== null && (phase.status === 'in_progress' || phase.status === 'complete')"
                class="mt-1.5 h-1 rounded-full bg-gray-700 overflow-hidden"
              >
                <div
                  class="h-full rounded-full transition-all"
                  :class="phase.status === 'complete' ? 'bg-green-500' : 'bg-amber-500'"
                  :style="{ width: `${phase.progress}%` }"
                ></div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Refresh button -->
      <div class="flex justify-end px-2">
        <button
          data-testid="refresh-btn"
          class="px-3 py-1 text-xs rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
          @click="emit('refresh')"
        >
          ↻ Refresh
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Phase, PhaseStatus } from '../server/utils/types'

defineProps<{
  phases: Phase[]
  loading: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

function cardClass(phase: Phase): string[] {
  const base: string[] = []
  switch (phase.status) {
    case 'complete':
      return [...base, 'bg-green-950/40', 'border-green-800/60', 'complete']
    case 'in_progress':
      return [...base, 'bg-amber-950/40', 'border-amber-700/60']
    case 'skipped':
      return [...base, 'bg-gray-900/30', 'border-gray-700/40', 'border-dashed', 'opacity-60', 'skipped']
    default: // not_started
      return [...base, 'bg-gray-900/20', 'border-gray-800']
  }
}

function dotClass(phase: Phase): string[] {
  switch (phase.status) {
    case 'complete':
      return ['bg-green-900', 'text-green-400']
    case 'in_progress':
      return ['bg-amber-900', 'text-amber-400']
    case 'skipped':
      return ['bg-gray-800', 'text-gray-600']
    default:
      return ['bg-gray-800', 'text-gray-600']
  }
}
</script>
