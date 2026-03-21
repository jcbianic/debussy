<template>
  <div class="flex h-full">
    <div
      class="flex flex-shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      :class="leftWidth"
    >
      <slot name="left" />
    </div>
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ leftWidth?: string }>(), { leftWidth: 'w-56' })
</script>
