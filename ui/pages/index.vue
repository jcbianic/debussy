<template>
  <div class="px-8 py-8">

    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-xl font-semibold">Overview of debussy</h1>
      <p class="mt-1 text-sm text-content-subtle font-mono">~/Projets/Libon-Data/debussy</p>
    </div>

    <div class="space-y-4">

      <!-- Row 1: Product + Roadmap -->
      <div class="grid grid-cols-2 gap-4">

        <!-- Product -->
        <div class="rounded-lg border border-line overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-line-subtle bg-surface">
            <h2 class="text-sm font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-cube" class="size-4 text-content-faint" />
              Product of debussy
            </h2>
            <NuxtLink to="/product" class="text-xs text-content-faint hover:text-content transition-colors">Explore →</NuxtLink>
          </div>
          <div class="bg-surface p-5">
            <div class="grid grid-cols-3 gap-2 mb-4">
              <NuxtLink
                v-for="artifact in artifacts"
                :key="artifact.key"
                to="/product"
                class="rounded-md border border-line-subtle p-3 hover:border-line transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <UIcon :name="artifact.icon" class="size-3.5 text-content-faint" />
                  <UBadge :label="artifact.status" :color="artifact.status === 'reviewed' ? 'success' : 'warning'" variant="subtle" size="xs" />
                </div>
                <div class="text-xs font-medium">{{ artifact.name }}</div>
              </NuxtLink>
            </div>
            <p class="text-xs text-content-faint leading-relaxed line-clamp-2">
              Debussy is a Claude Code plugin for solo builders — structured review workflows, product visibility, and parallel lane management.
            </p>
          </div>
        </div>

        <!-- Roadmap -->
        <div class="rounded-lg border border-line overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-line-subtle bg-surface">
            <h2 class="text-sm font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-flag" class="size-4 text-content-faint" />
              Roadmap of debussy
            </h2>
            <NuxtLink to="/roadmap" class="text-xs text-content-faint hover:text-content transition-colors">Full roadmap →</NuxtLink>
          </div>
          <div class="bg-surface">
            <div class="px-5 py-2.5 border-b border-line-subtle">
              <span class="text-xs font-medium text-content-subtle">Release 1.0 — Foundation</span>
            </div>
            <div
              v-for="(intent, i) in nextRelease"
              :key="intent.id"
              class="flex items-center gap-3 px-5 py-2.5"
              :class="i < nextRelease.length - 1 ? 'border-b border-line-subtle' : ''"
            >
              <UIcon :name="stateIcon(intent.state)" class="size-3.5 flex-shrink-0" :class="stateIconColor(intent.state)" />
              <span class="font-mono text-xs text-content-faint w-7 flex-shrink-0">{{ intent.id }}</span>
              <span class="flex-1 text-xs truncate" :class="intent.state === 'done' ? 'text-content-faint line-through' : 'text-content-secondary'">{{ intent.title }}</span>
              <span v-if="intent.lane" class="text-xs text-status-active font-mono truncate max-w-24">{{ intent.lane }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Row 2: Inbox + Lanes -->
      <div class="grid grid-cols-2 gap-4">

        <!-- Inbox -->
        <div class="rounded-lg border border-line overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-line-subtle bg-surface">
            <h2 class="text-sm font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-inbox" class="size-4 text-content-faint" />
              Inbox
            </h2>
            <NuxtLink to="/inbox" class="text-xs text-content-faint hover:text-content transition-colors">View all →</NuxtLink>
          </div>
          <div class="bg-surface">
            <div
              v-for="(lane, i) in lanesWithPending"
              :key="lane.id"
              class="flex items-center gap-3 px-5 py-3"
              :class="i < lanesWithPending.length - 1 ? 'border-b border-line-subtle' : ''"
            >
              <div class="size-1.5 rounded-full flex-shrink-0" :class="lane.isActive ? 'bg-status-active' : 'bg-status-inactive'" />
              <span class="flex-1 font-mono text-xs text-content-muted truncate">{{ lane.branch }}</span>
              <UBadge :label="`${lane.pending} pending`" color="warning" variant="subtle" size="xs" />
            </div>
            <div class="px-5 py-3 border-t border-line-subtle">
              <span class="text-xs text-content-faint">6 total across 3 lanes</span>
            </div>
          </div>
        </div>

        <!-- Lanes -->
        <div class="rounded-lg border border-line overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-line-subtle bg-surface">
            <h2 class="text-sm font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-rectangle-stack" class="size-4 text-content-faint" />
              Lanes
            </h2>
            <span class="text-xs text-content-faint">4 active</span>
          </div>
          <div class="bg-surface">
            <NuxtLink
              v-for="(lane, i) in lanes"
              :key="lane.id"
              :to="`/lane/${lane.id}`"
              class="flex items-center gap-3 px-5 py-3 hover:bg-surface-hover-subtle transition-colors"
              :class="i < lanes.length - 1 ? 'border-b border-line-subtle' : ''"
            >
              <div class="size-1.5 rounded-full flex-shrink-0" :class="lane.isActive ? 'bg-status-active' : 'bg-status-inactive'" />
              <div class="flex-1 min-w-0">
                <div class="font-mono text-xs truncate" :class="lane.isActive ? 'font-medium text-content-secondary' : 'text-content-muted'">{{ lane.branch }}</div>
                <div class="text-xs text-content-faint mt-0.5">{{ lane.intent }}</div>
              </div>
              <UBadge v-if="lane.isActive" label="staged" color="primary" variant="subtle" size="xs" />
              <UIcon name="i-heroicons-chevron-right" class="size-3.5 text-content-placeholder" />
            </NuxtLink>
          </div>
        </div>

      </div>

      <!-- Row 3: Claude Setup (full-width compact) -->
      <div class="rounded-lg border border-line overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-line-subtle bg-surface">
          <h2 class="text-sm font-semibold flex items-center gap-2">
            <UIcon name="i-heroicons-cpu-chip" class="size-4 text-content-faint" />
            Claude Setup
          </h2>
          <div class="flex items-center gap-3">
            <UBadge label="No conflicts" color="success" variant="subtle" size="xs" />
            <NuxtLink to="/setup" class="text-xs text-content-faint hover:text-content transition-colors">Details →</NuxtLink>
          </div>
        </div>
        <div class="bg-surface px-5 py-4 flex items-center gap-8">
          <div v-for="stat in claudeStats" :key="stat.label" class="flex items-baseline gap-2">
            <span class="text-xl font-semibold tabular-nums">{{ stat.value }}</span>
            <span class="text-xs text-content-faint">{{ stat.label }}</span>
          </div>
          <div class="flex-1 flex items-center gap-2 flex-wrap">
            <UBadge v-for="item in claudeItems" :key="item.name" :label="item.name" color="neutral" variant="subtle" size="xs" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const lanes = [
  { id: 'root',        branch: 'feat/42-unified-ui', intent: 'Unified UI',                isActive: true,  pending: 3 },
  { id: 'wt-feedback', branch: 'feat/feedback-ui',   intent: 'Feedback UI Enhancement',   isActive: false, pending: 2 },
  { id: 'wt-workflow', branch: 'feat/workflow-mon',  intent: 'Workflow Monitoring',        isActive: false, pending: 0 },
  { id: 'wt-fix',      branch: 'fix/review-server',  intent: 'Fix: server startup crash',  isActive: false, pending: 1 },
]

const lanesWithPending = computed(() => lanes.filter(l => l.pending > 0))

const nextRelease = [
  { id: '001', title: 'Roadmap Skill Iteration',      state: 'done',        lane: null },
  { id: '002', title: 'Feedback UI Enhancement',      state: 'in-progress', lane: 'feat/feedback-ui' },
  { id: '003', title: 'Workflow Progress Monitoring', state: 'open',        lane: null },
]

const stateIcon = (s: string) => s === 'done' ? 'i-heroicons-check-circle' : s === 'in-progress' ? 'i-heroicons-arrow-path' : 'i-heroicons-ellipsis-horizontal-circle'
const stateIconColor = (s: string) => s === 'done' ? 'text-green-500' : s === 'in-progress' ? 'text-blue-500' : 'text-content-placeholder'

const artifacts = [
  { key: 'vision',    name: 'Vision',    icon: 'i-heroicons-eye',       status: 'reviewed' },
  { key: 'landscape', name: 'Landscape', icon: 'i-heroicons-globe-alt', status: 'reviewed' },
  { key: 'product',   name: 'Product',   icon: 'i-heroicons-cube',      status: 'draft' },
]

const claudeStats = [
  { value: '4', label: 'Skills' },
  { value: '3', label: 'Hooks' },
  { value: '0', label: 'Conflicts' },
]

const claudeItems = [
  { name: 'debussy:strategy' },
  { name: 'debussy:roadmap' },
  { name: 'debussy:feedback' },
  { name: 'debussy:workflow-run' },
  { name: 'PostToolUse' },
  { name: 'PreToolUse' },
  { name: 'Stop' },
]
</script>
