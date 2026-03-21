<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors"
    :class="
      isActive
        ? 'bg-surface-hover text-content font-medium'
        : 'text-content-subtle hover:bg-surface-hover hover:text-content'
    "
  >
    <UIcon :name="icon" class="size-4 flex-shrink-0" />
    <span class="flex-1">{{ label }}</span>
    <UBadge
      v-if="badge"
      :label="String(badge)"
      color="warning"
      variant="subtle"
      size="xs"
    />
    <span
      v-if="tag"
      class="bg-surface-tag text-content-subtle rounded px-1.5 py-0.5 font-mono text-xs"
      >{{ tag }}</span
    >
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
