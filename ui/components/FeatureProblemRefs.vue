<template>
  <div class="mb-5">
    <div
      class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
    >
      Addresses
    </div>
    <div class="space-y-2">
      <div
        v-for="p in problems"
        :key="p"
        class="flex items-start gap-3 rounded-lg border p-3"
        :class="problemCardClass(p)"
      >
        <UIcon
          :name="problemMeta[p]?.icon"
          class="mt-0.5 size-4 flex-shrink-0"
          :class="problemMeta[p]?.color"
        />
        <div>
          <div class="text-xs font-semibold">
            {{ problemMeta[p]?.name }}
          </div>
          <div class="text-content-subtle mt-0.5 text-xs">
            {{ problemMeta[p]?.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ problems: string[] }>()
</script>
