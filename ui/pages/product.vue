<template>
  <div class="flex h-full">

    <!-- Left panel: artifact list -->
    <div class="w-56 flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div class="px-5 py-5 border-b border-neutral-200 dark:border-neutral-800">
        <h1 class="text-sm font-semibold">Product of debussy</h1>
        <p class="mt-0.5 text-xs text-neutral-400 font-mono">~/Projets/Libon-Data/debussy</p>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="artifact in artifacts"
          :key="artifact.key"
          class="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
          :class="selected === artifact.key
            ? 'bg-neutral-50 dark:bg-neutral-800'
            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'"
          @click="selected = artifact.key"
        >
          <UIcon :name="artifact.icon" class="size-4 text-neutral-400 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ artifact.name }}</div>
            <div class="text-xs text-neutral-400 mt-0.5 font-mono truncate">{{ artifact.file }}</div>
          </div>
          <UBadge
            :label="artifact.status"
            :color="artifact.status === 'reviewed' ? 'success' : 'warning'"
            variant="subtle"
            size="xs"
          />
        </div>
      </div>
      <div class="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
        Last run 2 days ago
      </div>
    </div>

    <!-- Right panel: content -->
    <div class="flex-1 overflow-auto px-8 py-8">
      <div v-if="currentArtifact">

        <div class="flex items-start justify-between mb-8">
          <div>
            <h2 class="text-xl font-semibold">{{ currentArtifact.name }}</h2>
            <div class="flex items-center gap-3 mt-1.5">
              <span class="text-xs text-neutral-400 font-mono">{{ currentArtifact.file }}</span>
              <UBadge
                :label="currentArtifact.status"
                :color="currentArtifact.status === 'reviewed' ? 'success' : 'warning'"
                variant="subtle"
                size="xs"
              />
            </div>
          </div>
          <UButton label="Request revision" icon="i-heroicons-pencil" size="sm" color="neutral" variant="outline" />
        </div>

        <div class="space-y-8">
          <div v-for="section in currentArtifact.sections" :key="section.title">
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">{{ section.title }}</h3>
            <div class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-3">
              <p v-for="(para, i) in section.content" :key="i">{{ para }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
interface ArtifactSection { title: string; content: string[] }
interface Artifact { key: string; name: string; file: string; icon: string; status: 'reviewed' | 'draft'; sections: ArtifactSection[] }

const { data: artifacts, refresh } = await useFetch<Artifact[]>('/api/strategy')

const selected = ref(artifacts.value?.[0]?.key ?? 'vision')
const currentArtifact = computed(() => artifacts.value?.find(a => a.key === selected.value))

// Live reload when markdown files change
let es: EventSource | null = null
onMounted(() => {
  es = new EventSource('/api/watch')
  es.onmessage = () => refresh()
})
onUnmounted(() => es?.close())
</script>
