<template>
  <div class="px-8 py-8 max-w-3xl">

    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-xl font-semibold">Dashboard</h1>
      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Active skill sessions</p>
    </div>

    <!-- Module cards -->
    <div class="grid grid-cols-2 gap-3">
      <NuxtLink
        v-for="mod in modules"
        :key="mod.key"
        :to="mod.to"
        class="group rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors block"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="size-8 rounded-md flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
            <UIcon :name="mod.icon" class="size-4 text-neutral-600 dark:text-neutral-400" />
          </div>
          <UBadge :color="mod.statusColor" variant="subtle" size="sm" :label="mod.status" />
        </div>
        <div class="text-sm font-medium mb-1">{{ mod.name }}</div>
        <div class="text-sm text-neutral-500 dark:text-neutral-400">{{ mod.desc }}</div>
      </NuxtLink>
    </div>

  </div>
</template>

<script setup lang="ts">
const modules = [
  {
    key: 'feedback',
    to: '/feedback',
    icon: 'i-heroicons-chat-bubble-left-right',
    name: 'Feedback',
    status: 'Waiting',
    statusColor: 'warning' as const,
    desc: '5 items pending review',
  },
  {
    key: 'strategy',
    to: '/strategy',
    icon: 'i-heroicons-map',
    name: 'Strategy',
    status: 'Idle',
    statusColor: 'neutral' as const,
    desc: 'No active session',
  },
  {
    key: 'workflow',
    to: '/workflow',
    icon: 'i-heroicons-arrow-path',
    name: 'Workflow',
    status: 'Active',
    statusColor: 'success' as const,
    desc: 'Step 3 of 7 · 4m elapsed',
  },
  {
    key: 'roadmap',
    to: '/roadmap',
    icon: 'i-heroicons-flag',
    name: 'Roadmap',
    status: 'Idle',
    statusColor: 'neutral' as const,
    desc: '6 intents tracked',
  },
]
</script>
