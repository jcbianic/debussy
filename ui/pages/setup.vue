<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Header -->
    <div class="border-line flex-shrink-0 border-b px-8 py-5">
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">Claude Setup</h1>
          <p class="mt-0.5 font-mono text-xs text-neutral-400">
            ~/Projets/Libon-Data/debussy
          </p>
        </div>
        <UBadge
          label="No conflicts"
          color="success"
          variant="subtle"
          size="sm"
        />
      </div>
      <div class="flex items-center gap-6">
        <div
          v-for="stat in headerStats"
          :key="stat.label"
          class="flex items-baseline gap-1.5"
        >
          <span class="text-lg font-semibold tabular-nums">{{
            stat.value
          }}</span>
          <span class="text-xs text-neutral-400">{{ stat.label }}</span>
        </div>
        <div class="ml-auto flex items-center gap-1.5 text-xs text-neutral-400">
          <UIcon name="i-heroicons-information-circle" class="size-3.5" />
          <span>Usage data requires hooks</span>
        </div>
      </div>
    </div>

    <!-- Split panel -->
    <div class="flex min-h-0 flex-1">
      <!-- Left: filter + list -->
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
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
              <span class="ml-0.5 tabular-nums opacity-50">{{
                tab.count
              }}</span>
            </button>
          </div>
        </div>

        <!-- Item list -->
        <div class="flex-1 overflow-y-auto py-1.5">
          <template v-for="group in groupedItems" :key="group.label">
            <div
              v-if="activeTab === 'all' && group.label"
              class="px-4 pt-3 pb-1"
            >
              <span
                class="text-content-faint text-xs font-medium tracking-wider uppercase"
                >{{ group.label }}</span
              >
            </div>
            <button
              v-for="item in group.items"
              :key="item.id"
              class="mx-1.5 flex w-[calc(100%-12px)] items-center gap-2.5 rounded-md px-3 py-1.5 text-left transition-colors"
              :class="
                selected?.id === item.id
                  ? 'bg-surface-sunken'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
              "
              @click="selected = item"
            >
              <UIcon
                :name="typeIcon(item.type)"
                class="size-3.5 flex-shrink-0"
                :class="typeColor(item.type)"
              />
              <span
                class="flex-1 truncate font-mono text-xs"
                :class="
                  selected?.id === item.id
                    ? 'text-content'
                    : 'text-content-muted'
                "
                >{{ item.name }}</span
              >
              <span
                v-if="item.usage > 0"
                class="flex-shrink-0 text-xs text-neutral-400 tabular-nums"
                >{{ item.usage }}×</span
              >
            </button>
          </template>
        </div>
      </div>

      <!-- Right: detail -->
      <div class="flex-1 overflow-y-auto">
        <!-- Overview (nothing selected) -->
        <div v-if="!selected" class="px-8 py-6">
          <h2 class="mb-4 text-sm font-semibold">Installed plugins</h2>
          <div class="space-y-3">
            <div
              v-for="plugin in plugins"
              :key="plugin.id"
              class="border-line overflow-hidden rounded-lg border"
            >
              <!-- Plugin header -->
              <div
                class="border-line-subtle bg-surface flex cursor-pointer items-center gap-3 border-b px-5 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/80"
                @click="selected = plugin"
              >
                <UIcon
                  name="i-heroicons-puzzle-piece"
                  class="size-4 flex-shrink-0 text-blue-500"
                />
                <span class="font-mono text-sm font-medium">{{
                  plugin.name
                }}</span>
                <span
                  v-if="plugin.version"
                  class="font-mono text-xs text-neutral-400"
                  >v{{ plugin.version }}</span
                >
                <UBadge
                  v-if="plugin.scope"
                  :label="plugin.scope"
                  color="neutral"
                  variant="outline"
                  size="xs"
                />
                <span class="flex-1" />
                <span class="text-xs text-neutral-400">{{
                  usageFor(plugin) > 0 ? `${usageFor(plugin)}×` : ''
                }}</span>
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="text-content-ghost size-3.5"
                />
              </div>
              <!-- Provides -->
              <div
                class="bg-surface-page py-3/30 flex flex-wrap gap-x-4 gap-y-1.5 px-5"
              >
                <template
                  v-for="group in pluginProvides(plugin.id)"
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
                      @click="selected = item"
                    >
                      {{ item.name }}
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail view -->
        <div v-else class="px-8 py-6">
          <!-- Item header -->
          <div class="mb-5 flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <div class="mb-2 flex items-center gap-2">
                <UIcon
                  :name="typeIcon(selected.type)"
                  class="size-5 flex-shrink-0"
                  :class="typeColor(selected.type)"
                />
                <h2 class="font-mono text-base font-semibold">
                  {{ selected.name }}
                </h2>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <UBadge
                  :label="selected.type"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                />
                <span v-if="selected.plugin" class="text-xs text-neutral-400"
                  >from
                  <span class="font-mono">{{ selected.plugin }}</span></span
                >
                <span
                  v-if="selected.version"
                  class="text-content-ghost font-mono text-xs"
                  >v{{ selected.version }}</span
                >
                <UBadge
                  v-if="selected.scope"
                  :label="selected.scope"
                  color="neutral"
                  variant="outline"
                  size="xs"
                />
              </div>
            </div>
            <div class="ml-8 flex-shrink-0 text-right">
              <div
                class="text-2xl font-semibold tabular-nums"
                :class="
                  usageFor(selected) > 0
                    ? 'text-content'
                    : 'text-content-placeholder'
                "
              >
                {{ usageFor(selected) > 0 ? usageFor(selected) : '—' }}
              </div>
              <div class="text-xs text-neutral-400">
                {{ usageFor(selected) > 0 ? 'invocations' : 'no data yet' }}
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div
            v-if="selectedMeta.length"
            class="border-line bg-surface-tinted mb-5 flex gap-8 rounded-lg border px-5 py-3.5"
          >
            <div v-for="m in selectedMeta" :key="m.label">
              <div class="mb-0.5 text-xs text-neutral-400">{{ m.label }}</div>
              <div class="font-mono text-xs font-medium">{{ m.value }}</div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selected.description" class="mb-5">
            <p class="text-content-secondary text-sm leading-relaxed">
              {{ selected.description }}
            </p>
          </div>

          <!-- ── PLUGIN: provides grouped by type ── -->
          <template v-if="selected.type === 'plugin'">
            <div
              v-for="group in pluginProvides(selected.id)"
              :key="group.type"
              class="mb-5"
            >
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                {{ group.label }}
                <span class="font-normal opacity-60">{{
                  group.items.length
                }}</span>
              </h3>
              <div class="border-line overflow-hidden rounded-lg border">
                <button
                  v-for="(item, i) in group.items"
                  :key="item.id"
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  :class="
                    i < group.items.length - 1
                      ? 'border-line-subtle border-b'
                      : ''
                  "
                  @click="selected = item"
                >
                  <UIcon
                    :name="typeIcon(item.type)"
                    class="size-3.5 flex-shrink-0"
                    :class="typeColor(item.type)"
                  />
                  <span
                    class="text-content-secondary flex-1 font-mono text-xs"
                    >{{ item.name }}</span
                  >
                  <span
                    v-if="item.description"
                    class="hidden max-w-xs truncate text-xs text-neutral-400 lg:block"
                    >{{ item.description }}</span
                  >
                  <span
                    v-if="item.usage > 0"
                    class="ml-3 flex-shrink-0 text-xs text-neutral-400 tabular-nums"
                    >{{ item.usage }}×</span
                  >
                  <UIcon
                    name="i-heroicons-chevron-right"
                    class="text-content-ghost size-3 flex-shrink-0"
                  />
                </button>
              </div>
            </div>
          </template>

          <!-- ── COMMAND: frontmatter + body ── -->
          <template v-if="selected.type === 'command'">
            <!-- Allowed tools -->
            <div v-if="selected.allowedTools" class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Allowed tools
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tool in selected.allowedTools.split(', ')"
                  :key="tool"
                  class="bg-surface-hover text-content-muted border-line-raised rounded border px-2 py-1 font-mono text-xs"
                  >{{ tool }}</span
                >
              </div>
            </div>
            <!-- Argument hint -->
            <div v-if="selected.argHint" class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Usage
              </h3>
              <code class="text-content-secondary font-mono text-sm"
                >{{ selected.name }} {{ selected.argHint }}</code
              >
            </div>
            <!-- Body content -->
            <div v-if="selected.body" class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Content
              </h3>
              <pre
                class="border-line text-content-secondary bg-surface-tinted overflow-x-auto rounded-lg border px-5 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap"
                >{{ selected.body }}</pre
              >
            </div>
            <!-- Delegates to skill -->
            <div v-if="selected.delegatesTo" class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Delegates to
              </h3>
              <button
                class="border-line flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                @click="selectByName(selected.delegatesTo!)"
              >
                <UIcon
                  name="i-heroicons-sparkles"
                  class="size-3.5 text-violet-500"
                />
                <span class="text-content-secondary font-mono text-xs">{{
                  selected.delegatesTo
                }}</span>
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="ml-1 size-3 text-neutral-400"
                />
              </button>
            </div>
          </template>

          <!-- ── SKILL: triggers -->
          <template
            v-if="selected.type === 'skill' && selected.triggers?.length"
          >
            <div class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Triggers on
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="t in selected.triggers"
                  :key="t"
                  class="rounded border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
                  >{{ t }}</span
                >
              </div>
            </div>
          </template>

          <!-- ── HOOK: fires on ── -->
          <template v-if="selected.type === 'hook'">
            <div v-if="selected.triggers?.length" class="mb-5">
              <h3
                class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Fires on
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="t in selected.triggers"
                  :key="t"
                  class="rounded border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
                  >{{ t }}</span
                >
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { typeIcon, typeColor } from '~/composables/useSetup'

const {
  plugins,
  activeTab,
  tabs,
  groupedItems,
  selected,
  selectByName,
  pluginProvides,
  usageFor,
  selectedMeta,
  headerStats,
} = useSetup()
</script>
