<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-12">
    <!-- Hero -->
    <section class="text-center max-w-2xl mx-auto mb-12" data-testid="hero">
      <h1 class="text-4xl font-bold mb-4" style="color: var(--color-primary)">
        Orchestrate Claude Code sessions locally
      </h1>
      <p class="text-lg mb-8" style="color: var(--color-text); opacity: 0.8">
        A local-first web UI for managing Claude Code sessions, IIKit workflows, and development artifacts.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/sessions"
          class="px-6 py-3 rounded-lg font-semibold text-white text-center"
          style="background-color: var(--color-primary)"
          data-testid="cta-new-session"
        >
          New Session
        </NuxtLink>
        <NuxtLink
          to="/workflows"
          class="px-6 py-3 rounded-lg font-semibold text-center"
          style="border: 1px solid var(--color-border); color: var(--color-text)"
          data-testid="cta-view-workflows"
        >
          View Workflows
        </NuxtLink>
      </div>
    </section>

    <!-- Feature Callouts -->
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto" data-testid="features">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="p-6 rounded-lg text-center"
        style="border: 1px solid var(--color-border)"
        data-testid="feature-card"
      >
        <h3 class="text-lg font-semibold mb-2" style="color: var(--color-primary)">
          {{ feature.title }}
        </h3>
        <p class="text-sm" style="color: var(--color-text); opacity: 0.7">
          {{ feature.description }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const features = [
  {
    title: 'Sessions',
    description: 'Manage Claude Code sessions with real-time output streaming and session history.',
  },
  {
    title: 'Workflows',
    description: 'Execute IIKit phases (specify, plan, implement) with progress tracking.',
  },
  {
    title: 'Artifacts',
    description: 'Browse generated specifications, plans, and implementation files.',
  },
]
</script>
