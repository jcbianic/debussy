<template>
  <div class="overflow-y-auto px-8 py-6">
    <h2 class="mb-1 text-sm font-semibold">
      Usage dashboard
    </h2>
    <p class="text-content-faint mb-5 text-xs">
      {{ totalInvocations }} total invocations across {{ itemCount }} items
    </p>

    <!-- Filters -->
    <div class="mb-5 flex flex-wrap items-center gap-3">
      <!-- Type filter -->
      <div class="bg-surface-sunken flex gap-0.5 rounded-lg p-0.5">
        <button
          v-for="tf in typeFilters"
          :key="tf.key"
          class="rounded-md px-2.5 py-1 text-xs transition-colors"
          :class="
            activeType === tf.key
              ? 'bg-surface-inverted text-content-inverted font-medium'
              : 'text-content-faint hover:text-content'
          "
          @click="activeType = tf.key"
        >
          {{ tf.label }}
          <span class="ml-0.5 tabular-nums opacity-50">{{ tf.count }}</span>
        </button>
      </div>

      <!-- Plugin filter -->
      <div class="relative">
        <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
        <select
          v-model="activePlugin"
          aria-label="Filter by plugin"
          class="border-line bg-surface-tinted appearance-none rounded-lg border py-1.5 pr-7 pl-3 font-mono text-xs focus:border-blue-500 focus:outline-none"
        >
          <option value="all">
            All plugins
          </option>
          <option
            v-for="p in pluginOptions"
            :key="p.id"
            :value="p.id"
          >
            {{ p.name }}
          </option>
        </select>
        <UIcon
          name="i-heroicons-chevron-down"
          class="text-content-faint pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2"
        />
      </div>

      <!-- Show zero toggle -->
      <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
      <label
        class="text-content-faint flex cursor-pointer items-center gap-1.5 text-xs"
      >
        <input
          v-model="showZero"
          type="checkbox"
          class="accent-blue-500"
        >
        Show unused
      </label>
    </div>

    <!-- Plugin aggregation cards -->
    <div
      v-if="activePlugin === 'all' && pluginStats.length > 1"
      class="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3"
    >
      <button
        v-for="ps in pluginStats"
        :key="ps.id"
        class="border-line hover:bg-surface-hover rounded-lg border px-4 py-3 text-left transition-colors"
        @click="activePlugin = ps.id"
      >
        <div class="mb-1 flex items-center gap-2">
          <UIcon
            name="i-heroicons-puzzle-piece"
            class="size-3.5 text-blue-500"
          />
          <span class="truncate font-mono text-xs font-medium">{{
            ps.name
          }}</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-lg font-semibold tabular-nums">{{ ps.usage }}</span>
          <span class="text-content-faint text-xs">invocations</span>
        </div>
        <div class="bg-surface-sunken mt-1.5 h-1 overflow-hidden rounded-full">
          <div
            class="h-full rounded-full bg-blue-500 transition-all"
            :style="{ width: barWidth(ps.usage, maxPluginUsage) }"
          />
        </div>
      </button>
    </div>

    <!-- Ranked item list -->
    <div class="border-line overflow-hidden rounded-lg border">
      <div
        v-if="filteredItems.length === 0"
        class="text-content-faint px-5 py-8 text-center text-sm"
      >
        No items match the current filters
      </div>
      <template v-else>
        <button
          v-for="(item, i) in filteredItems"
          :key="item.id"
          class="hover:bg-surface-hover flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
          :class="
            i < filteredItems.length - 1 ? 'border-line-subtle border-b' : ''
          "
          @click="emit('select', item)"
        >
          <!-- Rank -->
          <span
            class="w-5 flex-shrink-0 text-right font-mono text-xs tabular-nums"
            :class="
              item.usage > 0 ? 'text-content-faint' : 'text-content-placeholder'
            "
          >{{ i + 1 }}</span>

          <!-- Icon -->
          <UIcon
            :name="typeIcon(item.type)"
            class="size-3.5 flex-shrink-0"
            :class="typeColor(item.type)"
          />

          <!-- Name -->
          <span
            class="min-w-0 flex-1 truncate font-mono text-xs"
            :class="item.usage > 0 ? 'text-content' : 'text-content-faint'"
          >{{ item.name }}</span>

          <!-- Plugin badge -->
          <span
            v-if="activePlugin === 'all' && item.plugin"
            class="text-content-faint hidden flex-shrink-0 truncate font-mono text-xs lg:block"
          >{{ item.plugin.split('@')[0] }}</span>

          <!-- Bar -->
          <div class="hidden w-32 flex-shrink-0 sm:block">
            <div class="bg-surface-sunken h-1.5 overflow-hidden rounded-full">
              <div
                class="h-full rounded-full transition-all"
                :class="barColor(item.type)"
                :style="{ width: barWidth(item.usage, maxItemUsage) }"
              />
            </div>
          </div>

          <!-- Count -->
          <span
            class="w-10 flex-shrink-0 text-right font-mono text-xs tabular-nums"
            :class="
              item.usage > 0
                ? 'text-content-secondary'
                : 'text-content-placeholder'
            "
          >{{ item.usage > 0 ? `${item.usage}×` : '0' }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SetupItem, ItemType } from '~/composables/useSetup'

