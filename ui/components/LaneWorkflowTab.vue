<template>
  <div class="px-8 py-6">
    <div v-if="workflow">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <div class="mb-1 flex items-center gap-2">
            <UBadge
              :label="workflow.status"
              :color="
                workflow.status === 'running'
                  ? 'primary'
                  : workflow.status === 'done'
                    ? 'success'
                    : 'neutral'
              "
              variant="subtle"
              size="sm"
            />
            <span class="font-mono text-sm font-medium">{{
              workflow.file
            }}</span>
          </div>
          <div class="text-xs text-neutral-400">
            Step {{ workflow.currentStep }} of {{ workflow.totalSteps }} ·
            {{ workflow.elapsed }} elapsed
          </div>
        </div>
        <div class="font-mono text-xs text-neutral-400">
          started {{ workflow.startedAt }}
        </div>
      </div>
      <div class="space-y-2">
        <WorkflowStepRow
          v-for="step in workflow.steps"
          :key="step.name"
          :step="step"
        />
      </div>
    </div>
    <EmptyState
      v-else
      icon="i-heroicons-arrow-path"
      text="No active workflow on this lane"
    />
  </div>
</template>

<script setup lang="ts">
import type { WorkflowRun } from '~/composables/useMockData'

defineProps<{ workflow: WorkflowRun | null }>()
</script>
