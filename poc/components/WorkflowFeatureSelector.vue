<template>
  <select
    v-if="features.length > 0"
    class="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
    :value="modelValue ?? ''"
    @change="onchange"
  >
    <option value="" disabled>Select a feature…</option>
    <option
      v-for="feature in features"
      :key="feature.id"
      :value="feature.id"
    >
      {{ feature.name }}
    </option>
  </select>
</template>

<script setup lang="ts">
import type { Feature } from '../server/utils/types'

const props = defineProps<{
  features: Feature[]
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onchange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>
