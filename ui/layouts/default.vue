<template>
  <div class="flex h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased">

    <!-- Sidebar -->
    <aside class="w-56 flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800">

      <!-- Brand -->
      <div class="h-14 flex items-center px-5 border-b border-neutral-200 dark:border-neutral-800">
        <span class="text-sm font-semibold tracking-tight">Debussy</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
            route.path === item.to
              ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100',
          ]"
        >
          <UIcon :name="item.icon" class="size-4 flex-shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Controls -->
      <div class="px-3 py-3 border-t border-neutral-200 dark:border-neutral-800">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleColorMode"
        />
      </div>

    </aside>

    <!-- Main -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const navItems = [
  { to: '/',         label: 'Dashboard', icon: 'i-heroicons-squares-2x2' },
  { to: '/feedback', label: 'Feedback',  icon: 'i-heroicons-chat-bubble-left-right' },
  { to: '/strategy', label: 'Strategy',  icon: 'i-heroicons-map' },
  { to: '/workflow', label: 'Workflow',  icon: 'i-heroicons-arrow-path' },
  { to: '/roadmap',  label: 'Roadmap',   icon: 'i-heroicons-flag' },
]
</script>
