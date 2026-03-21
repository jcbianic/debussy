<template>
  <LaneDetail :lane-id="id" base-path="lane" />
</template>

<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string
</script>
