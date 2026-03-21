<template>
  <div
    class="text-center"
    :class="variant === 'box'
      ? 'rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 px-6 py-12'
      : 'py-12'"
  >
    <UIcon :name="icon" class="size-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
    <p class="text-sm text-neutral-400">{{ text }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  text: string
  variant?: 'box' | 'bare'
}>(), { variant: 'box' })
</script>
