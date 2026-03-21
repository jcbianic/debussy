<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div
      class="flex items-center gap-3 border-b border-neutral-200 bg-white px-8 py-4 dark:border-neutral-800 dark:bg-neutral-900/50"
    >
      <NuxtLink
        :to="`/lane/${laneId}`"
        class="flex-shrink-0 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
      >
        <UIcon name="i-heroicons-arrow-left" class="size-4" />
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-medium">{{ review.title }}</div>
        <div class="mt-0.5 text-xs text-neutral-400">{{ review.source }}</div>
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
        <div
          class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <p
            class="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
          >
            {{ review.body }}
          </p>
          <pre
            v-if="review.code"
            class="mt-4 overflow-auto rounded-md border border-neutral-100 bg-neutral-50 p-4 font-mono text-xs leading-relaxed dark:border-neutral-800 dark:bg-neutral-950"
          ><code>{{ review.code }}</code></pre>
        </div>

        <div v-if="review.status === 'pending'" class="flex gap-2">
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
          <UTextarea placeholder="Add a comment…" class="w-full" :rows="3" />
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
const laneId = route.params.id as string
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
    body: 'The layout uses a persistent left sidebar (w-60) with a project header, a lane list, and a separator above the Overview link. The main area fills remaining space and scrolls independently. Dark mode follows system preference with a manual toggle in the sidebar footer.',
    code: null,
  },
  'r-2': {
    id: 'r-2',
    title: 'Lane stage/unstage interaction model',
    source: 'Unified UI — Implementation Plan · /feedback session',
    status: 'pending',
    body: 'The staged lane is marked with a filled blue dot in the sidebar. Non-staged lanes show a faint Stage button on hover. The lane detail page shows a prominent "Stage" or "Push back" button in its header. Staging means checking out the lane\'s branch in the root folder.',
    code: null,
  },
  'r-4': {
    id: 'r-4',
    title: 'Nuxt layout structure',
    source: 'PR #42 · layouts/default.vue',
    status: 'pending',
    body: 'The layout wraps everything in a full-height flex container. Sidebar is w-60 with flex-col. Main area is flex-1 overflow-auto. Works correctly in both light and dark modes.',
    code: `// layouts/default.vue
<aside class="w-60 flex-shrink-0 flex flex-col ...">
  <!-- project header -->
  <!-- primary nav: Overview, Inbox, Product, Roadmap -->
  <!-- lanes list -->
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
    body: 'Proposed shortcuts: j/k to move between items, Enter to open, a to approve, r to request changes, x to reject, ? to show help overlay. ⌘K opens a command palette. All actions work without the mouse.',
    code: null,
  },
  'r-8': {
    id: 'r-8',
    title: 'Root cause — port conflict on 3001',
    source: 'Fix: review server startup crash · workflow gate',
    status: 'pending',
    body: 'The review server crashes on startup when port 3001 is already in use from a previous session. Proposed fix: scan for a free port starting at 3001, use the first available, write the chosen port to a .port file for the client to read.',
    code: null,
  },
}

const review = computed<Review>(
  () =>
    allReviews[reviewId] ?? {
      id: reviewId,
      title: 'Review item',
      source: 'Unknown',
      status: 'pending',
      body: 'Review content would appear here.',
      code: null,
    }
)

const statusColor = (s: string) =>
  s === 'approved'
    ? ('success' as const)
    : s === 'rejected'
      ? ('error' as const)
      : ('warning' as const)
</script>
