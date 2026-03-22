<template>
  <div class="px-8 py-6">
    <!-- Item header -->
    <div class="mb-5 flex items-start justify-between">
      <div class="min-w-0 flex-1">
        <div class="mb-2 flex items-center gap-2">
          <UIcon
            :name="typeIcon(item.type)"
            class="size-5 flex-shrink-0"
            :class="typeColor(item.type)"
          />
          <h2 class="font-mono text-base font-semibold">
            {{ item.name }}
          </h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            :label="item.type"
            color="neutral"
            variant="subtle"
            size="xs"
          />
          <span
            v-if="item.plugin"
            class="text-xs text-neutral-400"
          >from <span class="font-mono">{{ item.plugin }}</span></span>
          <span
            v-if="item.version"
            class="text-content-ghost font-mono text-xs"
          >v{{ item.version }}</span>
          <UBadge
            v-if="item.scope"
            :label="item.scope"
            color="neutral"
            variant="outline"
            size="xs"
          />
        </div>
      </div>
      <div class="ml-8 flex-shrink-0 text-right">
        <div
          class="text-2xl font-semibold tabular-nums"
          :class="usage > 0 ? 'text-content' : 'text-content-placeholder'"
        >
          {{ usage > 0 ? usage : '—' }}
        </div>
        <div class="text-xs text-neutral-400">
          {{ usage > 0 ? 'invocations' : 'no data yet' }}
        </div>
      </div>
    </div>

    <!-- Metadata -->
    <div
      v-if="meta.length"
      class="border-line bg-surface-tinted mb-5 flex gap-8 rounded-lg border px-5 py-3.5"
    >
      <div
        v-for="m in meta"
        :key="m.label"
      >
        <div class="mb-0.5 text-xs text-neutral-400">
          {{ m.label }}
        </div>
        <div class="font-mono text-xs font-medium">
          {{ m.value }}
        </div>
      </div>
    </div>

    <!-- Description -->
    <div
      v-if="item.description"
      class="mb-5"
    >
      <p class="text-content-secondary text-sm leading-relaxed">
        {{ item.description }}
      </p>
    </div>

    <!-- ── PLUGIN: provides grouped by type ── -->
    <template v-if="item.type === 'plugin'">
      <div
        v-for="group in pluginGroups"
        :key="group.type"
        class="mb-5"
      >
        <h3
          class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
        >
          {{ group.label }}
          <span class="font-normal opacity-60">{{ group.items.length }}</span>
        </h3>
        <div class="border-line overflow-hidden rounded-lg border">
          <button
            v-for="(provided, i) in group.items"
            :key="provided.id"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
            :class="
              i < group.items.length - 1 ? 'border-line-subtle border-b' : ''
            "
            @click="emit('select', provided)"
          >
            <UIcon
              :name="typeIcon(provided.type)"
              class="size-3.5 flex-shrink-0"
              :class="typeColor(provided.type)"
            />
            <span class="text-content-secondary flex-1 font-mono text-xs">{{
              provided.name
            }}</span>
            <span
              v-if="provided.description"
              class="hidden max-w-xs truncate text-xs text-neutral-400 lg:block"
            >{{ provided.description }}</span>
            <span
              v-if="provided.usage > 0"
              class="ml-3 flex-shrink-0 text-xs text-neutral-400 tabular-nums"
            >{{ provided.usage }}×</span>
            <UIcon
              name="i-heroicons-chevron-right"
              class="text-content-ghost size-3 flex-shrink-0"
            />
          </button>
        </div>
      </div>
    </template>

    <!-- ── COMMAND: frontmatter + body ── -->
    <template v-if="item.type === 'command'">
      <!-- Allowed tools -->
      <div
        v-if="item.allowedTools"
        class="mb-5"
      >
        <h3
          class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
        >
          Allowed tools
        </h3>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="tool in item.allowedTools.split(', ')"
            :key="tool"
            class="bg-surface-hover text-content-muted border-line-raised rounded border px-2 py-1 font-mono text-xs"
          >{{ tool }}</span>
        </div>
      </div>
      <!-- Argument hint -->
      <div
        v-if="item.argHint"
        class="mb-5"
      >
        <h3
          class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
        >
          Usage
        </h3>
        <code class="text-content-secondary font-mono text-sm">{{ item.name }} {{ item.argHint }}</code>
      </div>
      <!-- Body content -->
      <div
        v-if="item.body"
        class="mb-5"
      >
        <h3
          class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
        >
          Content
        </h3>
        <pre
          class="border-line text-content-secondary bg-surface-tinted overflow-x-auto rounded-lg border px-5 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap"
        >{{ item.body }}</pre>
      </div>
      <!-- Delegates to skill -->
      <div
        v-if="item.delegatesTo"
        class="mb-5"
      >
        <h3
          class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
        >
          Delegates to
        </h3>
        <button
          class="border-line flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
          @click="emit('selectByName', item.delegatesTo!)"
        >
          <UIcon
            name="i-heroicons-sparkles"
            class="size-3.5 text-violet-500"
          />
          <span class="text-content-secondary font-mono text-xs">{{
            item.delegatesTo
          }}</span>
          <UIcon
            name="i-heroicons-arrow-right"
            class="ml-1 size-3 text-neutral-400"
          />
        </button>
      </div>
    </template>

    <!-- ── SKILL: triggers ── -->
    <template v-if="item.type === 'skill' && item.triggers?.length">
      <div class="mb-5">
        <h3
          class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
        >
          Triggers on
        </h3>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="t in item.triggers"
            :key="t"
            class="rounded border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
          >{{ t }}</span>
        </div>
      </div>
    </template>

    <!-- ── HOOK: fires on ── -->
    <template v-if="item.type === 'hook'">
      <div
        v-if="item.triggers?.length"
        class="mb-5"
      >
        <h3
          class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
        >
          Fires on
        </h3>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="t in item.triggers"
            :key="t"
            class="rounded border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
          >{{ t }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SetupItem } from '~/composables/useSetup'

defineProps<{
  item: SetupItem
  usage: number
  meta: { label: string; value: string }[]
  pluginGroups: { type: string; label: string; items: SetupItem[] }[]
}>()

const emit = defineEmits<{
  select: [item: SetupItem]
  selectByName: [name: string]
}>()
</script>
