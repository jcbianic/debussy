<template>
  <div class="flex flex-col h-full">
    <!-- Top bar -->
    <div class="flex items-center gap-4 px-6 py-4 border-b border-gray-800">
      <h1 class="text-xl font-bold">Workflows</h1>
      <span class="text-xs text-gray-500 font-mono">{{ activeSessions }} active session{{ activeSessions !== 1 ? 's' : '' }}</span>
      <button
        v-if="activeSessions > 0"
        class="ml-auto px-3 py-1 rounded text-xs font-medium bg-red-900/50 border border-red-700 text-red-300 hover:bg-red-800/50"
        @click="killAll"
      >
        Kill All
      </button>
    </div>

    <!-- Phase Status Section (FR-008, FR-009, FR-010) -->
    <div class="border-b border-gray-800 px-6 py-4 shrink-0">
      <div class="flex items-center gap-3 mb-3">
        <h2 class="text-sm font-semibold text-gray-300">Phase Status</h2>
        <WorkflowFeatureSelector
          v-model="selectedFeatureId"
          :features="features"
        />
        <span v-if="featuresError" class="text-xs text-red-400">{{ featuresError }}</span>
      </div>
      <WorkflowPhasePipeline
        :phases="phases"
        :loading="phasesLoading"
        @refresh="refreshPhases"
      />
      <div v-if="phasesError" class="text-xs text-red-400 mt-2">{{ phasesError }}</div>
    </div>

    <div v-if="fetchError" class="p-6 text-red-400">{{ fetchError }}</div>
    <div v-else-if="!workflowData" class="p-6 text-gray-500">Loading...</div>
    <div v-else class="flex flex-col flex-1 min-h-0">
      <div v-for="wf in workflowData.workflows" :key="wf.file" class="flex flex-col flex-1 min-h-0">

        <!-- Pipeline -->
        <div class="px-6 py-4 overflow-x-auto shrink-0">
          <div class="flex items-start gap-0 min-w-max">
            <template v-for="(step, i) in wf.steps" :key="step.id">
              <!-- Arrow connector -->
              <div v-if="i > 0" class="flex items-center self-center pt-1">
                <div class="w-6 h-px bg-gray-700"></div>
                <div class="text-gray-700 -ml-1">▶</div>
              </div>

              <!-- Step card -->
              <div
                class="w-40 shrink-0 rounded-lg p-3 flex flex-col cursor-pointer transition-all border"
                :class="stepCardClass(step)"
                @click="selectStep(step)"
              >
                <div class="flex items-center gap-2 mb-1.5">
                  <!-- Status dot -->
                  <span class="flex items-center justify-center w-5 h-5 rounded-full shrink-0" :class="stepDotClass(step)">
                    <span v-if="stepStates[step.id]?.status === 'running'" class="animate-pulse text-[8px]">●</span>
                    <span v-else-if="stepStates[step.id]?.status === 'ready'" class="text-[8px]">✓</span>
                    <span v-else class="text-[8px] text-gray-600">{{ i + 1 }}</span>
                  </span>
                  <span class="font-semibold text-xs truncate">{{ step.name }}</span>
                </div>
                <code class="text-[9px] text-blue-400/70 truncate">{{ step.command }}</code>

                <!-- Action button -->
                <button
                  class="mt-2 w-full px-2 py-1 rounded text-[10px] font-medium transition-colors"
                  :class="stepActionClass(step)"
                  :disabled="stepStates[step.id]?.status === 'starting'"
                  @click.stop="triggerStep(step)"
                >
                  {{ stepActionLabel(step) }}
                </button>
              </div>
            </template>
          </div>
        </div>

        <!-- Terminal panel -->
        <div class="flex-1 min-h-0 border-t border-gray-800 flex flex-col">
          <div v-if="!selectedStep" class="flex items-center justify-center h-full text-gray-600 text-sm" style="min-height: 300px">
            Select a step to view its terminal
          </div>
          <template v-else>
            <!-- Terminal header -->
            <div class="flex items-center gap-3 px-4 py-2 bg-[#16161e] border-b border-gray-800 shrink-0">
              <span class="text-xs font-semibold">{{ selectedStep.name }}</span>
              <span class="text-[10px] font-mono text-gray-500">debussy-wf-{{ selectedStep.id }}</span>
              <span class="text-[10px] font-mono ml-auto" :class="terminalStatusClass">{{ terminalStatusLabel }}</span>
            </div>
            <!-- Terminal (reuses the same component as the Terminal page) -->
            <TmuxTerminal
              v-if="hasSession(selectedStep)"
              :key="selectedStep.id"
              :session="`debussy-wf-${selectedStep.id}`"
              class="flex-1 min-h-0"
            />
            <div v-else class="flex items-center justify-center flex-1 text-gray-600 text-sm" style="min-height: 300px">
              Click "Start" to launch a Claude session for this step
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Feature, Phase } from '../server/utils/types'

