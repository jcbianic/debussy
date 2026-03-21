<template>
  <LaneDetail :lane-id="id" base-path="worktree" />
</template>

<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string
</script>
