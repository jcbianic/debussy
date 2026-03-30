<template>
  <InboxView :lane-id="laneId" />
</template>

<script setup lang="ts">
defineProps<{
  laneId: string
}>()
</script>
