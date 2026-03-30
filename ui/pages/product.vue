<template>
  <TwoPanelLayout>
    <template #left>
      <div class="border-line border-b px-5 py-5">
        <h1 class="text-sm font-semibold">
          Product of {{ projectName }}
        </h1>
        <p class="text-content-subtle mt-0.5 font-mono text-xs">
          {{ projectPath }}
        </p>
      </div>

      <!-- Progress bar -->
      <div
        v-if="progress.expected > 0"
        class="border-line border-b px-5 py-3"
      >
        <div
          class="text-content-subtle flex items-center justify-between text-xs"
        >
          <span>{{ progress.present }}/{{ progress.expected }} artifacts</span>
        </div>
        <div class="mt-1.5 flex gap-0.5">
          <div
            v-for="artifact in artifacts"
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
              : 'hover:bg-surface-hover',
            artifact.presence === 'missing' ? 'opacity-50' : '',
          ]"
          @click="selected = artifact.key"
        >
          <UIcon
            :name="artifact.icon"
            class="text-content-subtle size-4 flex-shrink-0"
          />
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium">
              {{ artifact.name }}
            </div>
            <div class="text-content-subtle mt-0.5 truncate font-mono text-xs">
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
            v-else
            :label="artifact.status"
            :color="artifact.status === 'reviewed' ? 'success' : 'warning'"
            variant="subtle"
            size="xs"
          />
        </button>
      </div>
    </template>

    <!-- Right panel: content -->
    <ProductArtifactDetail :artifact="currentArtifact" />
  </TwoPanelLayout>
</template>

<script setup lang="ts">
import type { ProductResponse } from '~/server/api/product.get'

const { name: projectName, path: projectPath } = useProjectConfig()
const { data: response, refresh } =
  await useFetch<ProductResponse>('/api/product')

const artifacts = computed(() => response.value?.artifacts ?? [])
const progress = computed(
  () => response.value?.progress ?? { expected: 0, present: 0, reviewed: 0 }
)

const selected = ref(artifacts.value?.[0]?.key ?? 'product')
const currentArtifact = computed(() =>
  artifacts.value.find((a) => a.key === selected.value)
)

function progressBarClass(artifact: { presence: string; status: string }) {
  if (artifact.presence === 'missing') return 'bg-surface-sunken'
  if (artifact.status === 'reviewed') return 'bg-status-success'
  return 'bg-status-warning'
}

// Live reload when product files change
useWatchSSE(() => refresh())
</script>
