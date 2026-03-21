<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors"
    :class="isActive
      ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium'
      : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100'"
  >
    <UIcon :name="icon" class="size-4 flex-shrink-0" />
    <span class="flex-1">{{ label }}</span>
    <UBadge v-if="badge" :label="String(badge)" color="warning" variant="subtle" size="xs" />
    <span
      v-if="tag"
      class="text-xs font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
    >{{ tag }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const route = useRoute()
const props = defineProps<{
  to: string
  icon: string
  label: string
  badge?: number
  tag?: string
}>()
const isActive = computed(() => route.path === props.to)
</script>
