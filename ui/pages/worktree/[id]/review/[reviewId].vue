<template>
  <div class="flex flex-col h-full">

    <!-- Header -->
    <div class="flex items-center gap-3 px-8 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
      <NuxtLink
        :to="`/worktree/${worktreeId}`"
        class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors flex-shrink-0"
      >
        <UIcon name="i-heroicons-arrow-left" class="size-4" />
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate">{{ review.title }}</div>
        <div class="text-xs text-neutral-400 mt-0.5">{{ review.source }}</div>
      </div>
      <UBadge :label="review.status" :color="statusColor(review.status)" variant="subtle" size="sm" />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto px-8 py-6">
      <div class="max-w-2xl space-y-5">

        <!-- Review body -->
        <div class="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <p class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{{ review.body }}</p>
          <pre
            v-if="review.code"
            class="mt-4 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-md p-4 overflow-auto font-mono leading-relaxed"
          ><code>{{ review.code }}</code></pre>
        </div>

        <!-- Actions -->
        <div v-if="review.status === 'pending'" class="flex gap-2">
          <UButton label="Approve" icon="i-heroicons-check" color="success" variant="outline" class="flex-1" />
          <UButton label="Request changes" icon="i-heroicons-pencil" color="warning" variant="outline" class="flex-1" />
          <UButton label="Reject" icon="i-heroicons-x-mark" color="error" variant="outline" class="flex-1" />
        </div>

        <!-- Comment -->
        <div>
          <UTextarea
            placeholder="Add a comment…"
            class="w-full"
            :rows="3"
          />
          <div class="mt-2 flex justify-end">
            <UButton label="Comment" size="sm" variant="outline" color="neutral" />
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

interface Review {
  id: string
  title: string
  source: string
  status: 'pending' | 'approved' | 'rejected'
  body: string
  code: string | null
}

const allReviews: Record<string, Review> = {
  'r-1': {
    id: 'r-1',
    title: 'Layout structure and sidebar navigation',
    source: 'Unified UI — Implementation Plan · /feedback session',
    status: 'pending',
    body: 'The layout uses a persistent left sidebar (w-60) with a project header, a worktree list, and a separator above the Overview link. The main area fills remaining space and scrolls independently. The sidebar project header shows project name, org, and a future project-switcher affordance (chevron button). Dark mode follows system preference with a manual toggle in the sidebar footer.',
    code: null,
  },
  'r-2': {
    id: 'r-2',
    title: 'Worktree stage/unstage interaction model',
    source: 'Unified UI — Implementation Plan · /feedback session',
    status: 'pending',
    body: 'The staged worktree is marked with a filled blue dot in the sidebar. Non-staged worktrees show a faint Stage button on hover (arrow-up-tray icon). The worktree detail page shows a prominent "Stage" or "Push back" button in its header. Staging means checking out the worktree\'s branch in the root folder.',
    code: null,
  },
  'r-3': {
    id: 'r-3',
    title: 'Inbox hierarchy and review groups',
    source: 'Unified UI — Implementation Plan · /feedback session',
    status: 'approved',
    body: 'Reviews are grouped by session or PR. Each group is collapsible. Individual items within a group link to the review detail page. Groups show a pending count badge. The inbox shows an empty state when there are no pending reviews.',
    code: null,
  },
  'r-4': {
    id: 'r-4',
    title: 'Nuxt layout structure',
    source: 'PR #42 · layouts/default.vue',
    status: 'pending',
    body: 'The layout wraps everything in a full-height flex container. Sidebar is w-60 with flex-col. Main area is flex-1 overflow-auto. Works correctly in both light and dark modes. No layout shift on navigation.',
    code: `// layouts/default.vue
<aside class="w-60 flex-shrink-0 flex flex-col ...">
  <!-- project header -->
  <!-- worktree list -->
  <!-- overview link -->
</aside>
<main class="flex-1 overflow-auto">
  <slot />
</main>`,
  },
  'r-6': {
    id: 'r-6',
    title: 'Keyboard navigation shortcuts',
    source: 'Feedback UI Enhancement — Spec · /feedback session',
    status: 'pending',
    body: 'Keyboard shortcuts for the feedback review UI: j/k to move between items, Enter to open, a to approve, r to request changes, x to reject, ? to show help. ⌘K opens a command palette. All actions should work without touching the mouse.',
    code: null,
  },
  'r-8': {
    id: 'r-8',
    title: 'Root cause — port conflict on 3001',
    source: 'Fix: review server startup crash · workflow gate',
    status: 'pending',
    body: 'The review server crashes on startup when port 3001 is already in use. This happens when a previous session was not cleanly terminated. Proposed fix: scan for a free port starting at 3001, use the first available, and write the chosen port to a .port file for the client to read.',
    code: null,
  },
}

const review = computed<Review>(() => allReviews[reviewId] ?? {
  id: reviewId,
  title: 'Review item',
  source: 'Unknown source',
  status: 'pending',
  body: 'Review content would appear here.',
  code: null,
})

const statusColor = (s: string) => {
  if (s === 'approved') return 'success' as const
  if (s === 'rejected') return 'error' as const
  return 'warning' as const
}
</script>
