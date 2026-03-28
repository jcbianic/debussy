<template>
  <div
    class="mb-5 overflow-hidden rounded-lg border"
    :class="
      feedback.decision === 'changes-requested'
        ? 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10'
        : feedback.decision === 'approved'
          ? 'border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10'
          : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10'
    "
  >
    <div
      class="flex items-center justify-between border-b px-4 py-2.5"
      :class="
        feedback.decision === 'changes-requested'
          ? 'border-amber-200 dark:border-amber-900/40'
          : feedback.decision === 'approved'
            ? 'border-green-200 dark:border-green-900/40'
            : 'border-red-200 dark:border-red-900/40'
      "
    >
      <div class="flex items-center gap-2">
        <UIcon
          :name="
            feedback.decision === 'approved'
              ? 'i-heroicons-check-circle'
              : feedback.decision === 'changes-requested'
                ? 'i-heroicons-pencil-square'
                : 'i-heroicons-x-circle'
          "
          class="size-3.5"
          :class="
            feedback.decision === 'approved'
              ? 'text-green-500'
              : feedback.decision === 'changes-requested'
                ? 'text-amber-500'
                : 'text-red-500'
          "
        />
        <span
          class="text-xs font-medium"
          :class="
            feedback.decision === 'approved'
              ? 'text-green-700 dark:text-green-400'
              : feedback.decision === 'changes-requested'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-red-700 dark:text-red-400'
          "
        >
          {{
            feedback.decision === 'approved'
              ? 'Approved'
              : feedback.decision === 'changes-requested'
                ? 'Changes requested'
                : 'Rejected'
          }}
        </span>
      </div>
      <span class="text-content-faint font-mono text-xs">{{
        feedback.decidedAt
      }}</span>
    </div>
    <div
      v-if="feedback.comment"
      class="p-5"
    >
      <p
        class="text-sm leading-relaxed"
        :class="
          feedback.decision === 'changes-requested'
            ? 'text-amber-800 dark:text-amber-300'
            : feedback.decision === 'approved'
              ? 'text-green-800 dark:text-green-300'
              : 'text-red-800 dark:text-red-300'
        "
      >
        {{ feedback.comment }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Feedback } from '~/composables/useLanes'

defineProps<{ feedback: Feedback }>()
</script>
