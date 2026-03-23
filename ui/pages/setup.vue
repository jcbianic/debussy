<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Header -->
    <div class="border-line flex-shrink-0 border-b px-8 py-5">
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">
            Claude Setup
          </h1>
          <p class="mt-0.5 font-mono text-xs text-neutral-400">
            {{ projectPath }}
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
          <UIcon
            name="i-heroicons-information-circle"
            class="size-3.5"
          />
          <span>Usage data requires hooks</span>
        </div>
      </div>
    </div>

    <!-- Split panel -->
    <div class="flex min-h-0 flex-1">
      <SetupListPanel
        :tabs="tabs"
        :active-tab="activeTab"
        :grouped-items="groupedItems"
        :selected-id="selected?.id ?? null"
        @select="selected = $event"
        @set-tab="activeTab = $event"
      />
      <div class="flex-1 overflow-y-auto">
        <SetupOverviewPanel
          v-if="!selected"
          :plugins="pluginsWithData"
          @select="selected = $event"
        />
        <SetupItemDetail
          v-else
          :item="selected"
          :usage="selectedUsage"
          :meta="selectedMeta"
          :plugin-groups="selectedPluginGroups"
          @select="selected = $event"
          @select-by-name="selectByName($event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { path: projectPath } = useProjectConfig()
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

const selectedUsage = computed(() =>
  selected.value ? usageFor(selected.value) : 0
)
const selectedPluginGroups = computed(() =>
  selected.value?.type === 'plugin' ? pluginProvides(selected.value.id) : []
)
const pluginsWithData = computed(() =>
  plugins.map((p) => ({
    ...p,
    totalUsage: usageFor(p),
    provideGroups: pluginProvides(p.id),
  }))
)
</script>
