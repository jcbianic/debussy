<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Header -->
    <div class="border-line flex-shrink-0 border-b px-8 py-5">
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">
            Claude Setup
          </h1>
          <p class="mt-0.5 font-mono text-xs text-neutral-400">
            {{ projectPath }}
          </p>
        </div>
        <UButton
          v-if="selected"
          icon="i-heroicons-chart-bar"
          label="Usage Dashboard"
          size="xs"
          color="neutral"
          variant="soft"
          @click="selected = null"
        />
        <UBadge
          v-else
          label="No conflicts"
          color="success"
          variant="subtle"
          size="sm"
        />
      </div>
      <div class="flex items-center gap-6">
        <div
          v-for="stat in headerStats"
          :key="stat.label"
          class="flex items-baseline gap-1.5"
        >
          <span class="text-lg font-semibold tabular-nums">{{
            stat.value
          }}</span>
          <span class="text-xs text-neutral-400">{{ stat.label }}</span>
        </div>
        <div class="ml-auto flex items-center gap-1.5 text-xs text-neutral-400">
          <UIcon
            name="i-heroicons-information-circle"
            class="size-3.5"
          />
          <span>Usage data requires hooks</span>
        </div>
      </div>
    </div>

    <!-- Split panel -->
    <div class="flex min-h-0 flex-1">
      <SetupListPanel
        :tabs="tabs"
        :active-tab="activeTab"
        :explorer-groups="explorerGroups"
        :selected-id="selected?.id ?? null"
        @select="selected = $event"
        @set-tab="activeTab = $event"
        @create="showCreateModal = true"
      />
      <div class="flex flex-1 flex-col overflow-hidden">
        <SetupUsageDashboard
          v-if="!selected"
          class="overflow-y-auto"
          :items="allItems"
          :plugins="plugins"
          @select="selected = $event"
        />
        <SetupItemDetail
          v-else
          class="h-full"
          :item="selected"
          :usage="selectedUsage"
          :meta="selectedMeta"
          :plugin-groups="selectedPluginGroups"
          @select="selected = $event"
          @select-by-name="selectByName($event)"
          @update="handleUpdate"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Create modal -->
    <UModal v-model:open="showCreateModal">
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-base font-semibold">
            New project item
          </h3>
          <div class="mb-4">
            <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
            <label
              for="create-type"
              class="mb-2 block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Type
            </label>
            <div
              id="create-type"
              class="flex gap-2"
              role="radiogroup"
              aria-label="Type"
            >
              <UButton
                v-for="t in createTypes"
                :key="t.value"
                :label="t.label"
                :icon="t.icon"
                size="xs"
                :color="newItem.type === t.value ? 'primary' : 'neutral'"
                :variant="newItem.type === t.value ? 'soft' : 'ghost'"
                @click="newItem.type = t.value"
              />
            </div>
          </div>
          <div class="mb-4">
            <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
            <label
              for="create-name"
              class="mb-2 block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Name
            </label>
            <input
              id="create-name"
              v-model="newItem.name"
              class="border-line bg-surface-tinted w-full rounded-lg border px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none"
              placeholder="my-skill"
            >
            <p class="mt-1 text-xs text-neutral-400">
              Lowercase, alphanumeric with hyphens
            </p>
          </div>
          <div class="mb-5">
            <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
            <label
              for="create-description"
              class="mb-2 block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Description
            </label>
            <textarea
              id="create-description"
              v-model="newItem.description"
              aria-label="Description"
              rows="2"
              class="border-line bg-surface-tinted w-full rounded-lg border px-4 py-3 font-mono text-sm leading-relaxed focus:border-blue-500 focus:outline-none"
              placeholder="What does this do?"
            />
          </div>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              @click="showCreateModal = false"
            />
            <UButton
              label="Create"
              color="primary"
              :disabled="!newItem.name.trim()"
              :loading="creating"
              @click="handleCreate"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { path: projectPath } = useProjectConfig()
const {
  plugins,
  allItems,
  activeTab,
  tabs,
  explorerGroups,
  selected,
  selectByName,
  pluginProvides,
  usageFor,
  selectedMeta,
  headerStats,
  refresh,
  createItem,
  updateItem,
  deleteItem,
} = useSetup()

// Poll for usage data updates every 30s
let pollHandle: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  pollHandle = setInterval(() => refresh(), 30_000)
})
onUnmounted(() => {
  if (pollHandle) clearInterval(pollHandle)
})

const selectedUsage = computed(() =>
  selected.value ? usageFor(selected.value) : 0
)
const selectedPluginGroups = computed(() =>
  selected.value?.type === 'plugin' ? pluginProvides(selected.value.id) : []
)

// ── Create modal ──
const showCreateModal = ref(false)
const creating = ref(false)

const createTypes = [
  { value: 'skill' as const, label: 'Skill', icon: 'i-heroicons-sparkles' },
  {
    value: 'command' as const,
    label: 'Command',
    icon: 'i-heroicons-command-line',
  },
  { value: 'agent' as const, label: 'Agent', icon: 'i-heroicons-cpu-chip' },
]

const newItem = ref({
  type: 'skill' as 'skill' | 'command' | 'agent',
  name: '',
  description: '',
})

async function handleCreate() {
  creating.value = true
  try {
    await createItem({
      type: newItem.value.type,
      name: newItem.value.name.trim(),
      description: newItem.value.description.trim() || undefined,
    })
    showCreateModal.value = false
    newItem.value = { type: 'skill', name: '', description: '' }
  } finally {
    creating.value = false
  }
}

// ── Update / Delete handlers ──
async function handleUpdate(id: string, payload: Record<string, unknown>) {
  await updateItem(id, payload as Parameters<typeof updateItem>[1])
}

async function handleDelete(id: string) {
  await deleteItem(id)
}
</script>
