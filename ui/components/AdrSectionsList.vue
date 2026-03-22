<template>
  <div class="space-y-8">
    <div
      v-for="section in sections"
      :key="section.title"
    >
      <h3 class="text-content-secondary mb-3 text-sm font-semibold">
        {{ section.title }}
      </h3>
      <div class="text-content-muted space-y-3 text-sm leading-relaxed">
        <p
          v-for="(para, i) in section.content"
          :key="i"
        >
          {{ para }}
        </p>
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
</template>

<script setup lang="ts">
import type { AdrSection } from '~/composables/useArchitecture'

defineProps<{ sections: AdrSection[] }>()
</script>
