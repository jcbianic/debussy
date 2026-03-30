<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div
      class="border-line bg-surface-tinted flex items-center gap-3 border-b px-8 py-4"
    >
      <NuxtLink
        :to="`/lane/${laneId}`"
        class="flex-shrink-0 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
      >
        <UIcon
          name="i-heroicons-arrow-left"
          class="size-4"
        />
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-medium">
          {{ review?.title ?? 'Review item' }}
        </div>
        <div class="mt-0.5 text-xs text-neutral-400">
          {{ review?.source }}
        </div>
      </div>
      <UBadge
        v-if="review"
        :label="review.status"
        :color="statusColor(review.status)"
        variant="subtle"
        size="sm"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto px-8 py-6">
      <div
        v-if="!review"
        class="flex h-full items-center justify-center"
      >
        <p class="text-content-subtle text-sm">
          Review item not found
        </p>
      </div>
      <div
        v-else
        class="max-w-2xl space-y-5"
      >
        <div class="border-line bg-surface rounded-lg border p-6">
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="isMarkdown(review.body)"
            class="text-content-secondary"
            v-html="renderMarkdown(review.body)"
          />
          <!-- eslint-enable vue/no-v-html -->
          <p
            v-else
            class="text-content-secondary text-sm leading-relaxed"
          >
            {{ review.body }}
          </p>
          <pre
            v-if="review.code"
            class="border-line-subtle bg-surface-page mt-4 overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed"
          ><code>{{ review.code }}</code></pre>
        </div>

        <p
          v-if="submitError"
          class="text-xs text-red-500"
        >
          {{ submitError }}
        </p>

        <div
          v-if="submitted"
          class="border-line bg-surface rounded-lg border p-4 text-center"
        >
          <UIcon
            name="i-heroicons-check-circle"
            class="mb-2 size-8 text-green-500"
          />
          <p class="text-content-secondary text-sm">
            Review submitted
          </p>
        </div>

        <ReviewActionBar
          v-if="review.status === 'pending' && !submitted"
          v-model:comment="comment"
          v-model:comment-error="commentError"
          comment-placeholder="Add a comment... (required for Request changes)"
          @submit="submitAction"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const laneId = route.params.id as string
const itemId = decodeURIComponent(route.params.reviewId as string)

const { getReview, refresh } = useLanes()
const review = computed(() => getReview(itemId))

const comment = ref('')
const commentError = ref('')
const submitError = ref('')
const submitted = ref(false)

const submitAction = async (
  action: 'approved' | 'changes-requested' | 'rejected'
) => {
  commentError.value = ''
  submitError.value = ''

  if (action === 'changes-requested' && !comment.value.trim()) {
    commentError.value = 'A comment is required when requesting changes.'
    return
  }

  const r = review.value
  if (!r) return

  try {
    await $fetch(`/api/reviews/${r.reviewId}`, {
      method: 'POST',
      body: {
        itemId: r.id,
        action,
        comment: comment.value.trim() || undefined,
      },
    })
    submitted.value = true
    comment.value = ''
    await refresh()
  } catch {
    submitError.value = 'Failed to submit review. Try again.'
  }
}
</script>
