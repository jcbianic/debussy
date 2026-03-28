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
          <UFormField label="GitHub Issue Number">
            <UInput
              v-model="issueNumber"
              type="number"
              placeholder="e.g. 58"
              min="1"
              :disabled="loading"
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
              :disabled="!issueNumber"
              @click="submit"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const { createLane } = useLanes()

const issueNumber = ref<number | undefined>()
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!issueNumber.value) return

  loading.value = true
  error.value = ''

  try {
    const record = await createLane(issueNumber.value)
    open.value = false
    issueNumber.value = undefined
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
    issueNumber.value = undefined
    error.value = ''
  }
})
</script>
