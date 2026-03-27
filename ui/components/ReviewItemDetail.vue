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
      >{{ selectedLane?.branch }}</span>
      <UBadge
        v-if="selectedLane?.isActive"
        label="staged"
        color="primary"
        variant="subtle"
        size="xs"
        class="flex-shrink-0"
      />
      <div class="flex-1" />
      <span class="text-content-faint font-mono text-xs">{{ pendingInLane }} pending in lane</span>
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
      <div
        v-else
        class="px-8 py-8"
      >
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
              <UIcon
                name="i-heroicons-chevron-up"
                class="size-3.5"
              />
            </button>
            <span class="text-content-faint w-12 text-center font-mono text-xs">{{ selectedIndex + 1 }} / {{ flatItemsLength }}</span>
            <button
              class="text-content-faint hover:bg-surface-hover flex size-6 items-center justify-center rounded transition-colors disabled:opacity-30"
              :disabled="selectedIndex === flatItemsLength - 1"
              title="Next (j)"
              @click="emit('navigate', 1)"
            >
              <UIcon
                name="i-heroicons-chevron-down"
                class="size-3.5"
              />
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
            <UIcon
              name="i-heroicons-code-bracket"
              class="size-3.5"
            />
            <span class="font-mono">{{ selectedLaneId }}</span>
          </div>
          <span class="text-content-placeholder">·</span>
          <div class="flex items-center gap-1.5">
            <UIcon
              name="i-heroicons-clock"
              class="size-3.5"
            />
            <span>{{ selectedItem.createdAt }}</span>
          </div>
          <template v-if="selectedItem.rounds.length > 1">
            <span class="text-content-placeholder">·</span>
            <div class="flex items-center gap-1.5 text-blue-500">
              <UIcon
                name="i-heroicons-arrow-path"
                class="size-3.5"
              />
              <span>{{ selectedItem.rounds.length }} rounds</span>
            </div>
          </template>
        </div>

        <!-- Round selector -->
        <ReviewRoundSelector
          v-if="selectedItem.rounds.length > 1"
          :rounds="selectedItem.rounds"
          :active-round="activeRound"
          :current-status="selectedItem.status"
          @set-round="emit('setRound', $event)"
        />

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
              <!-- eslint-disable vue/no-v-html -->
              <div
                v-if="isMarkdown(activeRoundData.content)"
                class="text-content-secondary"
                v-html="renderMarkdown(activeRoundData.content)"
              />
              <!-- eslint-enable vue/no-v-html -->
              <p
                v-else
                class="text-content-secondary text-sm leading-relaxed"
              >
                {{ activeRoundData.content }}
              </p>
              <pre
                v-if="activeRoundData.code"
                class="bg-surface-page border-line-subtle mt-4 overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed"
              ><code>{{ activeRoundData.code }}</code></pre>
            </div>
          </div>

          <!-- Feedback from past round -->
          <ReviewFeedbackCard
            v-if="activeRoundData.feedback"
            :round-data="activeRoundData"
          />
        </template>

        <!-- Comment + actions -->
        <ReviewActionBar
          v-if="
            selectedItem.status === 'pending' &&
              activeRound === selectedItem.rounds.length
          "
          v-model:comment="comment"
          v-model:comment-error="commentError"
          :comment-placeholder="commentPlaceholder"
          @submit="emit('submit', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReviewItem, ReviewGroup, Lane } from '~/composables/useLanes'

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
