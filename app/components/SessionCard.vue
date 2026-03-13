<template>
  <div
    class="p-4 rounded-lg cursor-pointer transition-colors"
    style="border: 1px solid var(--color-border)"
    data-testid="session-card"
    @click="$emit('select', session.id)"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="font-semibold" style="color: var(--color-text)">
        {{ session.label || 'Untitled Session' }}
      </span>
      <span
        class="px-2 py-0.5 rounded text-xs font-medium"
        :class="statusClass"
        data-testid="session-status"
      >
        {{ session.status }}
      </span>
    </div>
    <div class="text-sm" style="color: var(--color-text); opacity: 0.6">
      {{ formattedDate }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SessionProps {
  id: string
  label?: string
  status: 'idle' | 'running' | 'complete'
  createdAt: string
  workflowCount?: number
}

const props = defineProps<{ session: SessionProps }>()

defineEmits<{ select: [id: string] }>()

const statusClass = computed(() => {
  switch (props.session.status) {
    case 'running': return 'bg-blue-100 text-blue-800'
    case 'complete': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
})

const formattedDate = computed(() => {
  return new Date(props.session.createdAt).toLocaleString()
})
</script>
