<template>
  <div>
    <button
      class="mx-1.5 flex w-[calc(100%-12px)] items-center gap-1.5 rounded-md py-1.5 pr-3 text-left transition-colors"
      :class="
        isSelected
          ? 'bg-surface-sunken'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
      "
      :style="{ paddingLeft: `${depth * 12 + 12}px` }"
      @click="handleClick"
    >
      <UIcon
        v-if="node.children?.length"
        :name="
          isExpanded ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'
        "
        class="size-3 flex-shrink-0 text-neutral-400"
      />
      <span
        v-else
        class="size-3 flex-shrink-0"
      />
      <UIcon
        :name="node.icon"
        class="size-3.5 flex-shrink-0"
        :class="node.iconClass"
      />
      <span
        class="flex-1 truncate font-mono text-xs"
        :class="isSelected ? 'text-content' : 'text-content-muted'"
      >{{ node.label }}</span>
      <span
        v-if="node.item && node.item.usage > 0"
        class="flex-shrink-0 text-xs text-neutral-400 tabular-nums"
      >{{ node.item.usage }}×</span>
    </button>
    <template v-if="isExpanded && node.children?.length">
      <SetupTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :selected-id="selectedId"
        @select="emit('select', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ExplorerNode, SetupItem } from '~/composables/useSetup'

const props = defineProps<{
  node: ExplorerNode
  depth: number
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [item: SetupItem]
}>()

const isExpanded = ref(props.node.defaultExpanded ?? false)

const isSelected = computed(
  () => !!props.node.item && props.selectedId === props.node.item.id
)

function handleClick() {
  if (props.node.children?.length) {
    isExpanded.value = !isExpanded.value
  }
  if (props.node.item) {
    emit('select', props.node.item)
  }
}
</script>
