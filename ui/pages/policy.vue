<template>
  <TwoPanelLayout>
    <!-- Left panel -->
    <template #left>
      <div class="border-line border-b px-5 py-5">
        <h1 class="text-sm font-semibold">
          Policy of {{ projectName }}
        </h1>
        <p class="mt-0.5 font-mono text-xs text-neutral-400">
          {{ projectPath }}
        </p>
      </div>
      <div class="flex-1 overflow-y-auto">
        <button
          v-for="topic in topics"
          :key="topic.key"
          type="button"
          class="border-line-subtle flex w-full cursor-pointer items-center gap-3 border-b px-5 py-3 text-left transition-colors last:border-b-0"
          :class="
            selected === topic.key
              ? 'bg-surface-hover-subtle'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          "
          @click="selected = topic.key"
        >
          <UIcon
            :name="topic.icon"
            class="size-4 flex-shrink-0 text-neutral-400"
          />
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium">
              {{ topic.name }}
            </div>
            <div
              v-if="topic.file"
              class="mt-0.5 truncate font-mono text-xs text-neutral-400"
            >
              {{ topic.file }}
            </div>
          </div>
          <UBadge
            v-if="topic.status"
            :label="topic.status"
            :color="topic.status === 'defined' ? 'success' : 'warning'"
            variant="subtle"
            size="xs"
          />
        </button>
      </div>
    </template>

    <!-- Right panel -->
    <PolicyTopicDetail :topic="currentTopic" />
  </TwoPanelLayout>
</template>

<script setup lang="ts">
const { name: projectName, path: projectPath } = useProjectConfig()
const { topics, selected, currentTopic } = usePolicy()
</script>
