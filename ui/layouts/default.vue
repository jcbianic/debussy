<template>
  <div class="flex h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased">

    <!-- Sidebar -->
    <aside class="w-60 flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800">

      <!-- Project header -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="size-2 rounded-full bg-green-500 flex-shrink-0" />
          <div class="min-w-0">
            <div class="text-sm font-semibold truncate leading-tight">debussy</div>
            <div class="text-xs text-neutral-400 dark:text-neutral-500 truncate leading-tight font-mono">~/Projets/Libon-Data/debussy</div>
          </div>
        </div>
        <UButton variant="ghost" color="neutral" size="xs" icon="i-heroicons-chevron-up-down" class="flex-shrink-0" />
      </div>

      <!-- Nav -->
      <div class="flex-1 overflow-y-auto">
        <div class="px-3 py-3 space-y-0.5">
          <NavItem to="/"            icon="i-heroicons-squares-2x2"          label="Overview" />
          <NavItem to="/product"     icon="i-heroicons-cube"                  label="Product" />
          <NavItem to="/roadmap"     icon="i-heroicons-flag"                  label="Roadmap" tag="1.0" />
          <NavItem to="/inbox"       icon="i-heroicons-inbox"                 label="Inbox" :badge="totalPending" />
          <NavItem to="/feature"     icon="i-heroicons-light-bulb"            label="Feature" />
          <NavItem to="/policy"      icon="i-heroicons-shield-check"          label="Policy" />
          <NavItem to="/architecture" icon="i-heroicons-building-library"     label="Architecture" />
        </div>

        <div class="mx-3 my-1 border-t border-neutral-200 dark:border-neutral-800" />

        <!-- Lanes -->
        <div class="px-3 py-3">
          <div class="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-2 mb-1.5">
            Lanes
          </div>
          <div class="space-y-0.5">
            <NuxtLink
              v-for="lane in lanes"
              :key="lane.id"
              :to="`/lane/${lane.id}`"
              class="group flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
              :class="route.path.startsWith(`/lane/${lane.id}`) ? 'bg-neutral-100 dark:bg-neutral-900' : ''"
            >
              <div
                class="flex-shrink-0 size-2 rounded-full"
                :class="lane.isActive ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'"
              />
              <div class="flex-1 min-w-0">
                <div
                  class="truncate font-mono text-xs leading-tight"
                  :class="lane.isActive ? 'text-neutral-900 dark:text-neutral-100 font-medium' : 'text-neutral-600 dark:text-neutral-400'"
                >
                  {{ lane.branch }}
                </div>
              </div>
              <div class="flex-shrink-0 flex items-center gap-1">
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
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Stage this lane"
                  @click.prevent
                />
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="px-3 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <NuxtLink
          to="/setup"
          class="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors"
          :class="route.path === '/setup'
            ? 'text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900'
            : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'"
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
    <main class="flex-1 min-h-0 overflow-hidden">
      <slot />
    </main>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const toggleColorMode = () => { colorMode.preference = isDark.value ? 'light' : 'dark' }

const lanes = [
  { id: 'root',        branch: 'feat/42-unified-ui', isActive: true,  pending: 3 },
  { id: 'wt-feedback', branch: 'feat/feedback-ui',   isActive: false, pending: 2 },
  { id: 'wt-workflow', branch: 'feat/workflow-mon',  isActive: false, pending: 0 },
  { id: 'wt-fix',      branch: 'fix/review-server',  isActive: false, pending: 1 },
]

const totalPending = computed(() => lanes.reduce((s, l) => s + l.pending, 0))
</script>
