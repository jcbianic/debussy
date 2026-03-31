<template>
  <div
    class="border-line flex w-72 flex-shrink-0 flex-col overflow-hidden border-r"
  >
    <!-- Type filter -->
    <div class="border-line-subtle flex-shrink-0 border-b px-3 py-2.5">
      <div class="flex flex-wrap gap-0.5">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="rounded px-2 py-1 text-xs transition-colors"
          :class="
            activeTab === tab.key
              ? 'bg-surface-inverted text-content-inverted font-medium'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-900 dark:hover:text-neutral-200'
          "
          @click="emit('setTab', tab.key)"
        >
          {{ tab.label }}
          <span class="ml-0.5 tabular-nums opacity-50">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Group-by toggle (only when All tab is active) -->
    <div
      v-if="activeTab === 'all'"
      class="border-line-subtle flex-shrink-0 border-b px-3 py-2"
    >
      <SegmentedControl
        :model-value="groupByMode"
        :options="groupByOptions"
        stretch
        @update:model-value="emit('setGroupBy', $event)"
      />
    </div>

    <!-- Create new project item -->
    <div class="border-line-subtle flex-shrink-0 border-b px-3 py-2">
      <UButton
        icon="i-heroicons-plus"
        size="xs"
        color="neutral"
        variant="soft"
        label="New project item"
        block
        @click="emit('create')"
      />
    </div>

    <!-- Item list -->
    <div class="flex-1 overflow-y-auto py-1.5">
      <template
        v-for="group in groupedItems"
        :key="group.pluginId ?? group.label"
      >
        <!-- Plugin group header (collapsible) -->
        <button
          v-if="group.pluginId"
          class="mx-1.5 flex w-[calc(100%-12px)] items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
          @click="toggle(group.pluginId!)"
        >
          <UIcon
            :name="
              isExpanded(group.pluginId!)
                ? 'i-heroicons-chevron-down'
                : 'i-heroicons-chevron-right'
            "
            class="size-3 flex-shrink-0 text-neutral-400"
          />
          <UIcon
            name="i-heroicons-puzzle-piece"
            class="size-3.5 flex-shrink-0 text-blue-500"
          />
          <span class="flex-1 truncate text-xs font-medium">
            {{ group.label }}
          </span>
          <span class="text-xs text-neutral-400 tabular-nums">
            {{ group.items.length }}
          </span>
        </button>

        <!-- Type group header (flat mode) -->
        <div
          v-else-if="activeTab === 'all' && group.label"
          class="px-4 pt-3 pb-1"
        >
          <span
            class="text-content-faint text-xs font-medium tracking-wider uppercase"
          >{{ group.label }}</span>
        </div>

        <!-- Items (hidden when plugin group is collapsed) -->
        <template v-if="!group.pluginId || isExpanded(group.pluginId!)">
          <button
            v-for="item in group.items"
            :key="item.id"
            class="mx-1.5 flex w-[calc(100%-12px)] items-center gap-2.5 rounded-md py-1.5 text-left transition-colors"
            :class="[
              selectedId === item.id
                ? 'bg-surface-sunken'
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50',
              group.pluginId ? 'pr-3 pl-9' : 'px-3',
            ]"
            @click="emit('select', item)"
          >
            <UIcon
              :name="typeIcon(item.type)"
              class="size-3.5 flex-shrink-0"
              :class="typeColor(item.type)"
            />
            <span
              class="flex-1 truncate font-mono text-xs"
              :class="
                selectedId === item.id ? 'text-content' : 'text-content-muted'
              "
            >{{ item.name }}</span>
            <span
              v-if="item.usage > 0"
              class="flex-shrink-0 text-xs text-neutral-400 tabular-nums"
            >{{ item.usage }}×</span>
          </button>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SetupItem, ItemType, SetupGroup } from '~/composables/useSetup'

const props = defineProps<{
  tabs: { key: 'all' | ItemType; label: string; count: number }[]
  activeTab: 'all' | ItemType
  groupedItems: SetupGroup[]
  selectedId: string | null
  groupByMode: string
  groupByOptions: { value: string; label: string }[]
}>()

const emit = defineEmits<{
  select: [item: SetupItem]
  setTab: [key: 'all' | ItemType]
  setGroupBy: [mode: string]
  create: []
}>()

const pluginIds = computed(() =>
  props.groupedItems.filter((g) => g.pluginId).map((g) => g.pluginId!)
)

const { toggle, has: isExpanded, expanded } = useExpandable([])

// Auto-expand new plugin groups as they appear
watch(
  pluginIds,
  (ids) => {
    let changed = false
    for (const id of ids) {
      if (!expanded.value.has(id)) {
        expanded.value.add(id)
        changed = true
      }
    }
    if (changed) expanded.value = new Set(expanded.value)
  },
  { immediate: true }
)
</script>
