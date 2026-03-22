<template>
  <div class="px-8 py-8">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-xl font-semibold">Overview of debussy</h1>
      <p class="text-content-subtle mt-1 font-mono text-sm">
        ~/Projets/Libon-Data/debussy
      </p>
    </div>

    <div class="space-y-4">
      <!-- Row 1: Product + Roadmap -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Product -->
        <div class="border-line overflow-hidden rounded-lg border">
          <div
            class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
          >
            <h2 class="flex items-center gap-2 text-sm font-semibold">
              <UIcon
                name="i-heroicons-cube"
                class="text-content-faint size-4"
              />
              Product of debussy
            </h2>
            <NuxtLink
              to="/product"
              class="text-content-faint hover:text-content text-xs transition-colors"
              >Explore →</NuxtLink
            >
          </div>
          <div class="bg-surface p-5">
            <div class="mb-4 grid grid-cols-3 gap-2">
              <NuxtLink
                v-for="artifact in artifacts"
                :key="artifact.key"
                to="/product"
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
                <div class="text-xs font-medium">{{ artifact.name }}</div>
              </NuxtLink>
            </div>
            <p class="text-content-faint line-clamp-2 text-xs leading-relaxed">
              Debussy is a Claude Code plugin for solo builders — structured
              review workflows, product visibility, and parallel lane
              management.
            </p>
          </div>
        </div>

        <!-- Roadmap -->
        <div class="border-line overflow-hidden rounded-lg border">
          <div
            class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
          >
            <h2 class="flex items-center gap-2 text-sm font-semibold">
              <UIcon
                name="i-heroicons-flag"
                class="text-content-faint size-4"
              />
              Roadmap of debussy
            </h2>
            <NuxtLink
              to="/roadmap"
              class="text-content-faint hover:text-content text-xs transition-colors"
              >Full roadmap →</NuxtLink
            >
          </div>
          <div class="bg-surface">
            <div class="border-line-subtle border-b px-5 py-2.5">
              <span class="text-content-subtle text-xs font-medium"
                >Release 1.0 — Foundation</span
              >
            </div>
            <div
              v-for="(intent, i) in nextRelease"
              :key="intent.id"
              class="flex items-center gap-3 px-5 py-2.5"
              :class="
                i < nextRelease.length - 1 ? 'border-line-subtle border-b' : ''
              "
            >
              <UIcon
                :name="stateIcon(intent.state)"
                class="size-3.5 flex-shrink-0"
                :class="stateIconColor(intent.state)"
              />
              <span
                class="text-content-faint w-7 flex-shrink-0 font-mono text-xs"
                >{{ intent.id }}</span
              >
              <span
                class="flex-1 truncate text-xs"
                :class="
                  intent.state === 'done'
                    ? 'text-content-faint line-through'
                    : 'text-content-secondary'
                "
                >{{ intent.title }}</span
              >
              <span
                v-if="intent.lane"
                class="text-status-active max-w-24 truncate font-mono text-xs"
                >{{ intent.lane }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Inbox + Lanes -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Inbox -->
        <div class="border-line overflow-hidden rounded-lg border">
          <div
            class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
          >
            <h2 class="flex items-center gap-2 text-sm font-semibold">
              <UIcon
                name="i-heroicons-inbox"
                class="text-content-faint size-4"
              />
              Inbox
            </h2>
            <NuxtLink
              to="/inbox"
              class="text-content-faint hover:text-content text-xs transition-colors"
              >View all →</NuxtLink
            >
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
                >{{ lane.branch }}</span
              >
              <UBadge
                :label="`${lane.pending} pending`"
                color="warning"
                variant="subtle"
                size="xs"
              />
            </div>
            <div class="border-line-subtle border-t px-5 py-3">
              <span class="text-content-faint text-xs"
                >6 total across 3 lanes</span
              >
            </div>
          </div>
        </div>

        <!-- Lanes -->
        <div class="border-line overflow-hidden rounded-lg border">
          <div
            class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
          >
            <h2 class="flex items-center gap-2 text-sm font-semibold">
              <UIcon
                name="i-heroicons-rectangle-stack"
                class="text-content-faint size-4"
              />
              Lanes
            </h2>
            <span class="text-content-faint text-xs">4 active</span>
          </div>
          <div class="bg-surface">
            <NuxtLink
              v-for="(lane, i) in lanes"
              :key="lane.id"
              :to="`/lane/${lane.id}`"
              class="hover:bg-surface-hover-subtle flex items-center gap-3 px-5 py-3 transition-colors"
              :class="i < lanes.length - 1 ? 'border-line-subtle border-b' : ''"
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

      <!-- Row 3: Claude Setup (full-width compact) -->
      <div class="border-line overflow-hidden rounded-lg border">
        <div
          class="border-line-subtle bg-surface flex items-center justify-between border-b px-5 py-4"
        >
          <h2 class="flex items-center gap-2 text-sm font-semibold">
            <UIcon
              name="i-heroicons-cpu-chip"
              class="text-content-faint size-4"
            />
            Claude Setup
          </h2>
          <div class="flex items-center gap-3">
            <UBadge
              label="No conflicts"
              color="success"
              variant="subtle"
              size="xs"
            />
            <NuxtLink
              to="/setup"
              class="text-content-faint hover:text-content text-xs transition-colors"
              >Details →</NuxtLink
            >
          </div>
        </div>
        <div class="bg-surface flex items-center gap-8 px-5 py-4">
          <div
            v-for="stat in claudeStats"
            :key="stat.label"
            class="flex items-baseline gap-2"
          >
            <span class="text-xl font-semibold tabular-nums">{{
              stat.value
            }}</span>
            <span class="text-content-faint text-xs">{{ stat.label }}</span>
          </div>
          <div class="flex flex-1 flex-wrap items-center gap-2">
            <UBadge
              v-for="item in claudeItems"
              :key="item.name"
              :label="item.name"
              color="neutral"
              variant="subtle"
              size="xs"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { lanes, lanesWithPending: allLanesWithPending } = useMockData()
const { nextRelease, artifacts, claudeStats, claudeItems } = useDashboard()

const lanesWithPending = computed(() =>
  allLanesWithPending.value.filter((l) => l.pending > 0)
)
</script>
