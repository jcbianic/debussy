<template>
  <div class="px-8 py-6">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm font-semibold">Commits</span>
      <span class="text-xs text-neutral-400">{{ commits.length }} commits ahead of main</span>
    </div>
    <div class="border-line overflow-hidden rounded-lg border">
      <!-- Pending local changes -->
      <div
        v-if="changes && changes.total > 0"
        class="bg-surface flex items-start gap-4 border-b border-dashed border-yellow-500/30 px-5 py-3.5"
      >
        <span
          class="mt-0.5 w-14 flex-shrink-0 font-mono text-xs text-yellow-500"
        >pending</span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-yellow-400">{{ changes.total }} uncommitted change{{
              changes.total > 1 ? 's' : ''
            }}</span>
            <span
              v-if="changes.modified"
              class="text-xs text-yellow-500/70"
            >~{{ changes.modified }}</span>
            <span
              v-if="changes.added"
              class="text-xs text-green-500/70"
            >+{{ changes.added }}</span>
            <span
              v-if="changes.deleted"
              class="text-xs text-red-500/70"
            >&minus;{{ changes.deleted }}</span>
          </div>
          <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <span
              v-for="file in changes.files.slice(0, 8)"
              :key="file"
              class="font-mono text-xs text-neutral-500"
            >{{ file }}</span>
            <span
              v-if="changes.files.length > 8"
              class="text-xs text-neutral-600"
            >+{{ changes.files.length - 8 }} more</span>
          </div>
        </div>
        <UButton
          label="Commit"
          icon="i-heroicons-check"
          size="sm"
          color="primary"
          variant="soft"
          :loading="committing"
          @click="doCommit"
        />
      </div>

      <!-- Last dispatch result -->
      <div
        v-if="lastResult && !lastResult.ok"
        class="bg-surface border-b border-dashed border-red-500/30 px-5 py-3.5"
      >
        <div class="flex items-center gap-2 text-sm text-red-400">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="size-4"
          />
          <span>Dispatch failed</span>
          <UBadge
            :label="lastResult.sessionId"
            color="neutral"
            variant="subtle"
            size="xs"
          />
          <span
            v-if="lastResult.elapsed"
            class="text-xs text-neutral-500"
          >{{
            lastResult.elapsed
          }}</span>
          <span
            v-if="lastResult.exitCode != null"
            class="text-xs text-neutral-500"
          >exit {{ lastResult.exitCode }}</span>
          <span
            v-if="lastResult.killed"
            class="text-xs text-orange-400"
          >killed (timeout?)</span>
        </div>
        <pre
          v-if="lastResult.stderr"
          class="mt-2 max-h-40 overflow-auto font-mono text-xs whitespace-pre-wrap text-red-300/70"
        >{{ lastResult.stderr }}</pre>
        <pre
          v-if="lastResult.stdout"
          class="mt-2 max-h-40 overflow-auto font-mono text-xs whitespace-pre-wrap text-neutral-400"
        >{{ lastResult.stdout }}</pre>
        <pre
          v-if="lastResult.error && !lastResult.stderr"
          class="mt-2 max-h-40 overflow-auto font-mono text-xs whitespace-pre-wrap text-red-300/70"
        >{{ lastResult.error }}</pre>
      </div>

      <!-- Committed -->
      <div
        v-for="(commit, i) in commits"
        :key="commit.hash"
        class="bg-surface flex items-start gap-4 px-5 py-3.5"
        :class="i < commits.length - 1 ? 'border-line-subtle border-b' : ''"
      >
        <span
          class="mt-0.5 w-14 flex-shrink-0 font-mono text-xs text-neutral-400"
        >{{ commit.hash }}</span>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm">
            {{ commit.message }}
          </div>
          <div class="mt-0.5 flex items-center gap-2">
            <span class="text-xs text-neutral-400">{{ commit.author }}</span>
            <span class="text-content-ghost text-xs">&middot;</span>
            <span class="text-xs text-neutral-400">{{ commit.date }}</span>
          </div>
        </div>
        <div
          v-if="commit.pr"
          class="flex-shrink-0"
        >
          <UBadge
            :label="commit.pr"
            color="neutral"
            variant="subtle"
            size="xs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Commit, LaneStatus, DispatchResult } from '~/composables/useLanes'

const props = defineProps<{
  laneId: string
  commits: Commit[]
  changes: LaneStatus['changes'] | null
}>()

const emit = defineEmits<{
  committed: []
}>()

const toast = useToast()
const { dispatch } = useLanes()

const committing = ref(false)
const lastResult = ref<DispatchResult | null>(null)

async function doCommit() {
  committing.value = true
  lastResult.value = null
  try {
    const result = await dispatch(
      props.laneId,
      'Look at the current git diff and status. Stage all changes, then create a git commit with a clear conventional commit message.',
      'haiku'
    )
    lastResult.value = result
    if (result.ok) {
      toast.add({
        title: `Commit created [${result.sessionId}]`,
        description: result.output?.slice(0, 200),
        color: 'success',
      })
      emit('committed')
    } else {
      const detail = result.stderr || result.error || 'Unknown error'
      toast.add({
        title: `Commit failed [${result.sessionId}]`,
        description: detail.slice(0, 300),
        color: 'error',
      })
    }
  } catch (err: unknown) {
    // Network or unexpected error
    const msg =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Commit failed'
    toast.add({ title: msg, color: 'error' })
  } finally {
    committing.value = false
  }
}
</script>
