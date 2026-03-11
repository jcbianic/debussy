<template>
  <ul class="space-y-0.5 text-sm font-mono">
    <li v-for="entry in entries" :key="entry.path">
      <div
        class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800/50 cursor-pointer select-none"
        @click="entry.type === 'directory' && toggle(entry.path)"
      >
        <span v-if="entry.type === 'directory'" class="text-yellow-400 w-4 text-center">
          {{ expanded.has(entry.path) ? '▼' : '▶' }}
        </span>
        <span v-else class="text-gray-600 w-4 text-center">·</span>
        <span :class="entry.type === 'directory' ? 'text-yellow-300' : 'text-gray-300'">
          {{ entry.name }}
        </span>
        <span v-if="entry.type === 'file'" class="text-xs text-gray-600 ml-auto">
          {{ formatSize(entry.size) }}
        </span>
      </div>
      <div v-if="entry.type === 'directory' && expanded.has(entry.path)" class="ml-4 border-l border-gray-800 pl-2">
        <FileTree :entries="entry.children || []" />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  entries: Array<{
    name: string
    path: string
    type: 'file' | 'directory'
    size?: number
    children?: any[]
  }>
}>()

const expanded = ref(new Set<string>())

function toggle(path: string) {
  const next = new Set(expanded.value)
  if (next.has(path)) {
    next.delete(path)
  } else {
    next.add(path)
  }
  expanded.value = next
}

function formatSize(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`
}
</script>