const props = defineProps<{
  items: SetupItem[]
  plugins: SetupItem[]
}>()

const emit = defineEmits<{
  select: [item: SetupItem]
}>()

type TypeFilter = 'all' | 'skill' | 'command' | 'agent'
const activeType = ref<TypeFilter>('all')
const activePlugin = ref<string>('all')
const showZero = ref(true)

// ── Invocable items only (no plugins, no hooks) ──
const invocableItems = computed(() =>
  props.items.filter(
    (i) => i.type === 'skill' || i.type === 'command' || i.type === 'agent'
  )
)

// ── Type filter tabs ──
const typeFilters = computed(() => {
  const base = invocableItems.value
  return [
    { key: 'all' as const, label: 'All', count: base.length },
    {
      key: 'skill' as const,
      label: 'Skills',
      count: base.filter((i) => i.type === 'skill').length,
    },
    {
      key: 'command' as const,
      label: 'Commands',
      count: base.filter((i) => i.type === 'command').length,
    },
    {
      key: 'agent' as const,
      label: 'Agents',
      count: base.filter((i) => i.type === 'agent').length,
    },
  ]
})

// ── Plugin options ──
const pluginOptions = computed(() =>
  props.plugins.map((p) => ({ id: p.id, name: p.name }))
)

// ── Plugin aggregation stats ──
const pluginStats = computed(() =>
  props.plugins
    .map((p) => {
      const children = invocableItems.value.filter(
        (i) => i.plugin === p.id || i.plugin === p.name
      )
      const usage = children.reduce((s, i) => s + i.usage, 0)
      return { id: p.id, name: p.name, usage, count: children.length }
    })
    .sort((a, b) => b.usage - a.usage)
)

const maxPluginUsage = computed(() =>
  Math.max(1, ...pluginStats.value.map((p) => p.usage))
)

// ── Filtered & sorted items ──
const filteredItems = computed(() => {
  let list = invocableItems.value

  if (activeType.value !== 'all') {
    list = list.filter((i) => i.type === activeType.value)
  }

  if (activePlugin.value !== 'all') {
    const pluginId = activePlugin.value
    list = list.filter(
      (i) => i.plugin === pluginId || i.plugin === pluginId.split('@')[0]
    )
  }

  if (!showZero.value) {
    list = list.filter((i) => i.usage > 0)
  }

  return [...list].sort(
    (a, b) => b.usage - a.usage || a.name.localeCompare(b.name)
  )
})

const maxItemUsage = computed(() =>
  Math.max(1, ...filteredItems.value.map((i) => i.usage))
)

const totalInvocations = computed(() =>
  invocableItems.value.reduce((s, i) => s + i.usage, 0)
)

const itemCount = computed(() => invocableItems.value.length)

function barWidth(value: number, max: number): string {
  if (max === 0 || value === 0) return '0%'
  return `${Math.max(2, (value / max) * 100)}%`
}

function barColor(type: ItemType): string {
  return {
    plugin: 'bg-blue-500',
    skill: 'bg-violet-500',
    command: 'bg-emerald-500',
    hook: 'bg-amber-500',
    agent: 'bg-cyan-500',
  }[type]
}
</script>
