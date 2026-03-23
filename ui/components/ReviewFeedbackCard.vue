<template>
  <div
    class="mb-5 overflow-hidden rounded-lg border"
    :class="
      roundData.feedbackStatus === 'changes-requested'
        ? 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10'
        : roundData.feedbackStatus === 'approved'
          ? 'border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10'
          : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10'
    "
  >
    <div
      class="flex items-center justify-between border-b px-4 py-2.5"
      :class="
        roundData.feedbackStatus === 'changes-requested'
          ? 'border-amber-200 dark:border-amber-900/40'
          : roundData.feedbackStatus === 'approved'
            ? 'border-green-200 dark:border-green-900/40'
            : 'border-red-200 dark:border-red-900/40'
      "
    >
      <div class="flex items-center gap-2">
        <UIcon
          :name="
            roundData.feedbackStatus === 'approved'
              ? 'i-heroicons-check-circle'
              : roundData.feedbackStatus === 'changes-requested'
                ? 'i-heroicons-pencil-square'
                : 'i-heroicons-x-circle'
          "
          class="size-3.5"
          :class="
            roundData.feedbackStatus === 'approved'
              ? 'text-green-500'
              : roundData.feedbackStatus === 'changes-requested'
                ? 'text-amber-500'
                : 'text-red-500'
          "
        />
        <span
          class="text-xs font-medium"
          :class="
            roundData.feedbackStatus === 'approved'
              ? 'text-green-700 dark:text-green-400'
              : roundData.feedbackStatus === 'changes-requested'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-red-700 dark:text-red-400'
          "
        >
          {{
            roundData.feedbackStatus === 'approved'
              ? 'Approved'
              : roundData.feedbackStatus === 'changes-requested'
                ? 'Changes requested'
                : 'Rejected'
          }}
        </span>
      </div>
      <span class="text-content-faint font-mono text-xs">{{
        roundData.feedbackAt
      }}</span>
    </div>
    <div class="p-5">
      <p
        class="text-sm leading-relaxed"
        :class="
          roundData.feedbackStatus === 'changes-requested'
            ? 'text-amber-800 dark:text-amber-300'
            : roundData.feedbackStatus === 'approved'
              ? 'text-green-800 dark:text-green-300'
              : 'text-red-800 dark:text-red-300'
        "
      >
        {{ roundData.feedback }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReviewItem } from '~/composables/useLanes'

defineProps<{ roundData: ReviewItem['rounds'][number] }>()
</script>
