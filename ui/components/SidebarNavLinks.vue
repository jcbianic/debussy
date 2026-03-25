<template>
  <div class="px-3 py-3">
    <NavItem
      to="/"
      icon="i-heroicons-squares-2x2"
      label="Overview"
      :is-active="currentPath === '/'"
    />

    <!-- Strategy -->
    <div
      v-if="isStrateEnabled('strategy')"
      class="mt-4"
    >
      <div
        class="text-content-faint mb-1 px-2 text-[10px] font-semibold tracking-wider uppercase"
      >
        Strategy
      </div>
      <div class="space-y-0.5">
        <NavItem
          to="/product"
          icon="i-heroicons-cube"
          label="Product"
          :is-active="currentPath === '/product'"
        />
        <NavItem
          to="/feature"
          icon="i-heroicons-light-bulb"
          label="Feature Space"
          :is-active="currentPath === '/feature'"
        />
        <NavItem
          to="/roadmap"
          icon="i-heroicons-flag"
          label="Roadmap"
          tag="1.0"
          :is-active="currentPath === '/roadmap'"
        />
      </div>
    </div>

    <!-- Engineering -->
    <div
      v-if="isStrateEnabled('engineering')"
      class="mt-4"
    >
      <div
        class="text-content-faint mb-1 px-2 text-[10px] font-semibold tracking-wider uppercase"
      >
        Engineering
      </div>
      <div class="space-y-0.5">
        <NavItem
          to="/policy"
          icon="i-heroicons-shield-check"
          label="Policy"
          :is-active="currentPath === '/policy'"
        />
        <NavItem
          to="/architecture"
          icon="i-heroicons-building-library"
          label="Architecture"
          :is-active="currentPath === '/architecture'"
        />
      </div>
    </div>

    <!-- Current Work -->
    <div class="mt-4">
      <div
        class="text-content-faint mb-1 px-2 text-[10px] font-semibold tracking-wider uppercase"
      >
        Current Work
      </div>
      <div class="space-y-0.5">
        <NavItem
          to="/inbox"
          icon="i-heroicons-inbox"
          label="Inbox"
          :badge="totalPending"
          :is-active="currentPath === '/inbox'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isStrateEnabled } = useProjectConfig()

defineProps<{
  currentPath: string
  totalPending: number
}>()
</script>
