<template>
  <div class="flex-1 overflow-auto px-8 py-8">
    <div v-if="topic">
      <div class="mb-8 flex items-start justify-between">
        <div>
          <h2 class="text-xl font-semibold">
            {{ topic.name }}
          </h2>
          <p class="mt-1 text-sm text-neutral-400">
            {{ topic.description }}
          </p>
        </div>
        <UBadge
          v-if="topic.file"
          :label="topic.file"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </div>

      <div class="space-y-6">
        <div
          v-for="section in topic.sections"
          :key="section.title"
        >
          <h3 class="text-content-secondary mb-3 text-sm font-semibold">
            {{ section.title }}
          </h3>
          <div
            v-if="section.items"
            class="space-y-2"
          >
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
                <div class="text-sm font-medium">
                  {{ item.rule }}
                </div>
                <div
                  v-if="item.note"
                  class="mt-0.5 text-xs text-neutral-400"
                >
                  {{ item.note }}
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="section.content"
            class="text-content-muted space-y-2 text-sm leading-relaxed"
          >
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
import type { PolicyTopic } from '~/composables/usePolicy'

defineProps<{ topic: PolicyTopic | undefined }>()
</script>
