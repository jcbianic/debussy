<template>
  <div class="space-y-0.5 px-3 py-3">
    <NavItem
      to="/"
      icon="i-heroicons-squares-2x2"
      label="Overview"
      :is-active="currentPath === '/'"
    />
    <NavItem
      to="/product"
      icon="i-heroicons-cube"
      label="Product"
      :is-active="currentPath === '/product'"
    />
    <NavItem
      to="/roadmap"
      icon="i-heroicons-flag"
      label="Roadmap"
      tag="1.0"
      :is-active="currentPath === '/roadmap'"
    />
    <NavItem
      to="/inbox"
      icon="i-heroicons-inbox"
      label="Inbox"
      :badge="totalPending"
      :is-active="currentPath === '/inbox'"
    />
    <NavItem
      to="/feature"
      icon="i-heroicons-light-bulb"
      label="Feature"
      :is-active="currentPath === '/feature'"
    />
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
</template>

<script setup lang="ts">
defineProps<{
  currentPath: string
  totalPending: number
}>()
</script>
