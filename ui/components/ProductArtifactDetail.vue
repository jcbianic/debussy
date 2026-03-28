<template>
  <div class="flex-1 overflow-auto px-8 py-8">
    <div
      v-if="artifact && artifact.presence === 'missing'"
      class="flex flex-col items-center justify-center py-20"
    >
      <UIcon
        name="i-heroicons-document-plus"
        class="text-content-muted size-10"
      />
      <h3 class="text-content-secondary mt-3 text-sm font-medium">
        Not yet generated
      </h3>
      <p class="text-content-muted mt-1 text-xs">
        Run <code class="bg-surface rounded px-1 py-0.5">/product</code> to
        generate this artifact.
      </p>
    </div>

    <div v-else-if="artifact">
      <div class="mb-8 flex items-start justify-between">
        <div>
          <h2 class="text-xl font-semibold">
            {{ artifact.name }}
          </h2>
          <div class="mt-1.5 flex items-center gap-3">
            <span class="text-content-subtle font-mono text-xs">{{
              artifact.file
            }}</span>
            <UBadge
              :label="artifact.status"
              :color="artifact.status === 'reviewed' ? 'success' : 'warning'"
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
        <div
          v-for="section in artifact.sections"
          :key="section.title"
        >
          <h3 class="text-content-secondary mb-3 text-sm font-semibold">
            {{ section.title }}
          </h3>
          <div class="text-content-muted space-y-3 text-sm leading-relaxed">
            <p
              v-for="(para, i) in section.content"
              :key="i"
            >
              {{ para }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProductArtifact {
  key: string
  name: string
  file: string
  icon: string
  status: 'draft' | 'reviewed'
  presence: 'present' | 'missing'
  sections: { title: string; content: string[] }[]
}

defineProps<{ artifact: ProductArtifact | undefined }>()
</script>
