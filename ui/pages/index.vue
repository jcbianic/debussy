<template>
  <div class="px-8 py-8">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-xl font-semibold">
        Overview of {{ projectName }}
      </h1>
      <p class="text-content-subtle mt-1 font-mono text-sm">
        {{ projectPath }}
      </p>
    </div>

    <div class="space-y-8">
      <!-- ═══ Strategy — Shape what to build ═══ -->
      <section>
        <div class="mb-3 flex items-center gap-2">
          <h2
            class="text-content-subtle text-xs font-semibold tracking-wider uppercase"
          >
            Strategy
          </h2>
          <span class="text-content-faint text-xs">Shape what to build</span>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <!-- Strategy -->
          <div
            v-if="isStrateEnabled('strategy')"
            class="border-line overflow-hidden rounded-lg border"
          >
            <div
              class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
            >
              <h3 class="flex items-center gap-2 text-sm font-semibold">
                <UIcon
                  name="i-heroicons-eye"
                  class="text-content-faint size-4"
                />
                Strategy
              </h3>
              <NuxtLink
                to="/strategy"
                class="text-content-faint hover:text-content text-xs transition-colors"
              >
                Explore →
              </NuxtLink>
            </div>
            <div class="bg-surface p-5">
              <div class="mb-3 grid grid-cols-3 gap-2">
                <NuxtLink
                  v-for="artifact in artifacts"
                  :key="artifact.key"
                  to="/strategy"
                  class="border-line-subtle hover:border-line rounded-md border p-3 transition-colors"
                >
                  <div class="mb-2 flex items-start justify-between">
                    <UIcon
                      :name="artifact.icon"
                      class="text-content-faint size-3.5"
                    />
                    <UBadge
                      :label="artifact.status"
                      :color="
                        artifact.status === 'reviewed' ? 'success' : 'warning'
                      "
                      variant="subtle"
                      size="xs"
                    />
                  </div>
                  <div class="text-xs font-medium">
                    {{ artifact.name }}
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Feature Space -->
          <div
            v-if="isStrateEnabled('strategy')"
            class="border-line overflow-hidden rounded-lg border"
          >
            <div
              class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
            >
              <h3 class="flex items-center gap-2 text-sm font-semibold">
                <UIcon
                  name="i-heroicons-light-bulb"
                  class="text-content-faint size-4"
                />
                Feature Space
              </h3>
              <NuxtLink
                to="/feature"
                class="text-content-faint hover:text-content text-xs transition-colors"
              >
                Explore →
              </NuxtLink>
            </div>
            <div class="bg-surface p-5">
              <div class="space-y-2">
                <div
                  v-for="cat in featureCategories"
                  :key="cat.key"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <UIcon
                      :name="cat.icon"
                      class="size-3.5"
                      :class="cat.color"
                    />
                    <span class="text-content-secondary text-xs">{{
                      cat.name
                    }}</span>
                  </div>
                  <span class="text-content-faint font-mono text-xs">{{
                    cat.count
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Roadmap -->
          <div
            v-if="isStrateEnabled('strategy')"
            class="border-line overflow-hidden rounded-lg border"
          >
            <div
              class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
            >
              <h3 class="flex items-center gap-2 text-sm font-semibold">
                <UIcon
                  name="i-heroicons-flag"
                  class="text-content-faint size-4"
                />
                Roadmap
              </h3>
              <NuxtLink
                to="/roadmap"
                class="text-content-faint hover:text-content text-xs transition-colors"
              >
                Full roadmap →
              </NuxtLink>
            </div>
            <div class="bg-surface">
              <div class="border-line-subtle border-b px-5 py-2.5">
                <span class="text-content-subtle text-xs font-medium">{{
                  nextReleaseName
                }}</span>
              </div>
              <div
                v-for="(intent, i) in nextRelease"
                :key="intent.id"
                class="flex items-center gap-3 px-5 py-2.5"
                :class="
                  i < nextRelease.length - 1
                    ? 'border-line-subtle border-b'
                    : ''
                "
              >
                <UIcon
                  :name="stateIcon(intent.state)"
                  class="size-3.5 flex-shrink-0"
                  :class="stateIconColor(intent.state)"
                />
                <span
                  class="text-content-faint w-7 flex-shrink-0 font-mono text-xs"
                >{{ intent.id }}</span>
                <span
                  class="flex-1 truncate text-xs"
                  :class="
                    intent.state === 'done'
                      ? 'text-content-faint line-through'
                      : 'text-content-secondary'
                  "
                >{{ intent.title }}</span>
                <span
                  v-if="intent.lane"
                  class="text-status-active max-w-24 truncate font-mono text-xs"
                >{{ intent.lane }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ Execution — How to build it ═══ -->
      <section v-if="isStrateEnabled('engineering')">
        <div class="mb-3 flex items-center gap-2">
          <h2
            class="text-content-subtle text-xs font-semibold tracking-wider uppercase"
          >
            Engineering
          </h2>
          <span class="text-content-faint text-xs">How to build it</span>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <!-- Policy -->
          <div
            v-if="isStrateEnabled('engineering')"
            class="border-line overflow-hidden rounded-lg border"
          >
            <div
              class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
            >
              <h3 class="flex items-center gap-2 text-sm font-semibold">
                <UIcon
                  name="i-heroicons-shield-check"
                  class="text-content-faint size-4"
                />
                Policy
              </h3>
              <NuxtLink
                to="/policy"
                class="text-content-faint hover:text-content text-xs transition-colors"
              >
                Details →
              </NuxtLink>
            </div>
            <div class="bg-surface p-5">
              <div class="space-y-2">
                <div
                  v-for="topic in policyTopics"
                  :key="topic.key"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <UIcon
                      :name="topic.icon"
                      class="text-content-faint size-3.5"
                    />
                    <span class="text-content-secondary text-xs">{{
                      topic.name
                    }}</span>
                  </div>
                  <UBadge
                    :label="topic.status ?? 'draft'"
                    :color="topic.status === 'defined' ? 'success' : 'warning'"
                    variant="subtle"
                    size="xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Architecture -->
          <div
            v-if="isStrateEnabled('engineering')"
            class="border-line overflow-hidden rounded-lg border"
          >
            <div
              class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
            >
              <h3 class="flex items-center gap-2 text-sm font-semibold">
                <UIcon
                  name="i-heroicons-building-library"
                  class="text-content-faint size-4"
                />
                Architecture
              </h3>
              <NuxtLink
                to="/architecture"
                class="text-content-faint hover:text-content text-xs transition-colors"
              >
                Details →
              </NuxtLink>
            </div>
            <div class="bg-surface p-5">
              <div class="flex items-center gap-6">
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-semibold tabular-nums">{{
                    principles.length
                  }}</span>
                  <span class="text-content-faint text-xs">principles</span>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-semibold tabular-nums">{{
                    adrs.length
                  }}</span>
                  <span class="text-content-faint text-xs">ADRs</span>
                </div>
                <UBadge
                  v-if="proposedCount > 0"
                  :label="`${proposedCount} proposed`"
                  color="warning"
                  variant="subtle"
                  size="xs"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ Current Work — What's in progress ═══ -->
      <section>
        <div class="mb-3 flex items-center gap-2">
          <h2
            class="text-content-subtle text-xs font-semibold tracking-wider uppercase"
          >
            Current Work
          </h2>
          <span class="text-content-faint text-xs">What's in progress</span>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <!-- Inbox -->
          <div class="border-line overflow-hidden rounded-lg border">
            <div
              class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
            >
              <h3 class="flex items-center gap-2 text-sm font-semibold">
                <UIcon
                  name="i-heroicons-inbox"
                  class="text-content-faint size-4"
                />
                Inbox
              </h3>
              <NuxtLink
                to="/inbox"
                class="text-content-faint hover:text-content text-xs transition-colors"
              >
                View all →
              </NuxtLink>
            </div>
            <div class="bg-surface">
              <div
                v-for="(lane, i) in lanesWithPending"
                :key="lane.id"
                class="flex items-center gap-3 px-5 py-3"
                :class="
                  i < lanesWithPending.length - 1
                    ? 'border-line-subtle border-b'
                    : ''
                "
              >
                <div
                  class="size-1.5 flex-shrink-0 rounded-full"
                  :class="
                    lane.isActive ? 'bg-status-active' : 'bg-status-inactive'
                  "
                />
                <span
                  class="text-content-muted flex-1 truncate font-mono text-xs"
                >{{ lane.branch }}</span>
                <UBadge
                  :label="`${lane.pending} pending`"
                  color="warning"
                  variant="subtle"
                  size="xs"
                />
              </div>
              <div class="border-line-subtle border-t px-5 py-3">
                <span class="text-content-faint text-xs">{{ totalPending }} total across
                  {{ lanesWithPending.length }} lanes</span>
              </div>
            </div>
          </div>

          <!-- Lanes -->
          <div class="border-line overflow-hidden rounded-lg border">
            <div
              class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
            >
              <h3 class="flex items-center gap-2 text-sm font-semibold">
                <UIcon
                  name="i-heroicons-rectangle-stack"
                  class="text-content-faint size-4"
                />
                Lanes
              </h3>
              <span class="text-content-faint text-xs">{{ activeLaneCount }} active</span>
            </div>
            <div class="bg-surface">
              <NuxtLink
                v-for="(lane, i) in lanes"
                :key="lane.id"
                :to="`/lane/${lane.id}`"
                class="hover:bg-surface-hover-subtle flex items-center gap-3 px-5 py-3 transition-colors"
                :class="
                  i < lanes.length - 1 ? 'border-line-subtle border-b' : ''
                "
              >
                <div
                  class="size-1.5 flex-shrink-0 rounded-full"
                  :class="
                    lane.isActive ? 'bg-status-active' : 'bg-status-inactive'
                  "
                />
                <div class="min-w-0 flex-1">
                  <div
                    class="truncate font-mono text-xs"
                    :class="
                      lane.isActive
                        ? 'text-content-secondary font-medium'
                        : 'text-content-muted'
                    "
                  >
                    {{ lane.branch }}
                  </div>
                  <div class="text-content-faint mt-0.5 text-xs">
                    {{ lane.intent }}
                  </div>
                </div>
                <UBadge
                  v-if="lane.isActive"
                  label="staged"
                  color="primary"
                  variant="subtle"
                  size="xs"
                />
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="text-content-placeholder size-3.5"
                />
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  name: projectName,
  path: projectPath,
  isStrateEnabled,
} = useProjectConfig()
const {
  lanes,
  lanesWithPending: allLanesWithPending,
  totalPending,
} = useLanes()
const { nextRelease, nextReleaseName, artifacts } = useDashboard()
const { principles, adrs, proposedCount } = useArchitecture()
const { topics: policyTopics } = usePolicy()

const featureCategories = categoryDefs.map((c) => ({
  key: c.key,
  name: c.name,
  icon: c.icon,
  color: c.color,
  count: c.features.length,
}))

const lanesWithPending = computed(() =>
  allLanesWithPending.value.filter((l) => l.pending > 0)
)
const activeLaneCount = computed(
  () => lanes.value.filter((l) => l.isActive).length
)
</script>
