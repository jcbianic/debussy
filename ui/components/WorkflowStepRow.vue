<template>
  <div
    class="flex items-center gap-4 rounded-lg border px-4 py-3"
    :class="{
      'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30':
        step.state === 'running',
      'border-line-subtle bg-surface':
        step.state === 'done' || step.state === 'waiting',
      'border-line-subtle bg-surface-tinted opacity-60':
        step.state === 'pending',
    }"
  >
    <UIcon
      :name="
        step.state === 'done'
          ? 'i-heroicons-check-circle'
          : step.state === 'running'
            ? 'i-heroicons-arrow-path'
            : step.state === 'waiting'
              ? 'i-heroicons-pause-circle'
              : 'i-heroicons-ellipsis-horizontal-circle'
      "
      class="size-4 flex-shrink-0"
      :class="{
        'text-green-500': step.state === 'done',
        'animate-spin text-blue-500': step.state === 'running',
        'text-yellow-500': step.state === 'waiting',
        'text-content-ghost': step.state === 'pending',
      }"
    />
    <div class="min-w-0 flex-1">
      <div
        class="text-sm font-medium"
        :class="step.state === 'pending' ? 'text-neutral-400' : ''"
      >
        {{ step.name }}
      </div>
      <div
        v-if="step.detail"
        class="mt-0.5 text-xs text-neutral-400"
      >
        {{ step.detail }}
      </div>
    </div>
    <div
      v-if="step.duration"
      class="font-mono text-xs text-neutral-400"
    >
      {{ step.duration }}
    </div>
    <UButton
      v-if="step.state === 'waiting'"
      label="Unblock"
      size="xs"
      color="primary"
      variant="outline"
    />
  </div>
</template>

<script setup lang="ts">
import type { WorkflowStep } from '~/composables/useMockData'

defineProps<{ step: WorkflowStep }>()
</script>
