<template>
  <TwoPanelLayout>
    <template #left>
      <div class="border-line border-b px-5 py-5">
        <h1 class="text-sm font-semibold">
          Product of {{ projectName }}
        </h1>
        <p class="mt-0.5 font-mono text-xs text-neutral-400">
          {{ projectPath }}
        </p>
      </div>
      <div class="flex-1 overflow-y-auto">
        <button
          v-for="artifact in artifacts"
          :key="artifact.key"
          type="button"
          class="border-line-subtle flex w-full cursor-pointer items-center gap-3 border-b px-5 py-3 text-left transition-colors last:border-b-0"
          :class="
            selected === artifact.key
              ? 'bg-surface-hover-subtle'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          "
          @click="selected = artifact.key"
        >
          <UIcon
            :name="artifact.icon"
            class="size-4 flex-shrink-0 text-neutral-400"
          />
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium">
              {{ artifact.name }}
            </div>
            <div class="mt-0.5 truncate font-mono text-xs text-neutral-400">
              {{ artifact.file }}
            </div>
          </div>
          <UBadge
            :label="artifact.status"
            :color="artifact.status === 'reviewed' ? 'success' : 'warning'"
            variant="subtle"
            size="xs"
          />
        </button>
      </div>
      <div class="border-line border-t px-5 py-3 text-xs text-neutral-400">
        Last run 2 days ago
      </div>
    </template>

    <!-- Right panel: content -->
    <ProductArtifactDetail :artifact="currentArtifact" />
  </TwoPanelLayout>
</template>

<script setup lang="ts">
import type { Artifact } from '~/composables/useProduct'

const { name: projectName, path: projectPath } = useProjectConfig()
const { data: artifacts, refresh } = await useFetch<Artifact[]>('/api/strategy')

const selected = ref(artifacts.value?.[0]?.key ?? 'vision')
const currentArtifact = computed(() =>
  artifacts.value?.find((a) => a.key === selected.value)
)

// Live reload when markdown files change
let es: EventSource | null = null
onMounted(() => {
  es = new EventSource('/api/watch')
  es.onmessage = () => refresh()
})
onUnmounted(() => es?.close())
</script>
