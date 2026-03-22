<template>
  <div class="flex h-full">
    <!-- Main roadmap -->
    <div class="flex-1 overflow-auto px-8 py-8">
      <!-- Page header -->
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h1 class="text-xl font-semibold">Roadmap of debussy</h1>
          <p class="text-content-subtle mt-1 font-mono text-sm">
            ~/Projets/Libon-Data/debussy
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-3 text-xs text-neutral-400">
            <span class="flex items-center gap-1"
              ><UIcon
                name="i-heroicons-check-circle"
                class="size-3.5 text-green-500"
              />
              Merged</span
            >
            <span class="flex items-center gap-1"
              ><UIcon
                name="i-heroicons-arrow-path"
                class="size-3.5 text-blue-500"
              />
              In lane</span
            >
            <span class="flex items-center gap-1"
              ><UIcon
                name="i-heroicons-ellipsis-horizontal-circle"
                class="size-3.5 text-neutral-400"
              />
              Open</span
            >
            <span class="flex items-center gap-1"
              ><UIcon
                name="i-heroicons-minus-circle"
                class="text-content-ghost size-3.5"
              />
              Out of scope</span
            >
          </div>
          <UButton
            :label="syncing ? 'Syncing…' : 'Sync with GitHub'"
            icon="i-heroicons-arrow-path"
            :loading="syncing"
            size="sm"
            color="neutral"
            variant="outline"
            @click="triggerSync"
          />
        </div>
      </div>

      <!-- Summary bar -->
      <div
        class="border-line-raised bg-surface-tag mb-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border"
      >
        <!-- Past -->
        <button
          class="bg-surface flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/70"
          :class="
            activeFilter === 'shipped' ? 'ring-ring ring-1 ring-inset' : ''
          "
          @click="activeFilter = activeFilter === 'shipped' ? 'all' : 'shipped'"
        >
          <div
            class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
          >
            <UIcon
              name="i-heroicons-check"
              class="size-4 text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <div class="text-lg font-semibold tabular-nums">
              {{ shippedReleases.length }}
            </div>
            <div class="text-xs text-neutral-400">
              release{{ shippedReleases.length === 1 ? '' : 's' }} shipped
            </div>
            <div class="text-content-subtle mt-0.5 text-xs">
              {{ shippedReleases.map((r) => r.name).join(', ') }}
            </div>
          </div>
        </button>

        <!-- Current -->
        <div class="bg-surface px-5 py-4">
          <div v-if="currentRelease">
            <div class="mb-2 flex items-center gap-2">
              <span class="text-sm font-semibold">{{
                currentRelease.name
              }}</span>
              <UBadge
                label="in progress"
                color="primary"
                variant="subtle"
                size="xs"
              />
            </div>
            <div class="mb-3 text-xs text-neutral-400">
              {{ currentRelease.theme }} · {{ doneCount(currentRelease) }}/{{
                meaningfulCount(currentRelease)
              }}
              done
            </div>
            <!-- Progress segments -->
            <div class="flex gap-0.5">
              <div
                v-for="intent in currentRelease.intents.filter(
                  (i) => i.state !== 'out-of-scope'
                )"
                :key="intent.id"
                class="h-1.5 flex-1 rounded-full transition-colors"
                :class="{
                  'bg-green-500': intent.state === 'done',
                  'bg-blue-500': intent.state === 'in-progress',
                  'bg-surface-tag': intent.state === 'open',
                }"
                :title="intent.title"
              />
            </div>
          </div>
          <div v-else class="text-sm text-neutral-400">No active release</div>
        </div>

        <!-- Ahead -->
        <button
          class="bg-surface flex items-center justify-end gap-4 px-5 py-4 text-right transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/70"
          :class="
            activeFilter === 'planned' ? 'ring-ring ring-1 ring-inset' : ''
          "
          @click="activeFilter = activeFilter === 'planned' ? 'all' : 'planned'"
        >
          <div>
            <div class="text-lg font-semibold tabular-nums">
              {{ plannedReleases.length }}
            </div>
            <div class="text-xs text-neutral-400">
              release{{ plannedReleases.length === 1 ? '' : 's' }} planned
            </div>
            <div class="text-content-subtle mt-0.5 text-xs">
              {{ plannedReleases.map((r) => r.name).join(', ') }}
            </div>
          </div>
          <div
            class="bg-surface-sunken flex size-8 flex-shrink-0 items-center justify-center rounded-full"
          >
            <UIcon
              name="i-heroicons-arrow-right"
              class="size-4 text-neutral-400"
            />
          </div>
        </button>
      </div>

      <!-- Filter tabs -->
      <SegmentedControl
        v-model="activeFilter"
        :options="filterTabs"
        class="mb-6"
      />

      <!-- Releases -->
      <div class="space-y-6">
        <div v-for="release in visibleReleases" :key="release.id">
          <!-- Release header -->
          <div
            class="group flex cursor-pointer items-center gap-3"
            @click="toggleCollapse(release.id)"
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
            <span class="text-xs text-neutral-400"
              >{{ meaningfulCount(release) }} intents</span
            >
            <UBadge
              :label="releaseStatus(release)"
              :color="releaseStatusColor(release)"
              variant="subtle"
              size="xs"
            />
          </div>

          <!-- Intents (collapsible) -->
          <div
            v-if="!collapsed.has(release.id)"
            class="border-line overflow-hidden rounded-lg border"
          >
            <div
              v-for="(intent, i) in release.intents"
              :key="intent.id"
              class="group/row bg-surface flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              :class="[
                i < release.intents.length - 1
                  ? 'border-line-subtle border-b'
                  : '',
                intent.state === 'out-of-scope' ? 'opacity-40' : '',
                selectedIntent?.id === intent.id &&
                selectedIntent?.title === intent.title
                  ? 'bg-surface-hover-subtle/50'
                  : '',
              ]"
              @click="
                selectedIntent =
                  selectedIntent?.id === intent.id &&
                  selectedIntent?.title === intent.title
                    ? null
                    : intent
              "
            >
              <UIcon
                :name="stateIcon(intent.state)"
                class="size-4 flex-shrink-0"
                :class="stateIconColor(intent.state)"
              />
              <span
                class="w-8 flex-shrink-0 font-mono text-xs text-neutral-400"
                >{{ intent.id }}</span
              >
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
                :to="`/lane/${intent.laneId}`"
                class="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 font-mono text-xs text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50"
                @click.stop
              >
                <div class="size-1.5 rounded-full bg-blue-500" />
                {{ intent.lane }}
              </NuxtLink>

              <a
                v-if="intent.issue"
                :href="`https://github.com/jcbianic/debussy/issues/${intent.issue}`"
                class="font-mono text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
                @click.stop
                >#{{ intent.issue }}</a
              >

              <!-- Move to release (hover) -->
              <div
                class="opacity-0 transition-opacity group-hover/row:opacity-100"
              >
                <select
                  class="border-line-raised cursor-pointer rounded border bg-transparent px-1.5 py-0.5 text-xs text-neutral-400 transition-colors hover:border-neutral-400"
                  :value="release.id"
                  @change.stop="
                    moveIntent(
                      intent,
                      release,
                      ($event.target as HTMLSelectElement).value
                    )
                  "
                  @click.stop
                >
                  <option v-for="r in releases" :key="r.id" :value="r.id">
                    {{ r.name }}
                  </option>
                </select>
              </div>

              <UBadge
                v-if="!intent.lane && intent.state !== 'in-progress'"
                :label="
                  intent.state === 'out-of-scope'
                    ? 'out of scope'
                    : intent.state
                "
                :color="intent.state === 'done' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail side panel -->
    <IntentDetailPanel
      :intent="selectedIntent"
      @close="selectedIntent = null"
    />
  </div>
</template>

<script setup lang="ts">
const {
  releases,
  collapsed,
  toggleCollapse,
  releaseStatus,
  releaseStatusColor,
  doneCount,
  meaningfulCount,
  shippedReleases,
  currentRelease,
  plannedReleases,
  activeFilter,
  filterTabs,
  visibleReleases,
  selectedIntent,
  syncing,
  triggerSync,
  moveIntent,
} = useRoadmap()
</script>
