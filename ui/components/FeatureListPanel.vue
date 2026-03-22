<template>
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- Search bar -->
    <div
      class="border-line bg-surface flex flex-shrink-0 items-center gap-3 border-b px-6 py-4"
    >
      <div class="relative flex-1">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search features…"
          class="bg-surface-sunken w-full rounded-lg border-0 py-2 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600"
        />
        <button
          v-if="searchQuery"
          class="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          @click="searchQuery = ''"
        >
          <UIcon name="i-heroicons-x-mark" class="size-3.5" />
        </button>
      </div>
    </div>

    <!-- Content: feature list + optional detail panel -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Feature list -->
      <div
        class="overflow-auto py-5 transition-[width,padding]"
        :class="
          selectedFeature
            ? 'border-line w-96 flex-shrink-0 border-r px-4'
            : 'flex-1 px-6'
        "
      >
        <!-- Search results -->
        <div v-if="searchQuery">
          <div class="mb-3 text-xs text-neutral-400">
            {{ searchResults.length }} result{{
              searchResults.length === 1 ? '' : 's'
            }}
            for "{{ searchQuery }}"
          </div>
          <div class="space-y-2">
            <div
              v-for="f in searchResults"
              :key="f.name"
              class="cursor-pointer rounded-lg border transition-colors"
              :class="
                selectedFeature?.name === f.name
                  ? 'bg-surface-hover-subtle border-line-active'
                  : 'border-line bg-surface hover:border-neutral-300 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50'
              "
              @click="selectedFeature = f"
            >
              <div :class="selectedFeature ? 'p-3' : 'p-4'">
                <div class="mb-1 flex items-start justify-between gap-3">
                  <h3
                    class="text-sm font-semibold"
                    v-html="highlight(f.name, searchQuery)"
                  />
                  <div
                    class="flex flex-shrink-0 flex-wrap items-center justify-end gap-1"
                  >
                    <span
                      v-for="p in f.problems"
                      :key="p"
                      class="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
                      :class="problemBadgeClass(p)"
                      >{{ p }}</span
                    >
                    <span
                      class="inline-flex items-center rounded px-2 py-0.5 text-xs"
                      :class="domainBadgeClass(f.domain)"
                      >{{ domainMeta[f.domain]?.name }}</span
                    >
                  </div>
                </div>
                <p
                  v-if="!selectedFeature"
                  class="text-content-subtle text-sm leading-relaxed"
                  v-html="highlight(f.description, searchQuery)"
                />
              </div>
            </div>
          </div>
          <EmptyState
            v-if="searchResults.length === 0"
            variant="bare"
            icon="i-heroicons-magnifying-glass"
            :text="`No features match &quot;${searchQuery}&quot;`"
          />
        </div>

        <!-- Group view -->
        <div v-else-if="currentGroup">
          <div
            class="mb-4 flex items-center gap-2"
            :class="selectedFeature ? '' : 'mb-5'"
          >
            <UIcon
              :name="currentGroup.icon"
              :class="[
                selectedFeature ? 'size-4' : 'size-5',
                currentGroup.color,
              ]"
            />
            <div v-if="!selectedFeature">
              <h2 class="text-xl font-semibold">{{ currentGroup.name }}</h2>
              <p class="mt-0.5 text-sm text-neutral-400">
                {{ currentGroup.description }}
              </p>
            </div>
            <template v-else>
              <h2 class="text-sm font-semibold">{{ currentGroup.name }}</h2>
              <span class="text-xs text-neutral-400">{{
                currentGroup.count
              }}</span>
            </template>
          </div>
          <div class="space-y-2">
            <div
              v-for="f in currentGroup.features"
              :key="f.name"
              class="cursor-pointer rounded-lg border transition-colors"
              :class="
                selectedFeature?.name === f.name
                  ? 'bg-surface-hover-subtle border-line-active'
                  : 'border-line bg-surface hover:border-neutral-300 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50'
              "
              @click="selectedFeature = f"
            >
              <div :class="selectedFeature ? 'p-3' : 'p-4'">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-sm font-semibold">{{ f.name }}</h3>
                  <div
                    class="flex flex-shrink-0 flex-wrap items-center justify-end gap-1"
                  >
                    <span
                      v-for="p in f.problems"
                      :key="p"
                      class="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
                      :class="problemBadgeClass(p)"
                      :title="problemMeta[p]?.description"
                      >{{ p }}</span
                    >
                    <span
                      v-if="groupByMode !== 'domain'"
                      class="inline-flex items-center rounded px-2 py-0.5 text-xs"
                      :class="domainBadgeClass(f.domain)"
                      >{{ domainMeta[f.domain]?.name }}</span
                    >
                    <span
                      v-if="groupByMode !== 'type'"
                      class="inline-flex items-center rounded px-2 py-0.5 text-xs"
                      :class="typeBadgeClass(f.type)"
                      >{{ typeMeta[f.type]?.shortName }}</span
                    >
                    <UBadge
                      v-if="f.owner"
                      :label="f.owner"
                      color="primary"
                      variant="subtle"
                      size="xs"
                    />
                    <UBadge
                      v-if="f.tag"
                      :label="f.tag"
                      color="neutral"
                      variant="subtle"
                      size="xs"
                    />
                  </div>
                </div>
                <p
                  v-if="!selectedFeature"
                  class="text-content-subtle mt-2 text-sm leading-relaxed"
                >
                  {{ f.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail panel -->
      <div v-if="selectedFeature" class="flex-1 overflow-auto px-6 py-5">
        <!-- Header -->
        <div class="mb-4 flex items-start justify-between gap-4">
          <h2 class="text-base leading-tight font-semibold">
            {{ selectedFeature.name }}
          </h2>
          <button
            class="flex-shrink-0 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
            @click="selectedFeature = null"
          >
            <UIcon name="i-heroicons-x-mark" class="size-4" />
          </button>
        </div>

        <!-- All badges -->
        <div class="mb-5 flex flex-wrap gap-1.5">
          <span
            v-for="p in selectedFeature.problems"
            :key="p"
            class="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
            :class="problemBadgeClass(p)"
            :title="problemMeta[p]?.description"
            >{{ p }}</span
          >
          <span
            class="inline-flex items-center rounded px-2 py-0.5 text-xs"
            :class="domainBadgeClass(selectedFeature.domain)"
            >{{ domainMeta[selectedFeature.domain]?.name }}</span
          >
          <span
            class="inline-flex items-center rounded px-2 py-0.5 text-xs"
            :class="typeBadgeClass(selectedFeature.type)"
            >{{ typeMeta[selectedFeature.type]?.shortName }}</span
          >
          <UBadge
            v-if="selectedFeature.owner"
            :label="selectedFeature.owner"
            color="primary"
            variant="subtle"
            size="xs"
          />
          <UBadge
            v-if="selectedFeature.tag"
            :label="selectedFeature.tag"
            color="neutral"
            variant="subtle"
            size="xs"
          />
        </div>

        <!-- Problem cross-references -->
        <div v-if="selectedFeature.problems.length" class="mb-5">
          <div
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Addresses
          </div>
          <div class="space-y-2">
            <div
              v-for="p in selectedFeature.problems"
              :key="p"
              class="flex items-start gap-3 rounded-lg border p-3"
              :class="problemCardClass(p)"
            >
              <UIcon
                :name="problemMeta[p]?.icon"
                class="mt-0.5 size-4 flex-shrink-0"
                :class="problemMeta[p]?.color"
              />
              <div>
                <div class="text-xs font-semibold">
                  {{ problemMeta[p]?.name }}
                </div>
                <div class="text-content-subtle mt-0.5 text-xs">
                  {{ problemMeta[p]?.description }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-5">
          <div
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Description
          </div>
          <p class="text-content-muted text-sm leading-relaxed">
            {{ selectedFeature.description }}
          </p>
        </div>

        <!-- Breakdown items -->
        <div v-if="selectedFeature.items?.length" class="mb-5">
          <div
            class="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Breakdown
          </div>
          <ul class="space-y-2.5">
            <li
              v-for="item in selectedFeature.items"
              :key="item"
              class="text-content-muted flex items-start gap-2.5 text-sm"
            >
              <UIcon
                name="i-heroicons-chevron-right"
                class="mt-0.5 size-3.5 flex-shrink-0 text-neutral-400"
              />
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- Related features -->
        <div v-if="relatedFeatures.length" class="border-line border-t pt-4">
          <div
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Related
          </div>
          <div class="space-y-1">
            <div
              v-for="f in relatedFeatures"
              :key="f.name"
              class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
              @click="selectedFeature = f"
            >
              <span
                v-if="f.problems[0]"
                class="inline-flex flex-shrink-0 items-center rounded px-1.5 py-0.5 font-mono text-xs font-bold"
                :class="problemBadgeClass(f.problems[0])"
                >{{ f.problems[0] }}</span
              >
              <span v-else class="text-content-ghost flex-shrink-0 text-xs"
                >—</span
              >
              <span class="flex-1 truncate text-sm">{{ f.name }}</span>
              <span
                class="flex-shrink-0 text-xs"
                :class="domainMeta[f.domain]?.color"
                >{{ domainMeta[f.domain]?.name }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  domainMeta,
  problemMeta,
  typeMeta,
  problemBadgeClass,
  domainBadgeClass,
  typeBadgeClass,
  problemCardClass,
  highlight,
} from '~/composables/useFeatureSpace'
import type {
  EnrichedFeature,
  Group,
  GroupByMode,
} from '~/composables/useFeatureSpace'

const selectedFeature = defineModel<EnrichedFeature | null>('selectedFeature', {
  required: true,
})
const searchQuery = defineModel<string>('searchQuery', { required: true })

defineProps<{
  searchResults: EnrichedFeature[]
  currentGroup: Group | undefined
  relatedFeatures: EnrichedFeature[]
  groupByMode: GroupByMode
}>()
</script>
