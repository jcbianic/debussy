<template>
  <div class="flex items-center gap-1" :class="stretch ? 'w-full' : ''">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
      :class="[
        stretch ? 'flex-1 justify-center' : '',
        modelValue === opt.value
          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700',
      ]"
      type="button"
      @click="$emit('update:modelValue', opt.value)"
    >
      <UIcon v-if="opt.icon" :name="opt.icon" class="size-3" />
      {{ opt.label }}
      <span v-if="opt.count !== undefined" class="ml-0.5 opacity-60">{{
        opt.count
      }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
export interface SegmentOption {
  value: string
  label: string
  icon?: string
  count?: number
}

defineProps<{
  modelValue: string
  options: SegmentOption[]
  stretch?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
