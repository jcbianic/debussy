<template>
  <div class="bg-surface-page text-content flex h-screen">
    <!-- Sidebar -->
    <aside class="border-line flex w-60 flex-shrink-0 flex-col border-r">
      <!-- Project header -->
      <div
        class="border-line flex h-16 items-center justify-between border-b px-4"
      >
        <div class="flex min-w-0 items-center gap-2.5">
          <div class="size-2 flex-shrink-0 rounded-full bg-green-500" />
          <div class="min-w-0">
            <div class="truncate text-sm leading-tight font-semibold">
              debussy
            </div>
            <div
              class="text-content-faint truncate font-mono text-xs leading-tight"
            >
              ~/Projets/Libon-Data/debussy
            </div>
          </div>
        </div>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          icon="i-heroicons-chevron-up-down"
          class="flex-shrink-0"
        />
      </div>

      <!-- Nav -->
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-0.5 px-3 py-3">
          <NavItem to="/" icon="i-heroicons-squares-2x2" label="Overview" />
          <NavItem to="/product" icon="i-heroicons-cube" label="Product" />
          <NavItem
            to="/roadmap"
            icon="i-heroicons-flag"
            label="Roadmap"
            tag="1.0"
          />
          <NavItem
            to="/inbox"
            icon="i-heroicons-inbox"
            label="Inbox"
            :badge="totalPending"
          />
          <NavItem
            to="/feature"
            icon="i-heroicons-light-bulb"
            label="Feature"
          />
          <NavItem
            to="/policy"
            icon="i-heroicons-shield-check"
            label="Policy"
          />
          <NavItem
            to="/architecture"
            icon="i-heroicons-building-library"
            label="Architecture"
          />
        </div>

        <div class="border-line mx-3 my-1 border-t" />

        <!-- Lanes -->
        <div class="px-3 py-3">
          <div
            class="text-content-faint mb-1.5 px-2 text-xs font-medium tracking-wider uppercase"
          >
            Lanes
          </div>
          <div class="space-y-0.5">
            <NuxtLink
              v-for="lane in lanesWithPending"
              :key="lane.id"
              :to="`/lane/${lane.id}`"
              class="group hover:bg-surface-hover flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors"
              :class="
                route.path.startsWith(`/lane/${lane.id}`)
                  ? 'bg-surface-hover'
                  : ''
              "
            >
              <div
                class="size-2 flex-shrink-0 rounded-full"
                :class="
                  lane.isActive ? 'bg-status-active' : 'bg-status-inactive'
                "
              />
              <div class="min-w-0 flex-1">
                <div
                  class="truncate font-mono text-xs leading-tight"
                  :class="
                    lane.isActive
                      ? 'text-content font-medium'
                      : 'text-content-muted'
                  "
                >
                  {{ lane.branch }}
                </div>
              </div>
              <div class="flex flex-shrink-0 items-center gap-1">
                <UBadge
                  v-if="lane.pending > 0"
                  :label="String(lane.pending)"
                  color="warning"
                  variant="subtle"
                  size="xs"
                />
                <UButton
                  v-if="!lane.isActive"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  icon="i-heroicons-arrow-up-tray"
                  class="opacity-0 transition-opacity group-hover:opacity-100"
                  title="Stage this lane"
                  @click.prevent
                />
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div
        class="border-line flex items-center justify-between border-t px-3 py-3"
      >
        <NuxtLink
          to="/setup"
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors"
          :class="
            route.path === '/setup'
              ? 'text-content-secondary bg-surface-hover'
              : 'text-content-faint hover:text-content'
          "
        >
          <UIcon name="i-heroicons-cpu-chip" class="size-3.5" />
          <span>Claude Setup</span>
        </NuxtLink>
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
          @click="toggleColorMode"
        />
      </div>
    </aside>

    <!-- Main -->
    <main class="min-h-0 flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const { lanesWithPending, totalPending } = useMockData()
</script>
