<template>
  <TwoPanelLayout>
    <template #left>
      <div class="border-line border-b px-5 py-5">
        <h1 class="text-sm font-semibold">
          Strategy of {{ projectName }}
        </h1>
        <p class="mt-0.5 font-mono text-xs text-neutral-400">
          {{ projectPath }}
        </p>
      </div>

      <!-- Progress bar -->
      <div
        v-if="progress.expected > 0"
        class="border-line border-b px-5 py-3"
      >
        <div class="flex items-center justify-between text-xs text-neutral-400">
          <span v-if="depth">{{ depth }} depth</span>
          <span>{{ progress.present }}/{{ progress.expected }} artifacts</span>
        </div>
        <div class="mt-1.5 flex gap-0.5">
          <div
            v-for="artifact in expectedArtifacts"
            :key="artifact.key"
            class="h-1.5 flex-1 rounded-full"
            :class="progressBarClass(artifact)"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <button
          v-for="artifact in artifacts"
          :key="artifact.key"
          type="button"
          class="border-line-subtle flex w-full cursor-pointer items-center gap-3 border-b px-5 py-3 text-left transition-colors last:border-b-0"
          :class="[
            selected === artifact.key
              ? 'bg-surface-hover-subtle'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
            artifact.presence === 'missing' ? 'opacity-50' : '',
          ]"
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
            v-if="artifact.presence === 'missing'"
            label="missing"
            color="neutral"
            variant="subtle"
            size="xs"
          />
          <UBadge
            v-else-if="!artifact.expected"
            label="bonus"
            color="info"
            variant="subtle"
            size="xs"
          />
          <UBadge
            v-else
            :label="artifact.status"
            :color="artifact.status === 'reviewed' ? 'success' : 'warning'"
            variant="subtle"
            size="xs"
          />
        </button>
      </div>
      <div class="border-line border-t px-5 py-3 text-xs text-neutral-400">
        <template v-if="updatedAt">
          Last updated {{ updatedAt }}
        </template>
        <template v-else>
          No manifest &middot; showing discovered files
        </template>
      </div>
    </template>

    <!-- Right panel: content -->
    <StrategyArtifactDetail :artifact="currentArtifact" />
  </TwoPanelLayout>
</template>

<script setup lang="ts">
import type { Artifact, StrategyResponse } from '~/composables/useProduct'

const { name: projectName, path: projectPath } = useProjectConfig()
const { data: response, refresh } =
  await useFetch<StrategyResponse>('/api/strategy')

const artifacts = computed(() => response.value?.artifacts ?? [])
const depth = computed(() => response.value?.depth)
const updatedAt = computed(() => response.value?.updatedAt)
const progress = computed(
  () => response.value?.progress ?? { expected: 0, present: 0, reviewed: 0 }
)
const expectedArtifacts = computed(() =>
  artifacts.value.filter((a) => a.expected)
)

const selected = ref(artifacts.value?.[0]?.key ?? 'vision')
const currentArtifact = computed(() =>
  artifacts.value.find((a) => a.key === selected.value)
)

function progressBarClass(artifact: Artifact) {
  if (artifact.presence === 'missing')
    return 'bg-neutral-200 dark:bg-neutral-700'
  if (artifact.status === 'reviewed') return 'bg-green-500'
  return 'bg-amber-400'
}

// Live reload when markdown files change
let es: EventSource | null = null
onMounted(() => {
  es = new EventSource('/api/watch')
  es.onmessage = () => refresh()
})
onUnmounted(() => es?.close())
</script>
