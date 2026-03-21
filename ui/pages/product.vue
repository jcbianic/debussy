<template>
  <TwoPanelLayout>
    <template #left>
      <div class="border-line border-b px-5 py-5">
        <h1 class="text-sm font-semibold">Product of debussy</h1>
        <p class="mt-0.5 font-mono text-xs text-neutral-400">
          ~/Projets/Libon-Data/debussy
        </p>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="artifact in artifacts"
          :key="artifact.key"
          class="border-line-subtle flex cursor-pointer items-center gap-3 border-b px-5 py-3 transition-colors last:border-b-0"
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
            <div class="truncate text-sm font-medium">{{ artifact.name }}</div>
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
        </div>
      </div>
      <div class="border-line border-t px-5 py-3 text-xs text-neutral-400">
        Last run 2 days ago
      </div>
    </template>

    <!-- Right panel: content -->
    <div class="flex-1 overflow-auto px-8 py-8">
      <div v-if="currentArtifact">
        <div class="mb-8 flex items-start justify-between">
          <div>
            <h2 class="text-xl font-semibold">{{ currentArtifact.name }}</h2>
            <div class="mt-1.5 flex items-center gap-3">
              <span class="font-mono text-xs text-neutral-400">{{
                currentArtifact.file
              }}</span>
              <UBadge
                :label="currentArtifact.status"
                :color="
                  currentArtifact.status === 'reviewed' ? 'success' : 'warning'
                "
                variant="subtle"
                size="xs"
              />
            </div>
          </div>
          <UButton
            label="Request revision"
            icon="i-heroicons-pencil"
            size="sm"
            color="neutral"
            variant="outline"
          />
        </div>

        <div class="space-y-8">
          <div v-for="section in currentArtifact.sections" :key="section.title">
            <h3 class="text-content-secondary mb-3 text-sm font-semibold">
              {{ section.title }}
            </h3>
            <div class="text-content-muted space-y-3 text-sm leading-relaxed">
              <p v-for="(para, i) in section.content" :key="i">{{ para }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TwoPanelLayout>
</template>

<script setup lang="ts">
interface ArtifactSection {
  title: string
  content: string[]
}
interface Artifact {
  key: string
  name: string
  file: string
  icon: string
  status: 'reviewed' | 'draft'
  sections: ArtifactSection[]
}

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
