<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-plus-circle"
              class="size-5"
            />
            <span class="text-sm font-medium">Create lane from issue</span>
          </div>
        </template>

        <form
          class="space-y-4"
          @submit.prevent="submit"
        >
          <UFormField label="GitHub Issue">
            <USelectMenu
              v-model="selectedIssue"
              :items="issueItems"
              value-key="value"
              :loading="loadingIssues"
              placeholder="Select an issue..."
              searchable
              :search-input="{ placeholder: 'Search issues...' }"
              :disabled="loading"
              class="w-full"
            />
          </UFormField>

          <div
            v-if="error"
            class="text-sm text-red-400"
          >
            {{ error }}
          </div>
        </form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="outline"
              size="sm"
              @click="open = false"
            />
            <UButton
              label="Create lane"
              color="primary"
              size="sm"
              :loading="loading"
              :disabled="!selectedIssue"
              @click="submit"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface IssueSummary {
  number: number
  title: string
  labels: string[]
}

const open = defineModel<boolean>('open', { default: false })

const { createLane, lanes } = useLanes()

const selectedIssue = ref<string | undefined>()
const loading = ref(false)
const error = ref('')

const { data: issues, status: fetchStatus } = useFetch<IssueSummary[]>(
  '/api/issues',
  {
    lazy: true,
    default: () => [],
  }
)
const loadingIssues = computed(() => fetchStatus.value === 'pending')

const existingIssueNumbers = computed(
  () => new Set(lanes.value.map((l) => l.issueNumber).filter(Boolean))
)

const issueItems = computed(() =>
  (issues.value ?? [])
    .filter((i) => !existingIssueNumbers.value.has(i.number))
    .map((i) => ({
      label: `#${i.number} — ${i.title}`,
      value: String(i.number),
    }))
)

async function submit() {
  if (!selectedIssue.value) return

  loading.value = true
  error.value = ''

  try {
    const record = await createLane(Number(selectedIssue.value))
    open.value = false
    selectedIssue.value = undefined
    navigateTo(`/lane/${record.id}`)
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { message?: string } }).data?.message ?? err)
        : String(err)
    error.value = msg
  } finally {
    loading.value = false
  }
}

watch(open, (val) => {
  if (!val) {
    selectedIssue.value = undefined
    error.value = ''
  }
})
</script>
