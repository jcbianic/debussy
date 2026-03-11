<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

// Initialize theme on app mount (loads from localStorage, applies CSS vars)
useTheme()
</script>

<style>
:root {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-background: #ffffff;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-sm: 14px;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  transition: background-color 0.2s, color 0.2s;
}
</style>
