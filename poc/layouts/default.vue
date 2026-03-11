<template>
  <div class="h-screen bg-[#1a1b26] text-gray-100 flex flex-col">
    <nav class="flex items-center gap-1 px-4 py-2 bg-[#16161e] border-b border-gray-800">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="px-4 py-1.5 rounded text-sm font-medium transition-colors"
        :class="$route.path === link.to ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const links = [
  { to: '/', label: 'Terminal' },
  { to: '/sessions', label: 'Explorer' },
  { to: '/workflow', label: 'Workflow' },
]
</script>
