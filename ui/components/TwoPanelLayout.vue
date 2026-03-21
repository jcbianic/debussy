<template>
  <div class="flex h-full">
    <div
      class="flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
      :class="leftWidth"
    >
      <slot name="left" />
    </div>
    <div class="flex-1 min-w-0 min-h-0 flex flex-col">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ leftWidth?: string }>(), { leftWidth: 'w-56' })
</script>
