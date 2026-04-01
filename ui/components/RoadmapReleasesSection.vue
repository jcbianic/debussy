<template>
  <div class="space-y-6">
    <div
      v-for="release in visibleReleases"
      :key="release.id"
    >
      <!-- Release header -->
      <button
        type="button"
        class="group flex w-full items-center gap-3"
        @click="emit('toggleCollapse', release.id)"
      >
        <UIcon
          :name="
            collapsed.has(release.id)
              ? 'i-heroicons-chevron-right'
              : 'i-heroicons-chevron-down'
          "
          class="size-3.5 flex-shrink-0 text-neutral-400 transition-transform"
        />
        <span class="text-sm font-semibold">{{ release.name }}</span>
        <span class="text-sm text-neutral-400">—</span>
        <span class="text-sm text-neutral-500">{{ release.theme }}</span>
        <div class="bg-line h-px flex-1" />
        <span class="text-xs text-neutral-400">{{ meaningfulCount(release) }} intents</span>
        <UBadge
          :label="releaseStatus(release)"
          :color="releaseStatusColor(release)"
          variant="subtle"
          size="xs"
        />
      </button>

      <!-- Intents (collapsible) -->
      <div
        v-if="!collapsed.has(release.id)"
        class="border-line overflow-hidden rounded-lg border"
      >
        <div
          v-for="(intent, i) in release.intents"
          :key="intent.id"
          role="button"
          tabindex="0"
          class="group/row bg-surface flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          :class="[
            i < release.intents.length - 1 ? 'border-line-subtle border-b' : '',
            intent.state === 'out-of-scope' ? 'opacity-40' : '',
            selectedIntent?.id === intent.id &&
              selectedIntent?.title === intent.title
              ? 'bg-surface-hover-subtle/50'
              : '',
          ]"
          @click="toggleIntent(intent)"
          @keydown.enter.prevent="toggleIntent(intent)"
          @keydown.space.prevent="toggleIntent(intent)"
        >
          <UIcon
            :name="stateIcon(intent.state)"
            class="size-4 flex-shrink-0"
            :class="stateIconColor(intent.state)"
          />
          <span class="w-8 flex-shrink-0 font-mono text-xs text-neutral-400">{{
            intent.id
          }}</span>
          <div class="min-w-0 flex-1">
            <div
              class="text-sm"
              :class="
                intent.state === 'done'
                  ? 'text-neutral-400 line-through'
                  : 'text-content-strong'
              "
            >
              {{ intent.title }}
            </div>
            <div class="mt-0.5 text-xs text-neutral-400">
              {{ intent.addresses }}
            </div>
          </div>

          <NuxtLink
            v-if="intent.lane"
            :to="`/lane/${encodeURIComponent(intent.laneId)}`"
            class="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 font-mono text-xs text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50"
            @click.stop
          >
            <div class="size-1.5 rounded-full bg-blue-500" />
            {{ intent.lane }}
          </NuxtLink>

          <a
            v-if="intent.issue"
            :href="`${repoUrl}/issues/${intent.issue}`"
            class="font-mono text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
            @click.stop
          >#{{ intent.issue }}</a>

          <!-- Move to release (hover) -->
          <div class="opacity-0 transition-opacity group-hover/row:opacity-100">
            <select
              aria-label="Move to release"
              class="border-line-raised cursor-pointer rounded border bg-transparent px-1.5 py-0.5 text-xs text-neutral-400 transition-colors hover:border-neutral-400"
              :value="release.id"
              @change.stop="
                emit(
                  'moveIntent',
                  intent,
                  release,
                  ($event.target as HTMLSelectElement).value
                )
              "
              @click.stop
            >
              <option
                v-for="r in releases"
                :key="r.id"
                :value="r.id"
              >
                {{ r.name }}
              </option>
            </select>
          </div>

          <UBadge
            v-if="!intent.lane && intent.state !== 'in-progress'"
            :label="
              intent.state === 'out-of-scope' ? 'out of scope' : intent.state
            "
            :color="intent.state === 'done' ? 'success' : 'neutral'"
            variant="subtle"
            size="xs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Release, Intent } from '~/composables/useRoadmap'

const { repoUrl } = useProjectConfig()

const props = defineProps<{
  visibleReleases: Release[]
  releases: Release[]
  collapsed: Set<string>
  selectedIntent: Intent | null
}>()

const emit = defineEmits<{
  toggleCollapse: [id: string]
  'update:selectedIntent': [intent: Intent | null]
  moveIntent: [intent: Intent, release: Release, targetId: string]
}>()

const toggleIntent = (intent: Intent) => {
  emit(
    'update:selectedIntent',
    props.selectedIntent?.id === intent.id &&
      props.selectedIntent?.title === intent.title
      ? null
      : intent
  )
}
</script>
