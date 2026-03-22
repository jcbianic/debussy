<template>
  <Transition name="slide">
    <div
      v-if="intent"
      class="border-line bg-surface flex w-96 flex-shrink-0 flex-col overflow-auto border-l"
    >
      <div
        class="border-line flex flex-shrink-0 items-center justify-between border-b px-6 py-4"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="stateIcon(intent.state)"
            class="size-4"
            :class="stateIconColor(intent.state)"
          />
          <span class="font-mono text-xs text-neutral-400">{{
            intent.id
          }}</span>
        </div>
        <button
          class="text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
          @click="emit('close')"
        >
          <UIcon name="i-heroicons-x-mark" class="size-4" />
        </button>
      </div>

      <div class="flex-1 space-y-6 overflow-auto px-6 py-6">
        <div>
          <h2 class="mb-1 text-base leading-snug font-semibold">
            {{ intent.title }}
          </h2>
          <p class="text-xs text-neutral-400">{{ intent.addresses }}</p>
        </div>

        <div
          v-if="intent.description"
          class="text-content-muted text-sm leading-relaxed"
        >
          {{ intent.description }}
        </div>

        <div v-if="intent.doneWhen">
          <div
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase"
          >
            Done when
          </div>
          <p class="text-content-muted text-sm leading-relaxed">
            {{ intent.doneWhen }}
          </p>
        </div>

        <div class="space-y-2.5">
          <div v-if="intent.priority" class="flex items-center justify-between">
            <span class="text-xs text-neutral-400">Priority</span>
            <UBadge
              :label="intent.priority"
              :color="
                intent.priority === 'now' || intent.priority === 'next'
                  ? 'primary'
                  : 'neutral'
              "
              variant="subtle"
              size="xs"
            />
          </div>
          <div v-if="intent.lane" class="flex items-center justify-between">
            <span class="text-xs text-neutral-400">Lane</span>
            <NuxtLink
              :to="`/lane/${intent.laneId}`"
              class="font-mono text-xs text-blue-500 hover:underline"
              >{{ intent.lane }}</NuxtLink
            >
          </div>
          <div v-if="intent.issue" class="flex items-center justify-between">
            <span class="text-xs text-neutral-400">GitHub Issue</span>
            <a
              :href="`https://github.com/jcbianic/debussy/issues/${intent.issue}`"
              class="font-mono text-xs text-blue-500 hover:underline"
              >#{{ intent.issue }}</a
            >
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <UButton
            label="Open in GitHub"
            icon="i-heroicons-arrow-top-right-on-square"
            size="sm"
            color="neutral"
            variant="outline"
            block
          />
          <UButton
            label="Move to lane"
            icon="i-heroicons-arrow-right"
            size="sm"
            color="primary"
            variant="outline"
            block
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Intent } from '~/composables/useRoadmap'

defineProps<{ intent: Intent | null }>()
const emit = defineEmits<{ close: [] }>()
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(24px);
  opacity: 0;
}
</style>
