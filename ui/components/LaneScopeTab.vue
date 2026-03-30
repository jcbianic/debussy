<template>
  <div class="px-8 py-6">
    <div
      v-if="content"
      class="prose-debussy"
      v-html="rendered"
    />
    <EmptyState
      v-else
      icon="i-heroicons-document-text"
      text="No scope defined for this lane"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ laneId: string }>()

const { data } = useFetch<{ content: string | null }>(
  () => `/api/lanes/${props.laneId}/scope`
)

const content = computed(() => data.value?.content ?? null)
const rendered = computed(() =>
  content.value ? renderMarkdown(content.value) : ''
)
</script>
