<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <!-- Sticky lane strip -->
    <div
      v-if="selectedItem"
      class="bg-surface flex flex-shrink-0 items-center gap-2.5 border-b px-6 py-2.5"
      :class="
        selectedLane?.isActive
          ? 'border-blue-200 dark:border-blue-900/50'
          : 'border-line'
      "
    >
      <div
        class="size-2 flex-shrink-0 rounded-full"
        :class="selectedLane?.isActive ? 'bg-status-active' : 'bg-neutral-400'"
      />
      <span
        class="truncate font-mono text-xs font-medium"
        :class="
          selectedLane?.isActive
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-content-subtle'
        "
        >{{ selectedLane?.branch }}</span
      >
      <UBadge
        v-if="selectedLane?.isActive"
        label="staged"
        color="primary"
        variant="subtle"
        size="xs"
        class="flex-shrink-0"
      />
      <div class="flex-1" />
      <span class="text-content-faint font-mono text-xs"
        >{{ pendingInLane }} pending in lane</span
      >
    </div>

    <!-- Scrollable area -->
    <div class="flex-1 overflow-auto">
      <!-- Empty state -->
      <div
        v-if="!selectedItem"
        class="flex h-full flex-col items-center justify-center px-8 text-center"
      >
        <UIcon
          name="i-heroicons-inbox"
          class="text-content-placeholder mb-4 size-10"
        />
        <p class="text-content-subtle text-sm font-medium">
          Select an item to review
        </p>
        <p class="text-content-faint mt-1 text-xs">
          Use
          <span class="bg-surface-sunken rounded px-1 py-0.5 font-mono">j</span>
          /
          <span class="bg-surface-sunken rounded px-1 py-0.5 font-mono">k</span>
          to navigate
        </p>
      </div>

      <!-- Item detail -->
      <div v-else class="px-8 py-8">
        <!-- Breadcrumb + navigation -->
        <div class="mb-6 flex items-center justify-between">
          <div class="text-content-faint flex items-center gap-1.5 text-xs">
            <span>{{ selectedGroup?.title }}</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="text-content-faint hover:bg-surface-hover flex size-6 items-center justify-center rounded transition-colors disabled:opacity-30"
              :disabled="selectedIndex === 0"
              title="Previous (k)"
              @click="emit('navigate', -1)"
            >
              <UIcon name="i-heroicons-chevron-up" class="size-3.5" />
            </button>
            <span class="text-content-faint w-12 text-center font-mono text-xs"
              >{{ selectedIndex + 1 }} / {{ flatItemsLength }}</span
            >
            <button
              class="text-content-faint hover:bg-surface-hover flex size-6 items-center justify-center rounded transition-colors disabled:opacity-30"
              :disabled="selectedIndex === flatItemsLength - 1"
              title="Next (j)"
              @click="emit('navigate', 1)"
            >
              <UIcon name="i-heroicons-chevron-down" class="size-3.5" />
            </button>
          </div>
        </div>

        <!-- Title + status -->
        <div class="mb-4 flex items-start justify-between gap-4">
          <h2 class="text-lg leading-snug font-semibold">
            {{ selectedItem.title }}
          </h2>
          <UBadge
            :label="selectedItem.status"
            :color="statusColor(selectedItem.status)"
            variant="subtle"
            size="sm"
            class="mt-1 flex-shrink-0"
          />
        </div>

        <!-- Context chips -->
        <div
          class="text-content-faint mb-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs"
        >
          <div class="flex items-center gap-1.5">
            <UIcon
              :name="selectedGroup?.icon || 'i-heroicons-document-text'"
              class="size-3.5"
            />
            <span>{{ selectedGroup?.source }}</span>
          </div>
          <span class="text-content-placeholder">·</span>
          <div class="flex items-center gap-1.5">
            <UIcon name="i-heroicons-code-bracket" class="size-3.5" />
            <span class="font-mono">{{ selectedLaneId }}</span>
          </div>
          <span class="text-content-placeholder">·</span>
          <div class="flex items-center gap-1.5">
            <UIcon name="i-heroicons-clock" class="size-3.5" />
            <span>{{ selectedItem.createdAt }}</span>
          </div>
          <template v-if="selectedItem.rounds.length > 1">
            <span class="text-content-placeholder">·</span>
            <div class="flex items-center gap-1.5 text-blue-500">
              <UIcon name="i-heroicons-arrow-path" class="size-3.5" />
              <span>{{ selectedItem.rounds.length }} rounds</span>
            </div>
          </template>
        </div>

        <!-- Round selector -->
        <div
          v-if="selectedItem.rounds.length > 1"
          class="bg-surface-sunken mb-5 flex w-fit items-center gap-1 rounded-lg p-1"
        >
          <button
            v-for="round in selectedItem.rounds"
            :key="round.roundNumber"
            class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            :class="
              activeRound === round.roundNumber
                ? 'bg-surface-elevated text-content shadow-sm'
                : 'text-content-subtle hover:text-content-secondary'
            "
            @click="emit('setRound', round.roundNumber)"
          >
            <span>Round {{ round.roundNumber }}</span>
            <span
              v-if="round.roundNumber === selectedItem.rounds.length"
              class="size-1.5 rounded-full"
              :class="
                selectedItem.status === 'pending'
                  ? 'bg-amber-400'
                  : selectedItem.status === 'approved'
                    ? 'bg-green-400'
                    : 'bg-red-400'
              "
            />
          </button>
        </div>

        <!-- Round content -->
        <template v-if="activeRoundData">
          <!-- Proposed content -->
          <div
            class="border-line bg-surface mb-4 overflow-hidden rounded-lg border"
          >
            <div
              class="border-line-subtle flex items-center justify-between border-b px-4 py-2.5"
            >
              <span class="text-content-subtle text-xs font-medium">
                {{
                  selectedItem.rounds.length > 1
                    ? `Proposal — Round ${activeRoundData.roundNumber}`
                    : 'Proposal'
                }}
              </span>
              <span class="text-content-faint font-mono text-xs">{{
                activeRoundData.proposedAt
              }}</span>
            </div>
            <div class="p-5">
              <p class="text-content-secondary text-sm leading-relaxed">
                {{ activeRoundData.content }}
              </p>
              <pre
                v-if="activeRoundData.code"
                class="bg-surface-page border-line-subtle mt-4 overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed"
              ><code>{{ activeRoundData.code }}</code></pre>
            </div>
          </div>

          <!-- Feedback from past round -->
          <div
            v-if="activeRoundData.feedback"
            class="mb-5 overflow-hidden rounded-lg border"
            :class="
              activeRoundData.feedbackStatus === 'changes-requested'
                ? 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10'
                : activeRoundData.feedbackStatus === 'approved'
                  ? 'border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10'
                  : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10'
            "
          >
            <div
              class="flex items-center justify-between border-b px-4 py-2.5"
              :class="
                activeRoundData.feedbackStatus === 'changes-requested'
                  ? 'border-amber-200 dark:border-amber-900/40'
                  : activeRoundData.feedbackStatus === 'approved'
                    ? 'border-green-200 dark:border-green-900/40'
                    : 'border-red-200 dark:border-red-900/40'
              "
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="
                    activeRoundData.feedbackStatus === 'approved'
                      ? 'i-heroicons-check-circle'
                      : activeRoundData.feedbackStatus === 'changes-requested'
                        ? 'i-heroicons-pencil-square'
                        : 'i-heroicons-x-circle'
                  "
                  class="size-3.5"
                  :class="
                    activeRoundData.feedbackStatus === 'approved'
                      ? 'text-green-500'
                      : activeRoundData.feedbackStatus === 'changes-requested'
                        ? 'text-amber-500'
                        : 'text-red-500'
                  "
                />
                <span
                  class="text-xs font-medium"
                  :class="
                    activeRoundData.feedbackStatus === 'approved'
                      ? 'text-green-700 dark:text-green-400'
                      : activeRoundData.feedbackStatus === 'changes-requested'
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-red-700 dark:text-red-400'
                  "
                >
                  {{
                    activeRoundData.feedbackStatus === 'approved'
                      ? 'Approved'
                      : activeRoundData.feedbackStatus === 'changes-requested'
                        ? 'Changes requested'
                        : 'Rejected'
                  }}
                </span>
              </div>
              <span class="text-content-faint font-mono text-xs">{{
                activeRoundData.feedbackAt
              }}</span>
            </div>
            <div class="p-5">
              <p
                class="text-sm leading-relaxed"
                :class="
                  activeRoundData.feedbackStatus === 'changes-requested'
                    ? 'text-amber-800 dark:text-amber-300'
                    : activeRoundData.feedbackStatus === 'approved'
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-red-800 dark:text-red-300'
                "
              >
                {{ activeRoundData.feedback }}
              </p>
            </div>
          </div>
        </template>

        <!-- Comment + actions -->
        <div
          v-if="
            selectedItem.status === 'pending' &&
            activeRound === selectedItem.rounds.length
          "
        >
          <UTextarea
            v-model="comment"
            :placeholder="commentPlaceholder"
            class="w-full"
            :rows="3"
            :class="commentError ? 'ring-1 ring-red-400' : ''"
          />
          <p v-if="commentError" class="mt-1 text-xs text-red-500">
            {{ commentError }}
          </p>
          <div class="mt-3 flex gap-2">
            <UButton
              label="Approve"
              icon="i-heroicons-check"
              color="success"
              variant="outline"
              class="flex-1"
              @click="emit('submit', 'approved')"
            />
            <UButton
              label="Request changes"
              icon="i-heroicons-pencil"
              color="warning"
              variant="outline"
              class="flex-1"
              @click="emit('submit', 'changes-requested')"
            />
            <UButton
              label="Reject"
              icon="i-heroicons-x-mark"
              color="error"
              variant="outline"
              class="flex-1"
              @click="emit('submit', 'rejected')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReviewItem, ReviewGroup, Lane } from '~/composables/useMockData'

defineProps<{
  selectedItem: ReviewItem | null
  selectedGroup: ReviewGroup | null
  selectedLane: Lane | null
  selectedLaneId: string | null
  selectedIndex: number
  flatItemsLength: number
  activeRound: number
  activeRoundData: ReviewItem['rounds'][number] | null
  pendingInLane: number
  commentPlaceholder: string
}>()

const comment = defineModel<string>('comment', { required: true })
const commentError = defineModel<string>('commentError', { required: true })

const emit = defineEmits<{
  navigate: [delta: number]
  setRound: [n: number]
  submit: [action: 'approved' | 'changes-requested' | 'rejected']
}>()
</script>
