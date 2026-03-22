<template>
  <div class="px-8 py-6">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm font-semibold">Commits</span>
      <span class="text-xs text-neutral-400"
        >{{ commits.length }} commits ahead of main</span
      >
    </div>
    <div class="border-line overflow-hidden rounded-lg border">
      <div
        v-for="(commit, i) in commits"
        :key="commit.hash"
        class="bg-surface flex items-start gap-4 px-5 py-3.5"
        :class="i < commits.length - 1 ? 'border-line-subtle border-b' : ''"
      >
        <span
          class="mt-0.5 w-14 flex-shrink-0 font-mono text-xs text-neutral-400"
          >{{ commit.hash }}</span
        >
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm">{{ commit.message }}</div>
          <div class="mt-0.5 flex items-center gap-2">
            <span class="text-xs text-neutral-400">{{ commit.author }}</span>
            <span class="text-content-ghost text-xs">·</span>
            <span class="text-xs text-neutral-400">{{ commit.date }}</span>
          </div>
        </div>
        <div v-if="commit.pr" class="flex-shrink-0">
          <UBadge
            :label="commit.pr"
            color="neutral"
            variant="subtle"
            size="xs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Commit } from '~/composables/useMockData'

defineProps<{ commits: Commit[] }>()
</script>