// ---------------------------------------------------------------------------
// Phase Status (FR-008, FR-009, FR-010)
// ---------------------------------------------------------------------------

const { data: featuresData, error: featuresApiError } = await useFetch<{ features: Feature[] }>('/api/features')

const features = computed<Feature[]>(() => featuresData.value?.features ?? [])
const featuresError = computed(() => featuresApiError.value?.message ?? null)

// Auto-select when only one feature exists (FR-008, US2-S3)
const selectedFeatureId = ref<string | null>(null)
watch(features, (list) => {
  if (list.length === 1 && !selectedFeatureId.value) {
    selectedFeatureId.value = list[0].id
  }
}, { immediate: true })

const phases = ref<Phase[]>([])
const phasesLoading = ref(false)
const phasesError = ref<string | null>(null)

async function refreshPhases() {
  if (!selectedFeatureId.value) return
  phasesLoading.value = true
  phasesError.value = null
  try {
    const data = await $fetch<{ feature: string; phases: Phase[] }>(
      `/api/phases?feature=${encodeURIComponent(selectedFeatureId.value)}`
    )
    phases.value = data.phases
  } catch (e: any) {
    phasesError.value = e?.data?.statusMessage ?? e?.message ?? 'Failed to load phases'
  } finally {
    phasesLoading.value = false
  }
}

watch(selectedFeatureId, () => {
  refreshPhases()
}, { immediate: true })

// ---------------------------------------------------------------------------
// Existing workflow session management
// ---------------------------------------------------------------------------

const { data: workflowData, error: fetchError } = await useFetch('/api/workflow')

interface StepState {
  status: 'none' | 'starting' | 'running' | 'ready'
}

const stepStates = ref<Record<string, StepState>>({})
const selectedStep = ref<any>(null)

let pollTimer: ReturnType<typeof setInterval> | null = null

const activeSessions = computed(() =>
  Object.values(stepStates.value).filter(s => s.status !== 'none').length
)

const terminalStatusClass = computed(() => {
  if (!selectedStep.value) return 'text-gray-500'
  const st = stepStates.value[selectedStep.value.id]?.status
  if (st === 'ready') return 'text-green-400'
  if (st === 'running' || st === 'starting') return 'text-yellow-400'
  return 'text-gray-500'
})

const terminalStatusLabel = computed(() => {
  if (!selectedStep.value) return ''
  const st = stepStates.value[selectedStep.value.id]?.status
  if (st === 'ready') return 'idle'
  if (st === 'starting') return 'starting...'
  if (st === 'running') return 'running...'
  return 'no session'
})

function getStatus(step: any): string {
  return stepStates.value[step.id]?.status || 'none'
}

function hasSession(step: any): boolean {
  const st = getStatus(step)
  return st !== 'none'
}

