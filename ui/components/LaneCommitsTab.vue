<template>
  <div class="px-8 py-6">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-sm font-semibold">Commits</span>
        <span class="text-xs text-neutral-400">{{ commits.length }} ahead of main</span>
      </div>
      <UButton
        v-if="changes && changes.total > 0"
        label="Commit"
        icon="i-heroicons-check"
        size="sm"
        color="primary"
        variant="soft"
        :loading="committing"
        @click="doCommit"
      />
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
import type { Commit, LaneStatus } from '~/composables/useLanes'

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

async function doCommit() {
  committing.value = true
  try {
    const { sessionId } = await dispatch(
      props.laneId,
      'Look at the current git diff and status. Stage all changes, then create a git commit with a clear conventional commit message.',
      'haiku'
    )
    toast.add({
      title: `Session started [${sessionId}]`,
      color: 'info',
    })
    emit('committed')
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Dispatch failed'
    toast.add({ title: msg, color: 'error' })
  } finally {
    committing.value = false
  }
}
</script>
