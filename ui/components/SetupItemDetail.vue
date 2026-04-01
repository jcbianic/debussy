<template>
  <div class="flex flex-col overflow-hidden px-8 pt-6">
    <!-- Item header -->
    <div class="mb-5 flex flex-shrink-0 items-start justify-between">
      <div class="min-w-0 flex-1">
        <div class="mb-2 flex items-center gap-2">
          <UIcon
            :name="typeIcon(item.type)"
            class="size-5 flex-shrink-0"
            :class="typeColor(item.type)"
          />
          <h2 class="font-mono text-base font-semibold">
            {{ item.name }}
          </h2>
          <UBadge
            v-if="editable && !editing"
            label="editable"
            color="success"
            variant="subtle"
            size="xs"
          />
          <UBadge
            v-if="!editable && item.plugin"
            label="read-only"
            color="neutral"
            variant="subtle"
            size="xs"
          />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            :label="item.type"
            color="neutral"
            variant="subtle"
            size="xs"
          />
          <button
            v-if="item.plugin"
            class="cursor-pointer text-xs text-neutral-400 transition-colors hover:text-blue-500"
            @click="emit('selectByName', item.plugin!)"
          >
            from
            <span class="font-mono underline decoration-dotted">{{
              item.plugin
            }}</span>
          </button>
          <span
            v-if="item.version"
            class="text-content-ghost font-mono text-xs"
          >v{{ item.version }}</span>
          <UBadge
            v-if="item.scope"
            :label="item.scope"
            color="neutral"
            variant="outline"
            size="xs"
          />
        </div>
      </div>
      <div class="flex items-start gap-4">
        <!-- Action buttons for editable items -->
        <div
          v-if="editable && !editing"
          class="flex gap-1.5"
        >
          <UButton
            icon="i-heroicons-pencil-square"
            size="xs"
            color="neutral"
            variant="ghost"
            label="Edit"
            @click="startEditing"
          />
          <UButton
            icon="i-heroicons-trash"
            size="xs"
            color="error"
            variant="ghost"
            @click="confirmDelete"
          />
        </div>
        <div
          v-if="editing"
          class="flex gap-1.5"
        >
          <UButton
            icon="i-heroicons-check"
            size="xs"
            color="success"
            variant="soft"
            label="Save"
            :loading="saving"
            @click="save"
          />
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            label="Cancel"
            @click="cancelEditing"
          />
        </div>
        <div class="flex-shrink-0 text-right">
          <div
            class="text-2xl font-semibold tabular-nums"
            :class="usage > 0 ? 'text-content' : 'text-content-placeholder'"
          >
            {{ usage > 0 ? usage : '—' }}
          </div>
          <div class="text-xs text-neutral-400">
            {{ usage > 0 ? 'invocations' : 'no data yet' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Metadata -->
    <div
      v-if="meta.length"
      class="border-line bg-surface-tinted mb-5 flex flex-shrink-0 gap-8 rounded-lg border px-5 py-3.5"
    >
      <div
        v-for="m in meta"
        :key="m.label"
      >
        <div class="mb-0.5 text-xs text-neutral-400">
          {{ m.label }}
        </div>
        <div class="font-mono text-xs font-medium">
          {{ m.value }}
        </div>
      </div>
    </div>

    <!-- ════════════ EDIT MODE ════════════ -->
    <div
      v-if="editing"
      class="flex min-h-0 flex-1 flex-col pb-6"
    >
      <!-- Description -->
      <div class="mb-5 flex-shrink-0">
        <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
        <label
          for="edit-description"
          class="mb-2 block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
        >
          Description
        </label>
        <textarea
          id="edit-description"
          v-model="draft.description"
          aria-label="Description"
          rows="2"
          class="border-line bg-surface-tinted w-full rounded-lg border px-4 py-3 font-mono text-sm leading-relaxed focus:border-blue-500 focus:outline-none"
          placeholder="Short description of what this does..."
        />
      </div>

      <!-- Type-specific fields -->
      <template v-if="item.type === 'command'">
        <div class="mb-5 grid flex-shrink-0 grid-cols-2 gap-4">
          <div>
            <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
            <label
              for="edit-arg-hint"
              class="mb-2 block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Argument hint
            </label>
            <input
              id="edit-arg-hint"
              v-model="draft.argHint"
              class="border-line bg-surface-tinted w-full rounded-lg border px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none"
              placeholder="<arg>"
            >
          </div>
          <div>
            <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
            <label
              for="edit-allowed-tools"
              class="mb-2 block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Allowed tools
            </label>
            <input
              id="edit-allowed-tools"
              v-model="draft.allowedTools"
              class="border-line bg-surface-tinted w-full rounded-lg border px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Read, Grep, Glob"
            >
          </div>
        </div>
        <div class="mb-5 flex-shrink-0">
          <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
          <label
            for="edit-delegates-to"
            class="mb-2 block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Delegates to
          </label>
          <input
            id="edit-delegates-to"
            v-model="draft.delegatesTo"
            class="border-line bg-surface-tinted w-full rounded-lg border px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none"
            placeholder="skill-name"
          >
        </div>
      </template>

      <template v-if="item.type === 'agent'">
        <div class="mb-5 grid flex-shrink-0 grid-cols-2 gap-4">
          <div>
            <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
            <label
              for="edit-model"
              class="mb-2 block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Model
            </label>
            <input
              id="edit-model"
              v-model="draft.model"
              class="border-line bg-surface-tinted w-full rounded-lg border px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none"
              placeholder="sonnet"
            >
          </div>
          <div>
            <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
            <label
              for="edit-tools"
              class="mb-2 block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Tools
            </label>
            <input
              id="edit-tools"
              v-model="draft.tools"
              class="border-line bg-surface-tinted w-full rounded-lg border px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Read, Grep, Glob, Bash"
            >
          </div>
        </div>
      </template>

      <!-- Body / content -->
      <div class="flex min-h-0 flex-1 flex-col">
        <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
        <label
          for="edit-body"
          class="mb-2 block flex-shrink-0 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
        >
          {{
            item.type === 'skill'
              ? 'SKILL.md body'
              : item.type === 'agent'
                ? 'System prompt'
                : 'Content'
          }}
        </label>
        <textarea
          id="edit-body"
          v-model="draft.body"
          aria-label="Content"
          class="border-line bg-surface-tinted min-h-0 flex-1 resize-none rounded-lg border px-4 py-3 font-mono text-xs leading-relaxed focus:border-blue-500 focus:outline-none"
          placeholder="Markdown content..."
        />
      </div>
    </div>

    <!-- ════════════ READ MODE ════════════ -->
    <div
      v-else
      class="min-h-0 flex-1 overflow-y-auto pb-6"
    >
      <!-- Description -->
      <div
        v-if="item.description"
        class="mb-5"
      >
        <p class="text-content-secondary text-sm leading-relaxed">
          {{ item.description }}
        </p>
      </div>

      <!-- ── PLUGIN: provides grouped by type ── -->
      <template v-if="item.type === 'plugin'">
        <div
          v-for="group in pluginGroups"
          :key="group.type"
          class="mb-5"
        >
          <h3
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            {{ group.label }}
            <span class="font-normal opacity-60">{{ group.items.length }}</span>
          </h3>
          <div class="border-line overflow-hidden rounded-lg border">
            <button
              v-for="(provided, i) in group.items"
              :key="provided.id"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              :class="
                i < group.items.length - 1 ? 'border-line-subtle border-b' : ''
              "
              @click="emit('select', provided)"
            >
              <UIcon
                :name="typeIcon(provided.type)"
                class="size-3.5 flex-shrink-0"
                :class="typeColor(provided.type)"
              />
              <span class="text-content-secondary flex-1 font-mono text-xs">{{
                provided.name
              }}</span>
              <span
                v-if="provided.description"
                class="hidden max-w-xs truncate text-xs text-neutral-400 lg:block"
              >{{ provided.description }}</span>
              <span
                v-if="provided.usage > 0"
                class="ml-3 flex-shrink-0 text-xs text-neutral-400 tabular-nums"
              >{{ provided.usage }}×</span>
              <UIcon
                name="i-heroicons-chevron-right"
                class="text-content-ghost size-3 flex-shrink-0"
              />
            </button>
          </div>
        </div>
      </template>

      <!-- ── COMMAND: frontmatter + body ── -->
      <template v-if="item.type === 'command'">
        <div
          v-if="item.allowedTools"
          class="mb-5"
        >
          <h3
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Allowed tools
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tool in item.allowedTools.split(', ')"
              :key="tool"
              class="bg-surface-hover text-content-muted border-line-raised rounded border px-2 py-1 font-mono text-xs"
            >{{ tool }}</span>
          </div>
        </div>
        <div
          v-if="item.argHint"
          class="mb-5"
        >
          <h3
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Usage
          </h3>
          <code class="text-content-secondary font-mono text-sm">{{ item.name }} {{ item.argHint }}</code>
        </div>
        <div
          v-if="item.body"
          class="mb-5"
        >
          <h3
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Content
          </h3>
          <pre
            class="border-line text-content-secondary bg-surface-tinted overflow-x-auto rounded-lg border px-5 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap"
          >{{ item.body }}</pre>
        </div>
        <div
          v-if="item.delegatesTo"
          class="mb-5"
        >
          <h3
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Delegates to
          </h3>
          <button
            class="border-line flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
            @click="emit('selectByName', item.delegatesTo!)"
          >
            <UIcon
              name="i-heroicons-sparkles"
              class="size-3.5 text-violet-500"
            />
            <span class="text-content-secondary font-mono text-xs">{{
              item.delegatesTo
            }}</span>
            <UIcon
              name="i-heroicons-arrow-right"
              class="ml-1 size-3 text-neutral-400"
            />
          </button>
        </div>
      </template>

      <!-- ── SKILL: triggers + body + files ── -->
      <template v-if="item.type === 'skill'">
        <div
          v-if="item.triggers?.length"
          class="mb-5"
        >
          <h3
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Triggers on
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="t in item.triggers"
              :key="t"
              class="rounded border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
            >{{ t }}</span>
          </div>
        </div>
        <div
          v-if="item.body"
          class="mb-5"
        >
          <h3
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            SKILL.md
          </h3>
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="text-content-secondary"
            v-html="renderMarkdown(item.body)"
          />
          <!-- eslint-enable vue/no-v-html -->
        </div>
        <div
          v-if="item.files?.length"
          class="mb-5"
        >
          <h3
            class="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Files
            <span class="font-normal opacity-60">{{ item.files.length }}</span>
          </h3>
          <div class="border-line overflow-hidden rounded-lg border">
            <div
              v-for="(file, i) in item.files"
              :key="file.relativePath"
              :class="
                i < item.files.length - 1 ? 'border-line-subtle border-b' : ''
              "
            >
              <button
                class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                @click="toggleFile(file.relativePath)"
              >
                <UIcon
                  :name="
                    isFileExpanded(file.relativePath)
                      ? 'i-heroicons-chevron-down'
                      : 'i-heroicons-chevron-right'
                  "
                  class="size-3 flex-shrink-0 text-neutral-400"
                />
                <UIcon
                  name="i-heroicons-document-text"
                  class="size-3.5 flex-shrink-0 text-neutral-400"
                />
                <span class="text-content-secondary flex-1 font-mono text-xs">{{
                  file.relativePath
                }}</span>
                <span class="text-xs text-neutral-400 tabular-nums">{{ file.content.split('\n').length }} lines</span>
              </button>
              <div
                v-if="isFileExpanded(file.relativePath)"
                class="border-line-subtle border-t"
              >
                <pre
                  class="bg-surface-tinted overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap"
                >{{ file.content }}</pre>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── AGENT: model, tools, body ── -->
      <template v-if="item.type === 'agent'">
        <div
          v-if="item.model || item.tools"
          class="mb-5 flex flex-wrap gap-4"
        >
          <div v-if="item.model">
            <h3
              class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Model
            </h3>
            <UBadge
              :label="item.model"
              color="neutral"
              variant="subtle"
              size="sm"
            />
          </div>
          <div v-if="item.tools">
            <h3
              class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Tools
            </h3>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tool in item.tools.split(', ')"
                :key="tool"
                class="bg-surface-hover text-content-muted border-line-raised rounded border px-2 py-1 font-mono text-xs"
              >{{ tool }}</span>
            </div>
          </div>
        </div>
        <div
          v-if="item.body"
          class="mb-5"
        >
          <h3
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            System prompt
          </h3>
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="text-content-secondary"
            v-html="renderMarkdown(item.body)"
          />
          <!-- eslint-enable vue/no-v-html -->
        </div>
      </template>

      <!-- ── HOOK: fires on + command + implementation ── -->
      <template v-if="item.type === 'hook'">
        <div
          v-if="item.triggers?.length"
          class="mb-5"
        >
          <h3
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Fires on
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="t in item.triggers"
              :key="t"
              class="rounded border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
            >{{ t }}</span>
          </div>
        </div>
        <div
          v-if="item.body"
          class="mb-5"
        >
          <h3
            class="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Command
          </h3>
          <pre
            class="border-line text-content-secondary bg-surface-tinted overflow-x-auto rounded-lg border px-5 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap"
          >{{ item.body }}</pre>
        </div>
        <div
          v-if="item.files?.length"
          class="mb-5"
        >
          <h3
            class="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase"
          >
            Implementation
            <span class="font-normal opacity-60">{{ item.files.length }}</span>
          </h3>
          <div class="border-line overflow-hidden rounded-lg border">
            <div
              v-for="(file, i) in item.files"
              :key="file.relativePath"
              :class="
                i < item.files.length - 1 ? 'border-line-subtle border-b' : ''
              "
            >
              <button
                class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                @click="toggleFile(file.relativePath)"
              >
                <UIcon
                  :name="
                    isFileExpanded(file.relativePath)
                      ? 'i-heroicons-chevron-down'
                      : 'i-heroicons-chevron-right'
                  "
                  class="size-3 flex-shrink-0 text-neutral-400"
                />
                <UIcon
                  name="i-heroicons-document-text"
                  class="size-3.5 flex-shrink-0 text-neutral-400"
                />
                <span class="text-content-secondary flex-1 font-mono text-xs">{{
                  file.relativePath
                }}</span>
                <span class="text-xs text-neutral-400 tabular-nums">{{ file.content.split('\n').length }} lines</span>
              </button>
              <div
                v-if="isFileExpanded(file.relativePath)"
                class="border-line-subtle border-t"
              >
                <pre
                  class="bg-surface-tinted overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap"
                >{{ file.content }}</pre>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Delete confirmation modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <div class="p-6">
          <h3 class="mb-2 text-base font-semibold">
            Delete {{ item.name }}?
          </h3>
          <p class="text-content-secondary mb-5 text-sm">
            This will permanently remove the {{ item.type }} and its files from
            the project.
          </p>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              @click="showDeleteModal = false"
            />
            <UButton
              label="Delete"
              color="error"
              :loading="deleting"
              @click="doDelete"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { SetupItem } from '~/composables/useSetup'

const props = defineProps<{
  item: SetupItem
  usage: number
  meta: { label: string; value: string }[]
  pluginGroups: { type: string; label: string; items: SetupItem[] }[]
}>()

const emit = defineEmits<{
  select: [item: SetupItem]
  selectByName: [name: string]
  update: [id: string, payload: Record<string, unknown>, onDone: () => void]
  delete: [id: string]
}>()

const editable = computed(() => isEditable(props.item))

// ── Edit mode state ──
const editing = ref(false)
const saving = ref(false)
const draft = ref({
  description: '',
  body: '',
  argHint: '',
  allowedTools: '',
  delegatesTo: '',
  model: '',
  tools: '',
})

function startEditing() {
  draft.value = {
    description: props.item.description ?? '',
    body: props.item.body ?? '',
    argHint: props.item.argHint ?? '',
    allowedTools: props.item.allowedTools ?? '',
    delegatesTo: props.item.delegatesTo ?? '',
    model: props.item.model ?? '',
    tools: props.item.tools ?? '',
  }
  editing.value = true
}

function cancelEditing() {
  editing.value = false
}

async function save() {
  saving.value = true
  try {
    const payload: Record<string, unknown> = {
      type: props.item.type,
      description: draft.value.description || undefined,
      body: draft.value.body || undefined,
    }
    if (props.item.type === 'command') {
      payload.argHint = draft.value.argHint || undefined
      payload.allowedTools = draft.value.allowedTools || undefined
      payload.delegatesTo = draft.value.delegatesTo || undefined
    }
    if (props.item.type === 'agent') {
      payload.model = draft.value.model || undefined
      payload.tools = draft.value.tools || undefined
      payload.name = props.item.name
    }
    emit('update', props.item.id, payload, () => {
      editing.value = false
    })
  } finally {
    saving.value = false
  }
}

// ── Delete ──
const showDeleteModal = ref(false)
const deleting = ref(false)

function confirmDelete() {
  showDeleteModal.value = true
}

async function doDelete() {
  deleting.value = true
  try {
    emit('delete', props.item.id)
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

// ── File expand/collapse state ──
const expandedFiles = ref(new Set<string>())

function toggleFile(relativePath: string) {
  const next = new Set(expandedFiles.value)
  if (next.has(relativePath)) {
    next.delete(relativePath)
  } else {
    next.add(relativePath)
  }
  expandedFiles.value = next
}

function isFileExpanded(relativePath: string) {
  return expandedFiles.value.has(relativePath)
}

// Reset state when item changes
watch(
  () => props.item.id,
  () => {
    expandedFiles.value = new Set()
    editing.value = false
  }
)
</script>