function stepCardClass(step: any) {
  const isSelected = selectedStep.value?.id === step.id
  const st = getStatus(step)
  if (isSelected) {
    if (st === 'ready') return 'bg-green-900/20 border-green-700'
    if (st === 'running' || st === 'starting') return 'bg-yellow-900/20 border-yellow-700'
    return 'bg-[#16161e] border-blue-600'
  }
  if (st === 'ready') return 'bg-[#16161e] border-green-800/50'
  if (st === 'running' || st === 'starting') return 'bg-[#16161e] border-yellow-800/50'
  return 'bg-[#16161e] border-gray-800 hover:border-gray-600'
}

function stepDotClass(step: any) {
  const st = getStatus(step)
  if (st === 'ready') return 'bg-green-900 text-green-400'
  if (st === 'running' || st === 'starting') return 'bg-yellow-900 text-yellow-400'
  return 'bg-gray-800'
}

function stepActionClass(step: any) {
  const st = getStatus(step)
  if (st === 'starting') return 'bg-gray-700 text-gray-400 cursor-wait'
  if (st === 'ready') return 'bg-blue-600 hover:bg-blue-500 text-white'
  if (st === 'running') return 'bg-gray-700 text-gray-400'
  return 'bg-purple-600 hover:bg-purple-500 text-white'
}

function stepActionLabel(step: any) {
  const st = getStatus(step)
  if (st === 'starting') return 'Starting...'
  if (st === 'ready') return 'Send Command'
  if (st === 'running') return 'Running...'
  return 'Start'
}

function selectStep(step: any) {
  if (selectedStep.value?.id === step.id) return
  selectedStep.value = step
}

async function triggerStep(step: any) {
  const st = stepStates.value[step.id]?.status

  if (!st || st === 'none') {
    // Start session (fire-and-forget, then poll for readiness)
    stepStates.value[step.id] = { status: 'starting' }
    selectedStep.value = step

    try {
      await $fetch('/api/workflow-session', {
        method: 'POST',
        body: { action: 'start', stepId: step.id },
      })

      // Poll until Claude is ready (terminal component mounts automatically via v-if)
      startStatusPolling(step.id)
    } catch {
      stepStates.value[step.id] = { status: 'none' }
    }
  } else if (st === 'ready') {
    // Send the actual workflow command (e.g. /iikit-01-specify)
    stepStates.value[step.id] = { status: 'running' }
    try {
      await $fetch('/api/workflow-run', {
        method: 'POST',
        body: {
          stepId: step.id,
          command: step.command,
        },
      })
      startStatusPolling(step.id)
    } catch {}
  }
}

function startStatusPolling(stepId: string) {
  stopStatusPolling()
  pollTimer = setInterval(async () => {
    try {
      const res = await $fetch(`/api/workflow-pane?stepId=${stepId}`) as any
      if (res.ok && res.status === 'no-session') {
        stepStates.value[stepId] = { status: 'none' }
        stopStatusPolling()
      } else if (res.ok && res.idle) {
        stepStates.value[stepId] = { status: 'ready' }
        stopStatusPolling()
      } else if (res.ok && res.status === 'active') {
        // Session exists but Claude is still loading or processing
        const current = stepStates.value[stepId]?.status
        if (current === 'starting') {
          // Keep as starting until idle
        } else {
          stepStates.value[stepId] = { status: 'running' }
        }
      }
    } catch {}
  }, 2000)
}

function stopStatusPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function killAll() {
  stopStatusPolling()
  await $fetch('/api/workflow-session', {
    method: 'POST',
    body: { action: 'kill-all', stepId: '_' },
  })
  stepStates.value = {}
  selectedStep.value = null
}

// Check existing sessions on mount
onMounted(async () => {
  try {
    const res = await $fetch('/api/workflow-session', {
      method: 'POST',
      body: { action: 'list' },
    }) as any
    if (res.ok) {
      for (const s of res.sessions) {
        stepStates.value[s.stepId] = { status: s.ready ? 'ready' : 'running' }
      }
    }
  } catch {}
})

onUnmounted(() => {
  stopStatusPolling()
})
</script>

