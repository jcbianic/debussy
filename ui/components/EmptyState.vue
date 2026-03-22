<template>
  <div
    class="text-center"
    :class="
      variant === 'box'
        ? 'border-line rounded-lg border border-dashed px-6 py-12'
        : 'py-12'
    "
  >
    <UIcon :name="icon" class="text-content-ghost mx-auto mb-3 size-8" />
    <p class="text-sm text-neutral-400">{{ text }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string
    text: string
    variant?: 'box' | 'bare'
  }>(),
  { variant: 'box' }
)
</script>
