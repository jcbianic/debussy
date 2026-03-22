<template>
  <div
    class="border-line-raised bg-surface-tag grid grid-cols-3 gap-px overflow-hidden rounded-xl border"
  >
    <!-- Past: shipped releases -->
    <button
      type="button"
      class="bg-surface flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/70"
      :class="activeFilter === 'shipped' ? 'ring-ring ring-1 ring-inset' : ''"
      @click="
        emit(
          'update:activeFilter',
          activeFilter === 'shipped' ? 'all' : 'shipped'
        )
      "
    >
      <div
        class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
      >
        <UIcon
          name="i-heroicons-check"
          class="size-4 text-green-600 dark:text-green-400"
        />
      </div>
      <div>
        <div class="text-lg font-semibold tabular-nums">
          {{ shippedReleases.length }}
        </div>
        <div class="text-xs text-neutral-400">
          release{{ shippedReleases.length === 1 ? '' : 's' }} shipped
        </div>
        <div class="text-content-subtle mt-0.5 text-xs">
          {{ shippedReleases.map((r) => r.name).join(', ') }}
        </div>
      </div>
    </button>

    <!-- Current release -->
    <div class="bg-surface px-5 py-4">
      <div v-if="currentRelease">
        <div class="mb-2 flex items-center gap-2">
          <span class="text-sm font-semibold">{{ currentRelease.name }}</span>
          <UBadge
            label="in progress"
            color="primary"
            variant="subtle"
            size="xs"
          />
        </div>
        <div class="mb-3 text-xs text-neutral-400">
          {{ currentRelease.theme }} · {{ doneCount(currentRelease) }}/{{
            meaningfulCount(currentRelease)
          }}
          done
        </div>
        <!-- Progress segments -->
        <div class="flex gap-0.5">
          <div
            v-for="intent in currentRelease.intents.filter(
              (i) => i.state !== 'out-of-scope'
            )"
            :key="intent.id"
            class="h-1.5 flex-1 rounded-full transition-colors"
            :class="{
              'bg-green-500': intent.state === 'done',
              'bg-blue-500': intent.state === 'in-progress',
              'bg-surface-tag': intent.state === 'open',
            }"
            :title="intent.title"
          />
        </div>
      </div>
      <div
        v-else
        class="text-sm text-neutral-400"
      >
        No active release
      </div>
    </div>

    <!-- Ahead: planned releases -->
    <button
      type="button"
      class="bg-surface flex items-center justify-end gap-4 px-5 py-4 text-right transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/70"
      :class="activeFilter === 'planned' ? 'ring-ring ring-1 ring-inset' : ''"
      @click="
        emit(
          'update:activeFilter',
          activeFilter === 'planned' ? 'all' : 'planned'
        )
      "
    >
      <div>
        <div class="text-lg font-semibold tabular-nums">
          {{ plannedReleases.length }}
        </div>
        <div class="text-xs text-neutral-400">
          release{{ plannedReleases.length === 1 ? '' : 's' }} planned
        </div>
        <div class="text-content-subtle mt-0.5 text-xs">
          {{ plannedReleases.map((r) => r.name).join(', ') }}
        </div>
      </div>
      <div
        class="bg-surface-sunken flex size-8 flex-shrink-0 items-center justify-center rounded-full"
      >
        <UIcon
          name="i-heroicons-arrow-right"
          class="size-4 text-neutral-400"
        />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Release } from '~/composables/useRoadmap'

defineProps<{
  shippedReleases: Release[]
  currentRelease: Release | null
  plannedReleases: Release[]
  activeFilter: string
}>()

const emit = defineEmits<{
  'update:activeFilter': [filter: string]
}>()

const doneCount = (r: Release) =>
  r.intents.filter((i) => i.state === 'done').length
</script>
