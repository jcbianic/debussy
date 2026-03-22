<template>
  <div class="px-8 py-6">
    <h2 class="mb-4 text-sm font-semibold">
      Installed plugins
    </h2>
    <div class="space-y-3">
      <div
        v-for="plugin in plugins"
        :key="plugin.id"
        class="border-line overflow-hidden rounded-lg border"
      >
        <!-- Plugin header -->
        <button
          type="button"
          class="border-line-subtle bg-surface flex w-full cursor-pointer items-center gap-3 border-b px-5 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/80"
          @click="emit('select', plugin)"
        >
          <UIcon
            name="i-heroicons-puzzle-piece"
            class="size-4 flex-shrink-0 text-blue-500"
          />
          <span class="font-mono text-sm font-medium">{{ plugin.name }}</span>
          <span
            v-if="plugin.version"
            class="font-mono text-xs text-neutral-400"
          >v{{ plugin.version }}</span>
          <UBadge
            v-if="plugin.scope"
            :label="plugin.scope"
            color="neutral"
            variant="outline"
            size="xs"
          />
          <span class="flex-1" />
          <span class="text-xs text-neutral-400">{{
            plugin.totalUsage > 0 ? `${plugin.totalUsage}×` : ''
          }}</span>
          <UIcon
            name="i-heroicons-chevron-right"
            class="text-content-ghost size-3.5"
          />
        </button>
        <!-- Provides -->
        <div
          class="bg-surface-page py-3/30 flex flex-wrap gap-x-4 gap-y-1.5 px-5"
        >
          <template
            v-for="group in plugin.provideGroups"
            :key="group.type"
          >
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-xs font-medium text-neutral-400">{{
                group.label
              }}</span>
              <button
                v-for="item in group.items"
                :key="item.id"
                class="text-content-muted hover:text-content font-mono text-xs transition-colors"
                @click="emit('select', item)"
              >
                {{ item.name }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SetupItem, ItemType } from '~/composables/useSetup'

interface PluginWithData extends SetupItem {
  totalUsage: number
  provideGroups: { type: ItemType; label: string; items: SetupItem[] }[]
}

defineProps<{
  plugins: PluginWithData[]
}>()

const emit = defineEmits<{
  select: [item: SetupItem]
}>()
</script>
