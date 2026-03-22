<template>
  <TwoPanelLayout>
    <!-- Left panel -->
    <template #left>
      <div class="border-line border-b px-5 py-5">
        <h1 class="text-sm font-semibold">Policy of debussy</h1>
        <p class="mt-0.5 font-mono text-xs text-neutral-400">
          ~/Projets/Libon-Data/debussy
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
            <div class="truncate text-sm font-medium">{{ topic.name }}</div>
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
    <div class="flex-1 overflow-auto px-8 py-8">
      <div v-if="currentTopic">
        <div class="mb-8 flex items-start justify-between">
          <div>
            <h2 class="text-xl font-semibold">{{ currentTopic.name }}</h2>
            <p class="mt-1 text-sm text-neutral-400">
              {{ currentTopic.description }}
            </p>
          </div>
          <UBadge
            v-if="currentTopic.file"
            :label="currentTopic.file"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </div>

        <div class="space-y-6">
          <div v-for="section in currentTopic.sections" :key="section.title">
            <h3 class="text-content-secondary mb-3 text-sm font-semibold">
              {{ section.title }}
            </h3>
            <div v-if="section.items" class="space-y-2">
              <div
                v-for="item in section.items"
                :key="item.rule"
                class="border-line-subtle bg-surface flex items-start gap-3 rounded-md border px-4 py-3"
              >
                <UIcon
                  name="i-heroicons-check-circle"
                  class="mt-0.5 size-4 flex-shrink-0 text-green-500"
                />
                <div>
                  <div class="text-sm font-medium">{{ item.rule }}</div>
                  <div v-if="item.note" class="mt-0.5 text-xs text-neutral-400">
                    {{ item.note }}
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="section.content"
              class="text-content-muted space-y-2 text-sm leading-relaxed"
            >
              <p v-for="(para, i) in section.content" :key="i">{{ para }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TwoPanelLayout>
</template>

<script setup lang="ts">
const { topics, selected, currentTopic } = usePolicy()
</script>
