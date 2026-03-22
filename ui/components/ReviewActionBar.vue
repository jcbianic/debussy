<template>
  <div>
    <UTextarea
      v-model="comment"
      :placeholder="commentPlaceholder"
      class="w-full"
      :rows="3"
      :class="commentError ? 'ring-1 ring-red-400' : ''"
    />
    <p
      v-if="commentError"
      class="mt-1 text-xs text-red-500"
    >
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
</template>

<script setup lang="ts">
defineProps<{
  commentPlaceholder: string
}>()

const comment = defineModel<string>('comment', { required: true })
const commentError = defineModel<string>('commentError', { required: true })

const emit = defineEmits<{
  submit: [action: 'approved' | 'changes-requested' | 'rejected']
}>()
</script>
