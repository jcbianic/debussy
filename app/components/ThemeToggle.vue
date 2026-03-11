<template>
  <div class="flex items-center gap-1" data-testid="theme-toggle">
    <button
      v-for="option in options"
      :key="option.value"
      :data-testid="`theme-${option.value}`"
      :aria-label="`Switch to ${option.value} mode`"
      :aria-pressed="mode === option.value"
      class="px-3 py-1.5 rounded text-sm font-medium transition-colors"
      :class="mode === option.value
        ? 'bg-[var(--color-primary)] text-white'
        : 'text-[var(--color-text)] hover:bg-[var(--color-border)]'"
      @click="switchMode(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const { mode, switchMode } = useTheme()

const options = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'system' as const, label: 'System' },
]
</script>
