<template>
  <div class="flex h-full">
    <!-- Main roadmap -->
    <div class="flex-1 overflow-auto px-8 py-8">
      <!-- Page header -->
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h1 class="text-xl font-semibold">
            Roadmap of {{ projectName }}
          </h1>
          <p class="text-content-subtle mt-1 font-mono text-sm">
            {{ projectPath }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-3 text-xs text-neutral-400">
            <span class="flex items-center gap-1"><UIcon
              name="i-heroicons-check-circle"
              class="size-3.5 text-green-500"
            />
              Merged</span>
            <span class="flex items-center gap-1"><UIcon
              name="i-heroicons-arrow-path"
              class="size-3.5 text-blue-500"
            />
              In lane</span>
            <span class="flex items-center gap-1"><UIcon
              name="i-heroicons-ellipsis-horizontal-circle"
              class="size-3.5 text-neutral-400"
            />
              Open</span>
            <span class="flex items-center gap-1"><UIcon
              name="i-heroicons-minus-circle"
              class="text-content-ghost size-3.5"
            />
              Out of scope</span>
          </div>
          <UButton
            :label="syncing ? 'Syncing…' : 'Sync with GitHub'"
            icon="i-heroicons-arrow-path"
            :loading="syncing"
            size="sm"
            color="neutral"
            variant="outline"
            @click="triggerSync"
          />
        </div>
      </div>

      <!-- Summary bar -->
      <RoadmapSummaryBar
        :shipped-releases="shippedReleases"
        :current-release="currentRelease"
        :planned-releases="plannedReleases"
        :active-filter="activeFilter"
        class="mb-5"
        @update:active-filter="activeFilter = $event"
      />

      <!-- Filter tabs -->
      <SegmentedControl
        v-model="activeFilter"
        :options="filterTabs"
        class="mb-6"
      />

      <!-- Releases -->
      <RoadmapReleasesSection
        :visible-releases="visibleReleases"
        :releases="releases"
        :collapsed="collapsed"
        :selected-intent="selectedIntent"
        @toggle-collapse="toggleCollapse"
        @update:selected-intent="selectedIntent = $event"
        @move-intent="moveIntent"
      />
    </div>

    <!-- Detail side panel -->
    <IntentDetailPanel
      :intent="selectedIntent"
      @close="selectedIntent = null"
    />
  </div>
</template>

<script setup lang="ts">
const { name: projectName, path: projectPath } = useProjectConfig()
const {
  releases,
  collapsed,
  toggleCollapse,
  shippedReleases,
  currentRelease,
  plannedReleases,
  activeFilter,
  filterTabs,
  visibleReleases,
  selectedIntent,
  syncing,
  triggerSync,
  moveIntent,
} = useRoadmap()
</script>
