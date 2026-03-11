<template>
  <nav class="flex items-center justify-between px-4 py-3" style="border-bottom: 1px solid var(--color-border); background-color: var(--color-background)" data-testid="app-navigation">
    <!-- Logo/Title -->
    <NuxtLink to="/" class="text-lg font-bold" style="color: var(--color-primary)" data-testid="nav-logo">
      Debussy
    </NuxtLink>

    <!-- Desktop Links -->
    <div class="hidden sm:flex items-center gap-1" data-testid="nav-links">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="px-3 py-1.5 rounded text-sm font-medium transition-colors"
        :class="isActive(link.to) ? 'bg-[var(--color-primary)] text-white' : ''"
        :style="!isActive(link.to) ? 'color: var(--color-text)' : ''"
        :data-testid="`nav-link-${link.name}`"
        :aria-current="isActive(link.to) ? 'page' : undefined"
      >
        {{ link.label }}
      </NuxtLink>
    </div>

    <div class="hidden sm:block">
      <ThemeToggle />
    </div>

    <!-- Mobile Hamburger -->
    <button
      class="sm:hidden p-2"
      style="color: var(--color-text)"
      data-testid="hamburger"
      :aria-expanded="mobileOpen"
      aria-label="Toggle navigation menu"
      @click="mobileOpen = !mobileOpen"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path v-if="!mobileOpen" d="M3 12h18M3 6h18M3 18h18" />
        <path v-else d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  </nav>

  <!-- Mobile Menu -->
  <div
    v-if="mobileOpen"
    class="sm:hidden px-4 py-2 flex flex-col gap-1"
    style="border-bottom: 1px solid var(--color-border); background-color: var(--color-background)"
    data-testid="mobile-menu"
  >
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="px-3 py-2 rounded text-sm font-medium"
      :class="isActive(link.to) ? 'bg-[var(--color-primary)] text-white' : ''"
      :style="!isActive(link.to) ? 'color: var(--color-text)' : ''"
      @click="mobileOpen = false"
    >
      {{ link.label }}
    </NuxtLink>
    <div class="py-2">
      <ThemeToggle />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileOpen = ref(false)

const links = [
  { to: '/', label: 'Home', name: 'index' },
  { to: '/sessions', label: 'Sessions', name: 'sessions' },
  { to: '/workflows', label: 'Workflows', name: 'workflows' },
  { to: '/artifacts', label: 'Artifacts', name: 'artifacts' },
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
