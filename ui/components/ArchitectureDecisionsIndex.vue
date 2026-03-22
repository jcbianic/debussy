<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-semibold">
        Decisions
      </h2>
      <p class="mt-1 text-sm text-neutral-400">
        Architecture Decision Records — what was decided and why.
      </p>
    </div>
    <div class="mb-5">
      <UInput
        v-model="adrSearch"
        placeholder="Search decisions…"
        icon="i-heroicons-magnifying-glass"
        size="sm"
        class="max-w-sm"
      />
    </div>
    <div class="border-line overflow-hidden rounded-lg border">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-line bg-surface-hover border-b">
            <th
              class="w-12 px-4 py-2.5 text-left text-xs font-medium text-neutral-500"
            >
              ID
            </th>
            <th
              class="px-4 py-2.5 text-left text-xs font-medium text-neutral-500"
            >
              Title
            </th>
            <th
              class="px-4 py-2.5 text-left text-xs font-medium text-neutral-500"
            >
              Principles
            </th>
            <th
              class="w-24 px-4 py-2.5 text-left text-xs font-medium text-neutral-500"
            >
              Status
            </th>
            <th
              class="w-28 px-4 py-2.5 text-left text-xs font-medium text-neutral-500"
            >
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="adr in adrs"
            :key="adr.key"
            class="border-line-subtle border-b last:border-b-0"
          >
            <td class="px-4 py-3 font-mono text-xs text-neutral-400">
              {{ adr.id }}
            </td>
            <td class="px-4 py-3">
              <button
                type="button"
                class="w-full text-left hover:underline"
                @click="emit('navigate', 'adr', adr.key)"
              >
                <div class="font-medium">
                  {{ adr.title }}
                </div>
                <div
                  v-if="flagged.has('adr:' + adr.key)"
                  class="mt-0.5 text-xs text-red-500 dark:text-red-400"
                >
                  revision flagged
                </div>
              </button>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="num in adr.affectedPrinciples || []"
                  :key="num"
                  class="bg-surface-sunken rounded px-1.5 py-0.5 font-mono text-xs text-neutral-500"
                >P{{ num }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <UBadge
                :label="adr.status"
                :color="adrStatusColor(adr.status)"
                variant="subtle"
                size="xs"
              />
            </td>
            <td class="px-4 py-3 font-mono text-xs text-neutral-400">
              {{ adr.date }}
            </td>
          </tr>
          <tr v-if="adrs.length === 0">
            <td
              colspan="5"
              class="px-4 py-10 text-center text-sm text-neutral-400"
            >
              No decisions match "{{ adrSearch }}"
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Adr, ViewType } from '~/composables/useArchitecture'

const adrSearch = defineModel<string>('adrSearch', { required: true })

defineProps<{
  adrs: Adr[]
  flagged: Set<string>
}>()

const emit = defineEmits<{
  navigate: [view: ViewType, key?: string]
}>()
</script>
