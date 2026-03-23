<template>
  <aside class="border-line flex w-60 flex-shrink-0 flex-col border-r">
    <!-- Project header -->
    <div
      class="border-line flex h-16 items-center justify-between border-b px-4"
    >
      <div class="flex min-w-0 items-center gap-2.5">
        <div class="size-2 flex-shrink-0 rounded-full bg-green-500" />
        <div class="min-w-0">
          <div class="truncate text-sm leading-tight font-semibold">
            {{ projectName }}
          </div>
          <div
            class="text-content-faint truncate font-mono text-xs leading-tight"
          >
            {{ projectPath }}
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
      <SidebarNavLinks
        :current-path="route.path"
        :total-pending="totalPending"
      />
      <div class="border-line mx-3 my-1 border-t" />
      <SidebarLanesList
        :lanes-with-pending="lanesWithPending"
        :current-path="route.path"
      />
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
        <UIcon
          name="i-heroicons-cpu-chip"
          class="size-3.5"
        />
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
</template>

<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const { name: projectName, path: projectPath } = useProjectConfig()
const { lanesWithPending, totalPending } = useLanes()
</script>
