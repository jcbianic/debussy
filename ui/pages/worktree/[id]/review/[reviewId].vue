<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div
      class="border-line bg-surface-tinted flex items-center gap-3 border-b px-8 py-4"
    >
      <NuxtLink
        :to="`/worktree/${worktreeId}`"
        class="flex-shrink-0 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
      >
        <UIcon
          name="i-heroicons-arrow-left"
          class="size-4"
        />
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-medium">
          {{ review.title }}
        </div>
        <div class="mt-0.5 text-xs text-neutral-400">
          {{ review.source }}
        </div>
      </div>
      <UBadge
        :label="review.status"
        :color="statusColor(review.status)"
        variant="subtle"
        size="sm"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto px-8 py-6">
      <div class="max-w-2xl space-y-5">
        <div class="border-line bg-surface rounded-lg border p-6">
          <p class="text-content-secondary text-sm leading-relaxed">
            {{ review.body }}
          </p>
          <pre
            v-if="review.code"
            class="border-line-subtle bg-surface-page mt-4 overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed"
          ><code>{{ review.code }}</code></pre>
        </div>

        <div
          v-if="review.status === 'pending'"
          class="flex gap-2"
        >
          <UButton
            label="Approve"
            icon="i-heroicons-check"
            color="success"
            variant="outline"
            class="flex-1"
          />
          <UButton
            label="Request changes"
            icon="i-heroicons-pencil"
            color="warning"
            variant="outline"
            class="flex-1"
          />
          <UButton
            label="Reject"
            icon="i-heroicons-x-mark"
            color="error"
            variant="outline"
            class="flex-1"
          />
        </div>

        <div>
          <UTextarea
            placeholder="Add a comment…"
            class="w-full"
            :rows="3"
          />
          <div class="mt-2 flex justify-end">
            <UButton
              label="Comment"
              size="sm"
              variant="outline"
              color="neutral"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const worktreeId = route.params.id as string
const reviewId = route.params.reviewId as string

const { getReview } = useLanes()
const review = computed(() => getReview(reviewId))
</script>
