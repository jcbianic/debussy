<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-rocket-launch"
              class="size-5"
            />
            <span class="text-sm font-medium">Start Work</span>
          </div>
        </template>

        <form
          class="space-y-4"
          @submit.prevent="submit"
        >
          <UFormField label="Task">
            <UTextarea
              v-model="task"
              placeholder="What to build..."
              :rows="2"
              autoresize
              class="w-full"
            />
          </UFormField>

          <UFormField label="Domain">
            <UInput
              v-model="domain"
              placeholder="e.g. ui/components/Lane"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Test command">
            <UInput
              v-model="testCmd"
              placeholder="e.g. pnpm -C ui vitest run --reporter=verbose"
              class="w-full"
            />
          </UFormField>

          <!-- Command preview -->
          <div class="bg-surface-page border-line rounded-md border p-3">
            <div class="mb-1 text-xs text-neutral-400">
              Command
            </div>
            <code class="text-xs leading-relaxed break-all">
              {{ command }}
            </code>
          </div>

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
              label="Copy command"
              icon="i-heroicons-clipboard-document"
              color="primary"
              size="sm"
              :loading="loading"
              :disabled="!task || !domain || !testCmd"
              @click="submit"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  laneId: string
  laneIntent?: string
  lanePath?: string
}>()

const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const { requestWork } = useLanes()

const task = ref('')
const domain = ref('')
const testCmd = ref('')
const loading = ref(false)
const error = ref('')

const workflow = '.claude/workflows/rpikit-complete.yml'

const command = computed(() => {
  const parts = [`/workflow-run ${workflow}`]
  if (props.lanePath) {
    parts.push(`--cwd ${props.lanePath}`)
  }
  if (task.value) {
    parts.push(`--input task="${task.value}"`)
  }
  if (domain.value) {
    parts.push(`--input domain="${domain.value}"`)
  }
  if (testCmd.value) {
    parts.push(`--input test_cmd="${testCmd.value}"`)
  }
  return parts.join(' \\\n  ')
})

async function submit() {
  loading.value = true
  error.value = ''

  try {
    await requestWork(props.laneId, workflow)
    await navigator.clipboard.writeText(command.value.replace(/\\\n\s*/g, ' '))

    toast.add({
      title: 'Command copied to clipboard',
      color: 'success',
    })
    open.value = false
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'statusMessage' in err
        ? String((err as { statusMessage: string }).statusMessage)
        : 'Failed to create work request'
    error.value = msg
  } finally {
    loading.value = false
  }
}

watch(open, (val) => {
  if (val) {
    task.value = props.laneIntent ?? ''
    domain.value = ''
    testCmd.value = ''
    error.value = ''
  }
})
</script>
