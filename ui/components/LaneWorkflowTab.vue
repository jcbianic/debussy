<template>
  <div class="px-8 py-6">
    <div v-if="workflow">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <div class="mb-1 flex items-center gap-2">
            <UBadge
              v-if="isSkeleton"
              label="planned"
              color="neutral"
              variant="subtle"
              size="sm"
            />
            <UBadge
              v-else
              :label="workflow.status"
              :color="
                workflow.status === 'running'
                  ? 'primary'
                  : workflow.status === 'done'
                    ? 'success'
                    : 'neutral'
              "
              variant="subtle"
              size="sm"
            />
            <span class="font-mono text-sm font-medium">{{
              workflow.file
            }}</span>
          </div>
          <div
            v-if="!isSkeleton"
            class="text-xs text-neutral-400"
          >
            Step {{ workflow.currentStep }} of {{ workflow.totalSteps }} ·
            {{ workflow.elapsed }} elapsed
          </div>
          <div
            v-else
            class="text-xs text-neutral-400"
          >
            {{ workflow.totalSteps }} steps
          </div>
        </div>
        <div
          v-if="!isSkeleton"
          class="font-mono text-xs text-neutral-400"
        >
          started {{ workflow.startedAt }}
        </div>
      </div>
      <div class="space-y-2">
        <WorkflowStepRow
          v-for="step in workflow.steps"
          :key="step.name"
          :step="step"
        />
      </div>
    </div>
    <EmptyState
      v-else
      icon="i-heroicons-arrow-path"
      text="No active workflow on this lane"
    />
  </div>
</template>

<script setup lang="ts">
import type { WorkflowRun } from '~/composables/useLanes'

const props = defineProps<{ laneId: string }>()

const { getWorkflow } = useLanes()

const workflow = ref<WorkflowRun | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

const isSkeleton = computed(() => workflow.value?.status === 'skeleton')

async function loadWorkflow() {
  workflow.value = (await getWorkflow(props.laneId)) ?? null
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(async () => {
    await loadWorkflow()
    const status = workflow.value?.status
    if (status && status !== 'running') {
      stopPolling()
    }
  }, 3000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

watch(
  () => props.laneId,
  async () => {
    await loadWorkflow()
    if (workflow.value?.status === 'running') {
      startPolling()
    }
  },
  { immediate: true }
)

onUnmounted(() => stopPolling())
</script>
