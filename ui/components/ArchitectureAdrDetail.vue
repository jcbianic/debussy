<template>
  <div>
    <button
      class="mb-6 flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
      @click="emit('navigate', 'decisions-index')"
    >
      <UIcon name="i-heroicons-arrow-left" class="size-3.5" />
      Decisions
    </button>
    <div class="mb-8 flex items-start justify-between">
      <div>
        <div class="mb-1 font-mono text-xs text-neutral-400">
          {{ adr.id }} · {{ adr.date }}
        </div>
        <h2 class="text-xl font-semibold">{{ adr.title }}</h2>
        <div class="mt-2 flex items-center gap-2">
          <UBadge
            :label="adr.status"
            :color="adrStatusColor(adr.status)"
            variant="subtle"
            size="sm"
          />
          <a
            v-if="adr.issue"
            :href="adr.issue"
            class="font-mono text-xs text-blue-500 hover:underline"
            >{{ adr.issueLabel }}</a
          >
          <span v-if="adr.supersedes" class="text-xs text-neutral-400">
            supersedes
            <button
              class="font-mono text-blue-500 hover:underline"
              @click="emit('navigate', 'adr', adr.supersedes!)"
            >
              {{ adrs.find((a) => a.key === adr.supersedes)?.id }}
            </button>
          </span>
        </div>
      </div>
      <button
        class="flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
        :class="
          flagged.has('adr:' + adr.key)
            ? 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
            : 'bg-surface text-content-subtle border-line-raised hover:border-neutral-300'
        "
        @click="emit('toggleFlag', 'adr:' + adr.key)"
      >
        <UIcon name="i-heroicons-flag" class="size-3.5" />
        {{
          flagged.has('adr:' + adr.key)
            ? 'Revision flagged'
            : 'Flag for revision'
        }}
      </button>
    </div>

    <!-- Affects principles callout -->
    <div
      v-if="adr.affectedPrinciples?.length"
      class="border-line bg-surface-tinted mb-6 flex items-start gap-3 rounded-lg border px-4 py-3"
    >
      <UIcon
        name="i-heroicons-scale"
        class="mt-0.5 size-4 flex-shrink-0 text-neutral-400"
      />
      <div>
        <div class="mb-1.5 text-xs font-medium text-neutral-500">
          Affects principles
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="num in adr.affectedPrinciples"
            :key="num"
            class="text-content-muted border-line-raised bg-surface-sunken rounded border px-2 py-0.5 font-mono text-xs transition-colors hover:border-neutral-400"
            @click="emit('navigate', 'principle', num)"
          >
            P{{ num }} · {{ principles.find((p) => p.num === num)?.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-8">
      <div v-for="section in adr.sections" :key="section.title">
        <h3 class="text-content-secondary mb-3 text-sm font-semibold">
          {{ section.title }}
        </h3>
        <div class="text-content-muted space-y-3 text-sm leading-relaxed">
          <p v-for="(para, i) in section.content" :key="i">{{ para }}</p>
        </div>
        <div
          v-if="section.table"
          class="border-line mt-4 overflow-hidden rounded-lg border"
        >
          <table class="w-full text-xs">
            <thead>
              <tr class="border-line bg-surface-hover border-b">
                <th
                  v-for="col in section.table.headers"
                  :key="col"
                  class="px-4 py-2.5 text-left font-medium text-neutral-500"
                >
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in section.table.rows"
                :key="i"
                class="border-line-subtle border-b last:border-b-0"
              >
                <td
                  v-for="(cell, j) in row"
                  :key="j"
                  class="text-content-muted px-4 py-2.5"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { adrs } from '~/composables/useArchitecture'
import type { Adr, Principle, ViewType } from '~/composables/useArchitecture'

defineProps<{
  adr: Adr
  principles: Principle[]
  flagged: Set<string>
}>()

const emit = defineEmits<{
  navigate: [view: ViewType, key?: string]
  toggleFlag: [key: string]
}>()
</script>
