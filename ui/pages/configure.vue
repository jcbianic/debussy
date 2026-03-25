<template>
  <div class="flex h-full items-center justify-center">
    <!-- Success state -->
    <div
      v-if="submitted"
      class="w-full max-w-lg text-center"
    >
      <div class="bg-surface border-line mx-auto rounded-xl border p-10">
        <UIcon
          name="i-heroicons-check-circle"
          class="mx-auto mb-4 size-12 text-green-500"
        />
        <h1 class="mb-2 text-xl font-semibold">
          Configuration saved
        </h1>
        <p class="text-content-subtle mb-6 text-sm">
          <code class="text-xs">.debussy/config.yaml</code> has been written.
          Return to your terminal &mdash; scaffolding will continue
          automatically.
        </p>
        <div class="border-line-subtle rounded-lg border p-4 text-left">
          <div
            class="text-content-faint mb-2 text-xs font-medium tracking-wide uppercase"
          >
            Enabled strates
          </div>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="s in enabledStrates"
              :key="s"
              :label="s"
              color="success"
              variant="subtle"
              size="sm"
            />
            <span
              v-if="enabledStrates.length === 0"
              class="text-content-faint text-xs"
            >None selected</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Form state -->
    <div
      v-else
      class="w-full max-w-lg"
    >
      <div class="mb-6 flex items-center gap-3">
        <div
          class="bg-primary-500/10 flex size-10 items-center justify-center rounded-lg"
        >
          <UIcon
            name="i-heroicons-cog-6-tooth"
            class="text-primary-500 size-5"
          />
        </div>
        <div>
          <h1 class="text-lg leading-tight font-semibold">
            Project Configuration
          </h1>
          <p class="text-content-subtle text-sm">
            Identity and strates
          </p>
        </div>
      </div>

      <form
        class="bg-surface border-line space-y-6 rounded-xl border p-8"
        @submit.prevent="handleSubmit"
      >
        <!-- Project identity -->
        <div class="space-y-4">
          <div>
            <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
            <label class="mb-1.5 block text-sm font-medium">Project name</label>
            <UInput
              v-model="form.name"
              placeholder="My Project"
              size="lg"
              class="w-full"
              required
            />
          </div>
          <div>
            <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
            <label class="mb-1.5 block text-sm font-medium">Description</label>
            <UTextarea
              v-model="form.description"
              placeholder="One sentence describing what this project does"
              size="lg"
              class="w-full"
              :rows="3"
            />
          </div>
        </div>

        <div class="border-line border-t" />

        <!-- Strate selection -->
        <div>
          <div class="mb-1 text-sm font-medium">
            Strates
          </div>
          <p class="text-content-subtle mb-3 text-xs">
            Choose which strates Debussy should manage for this project.
          </p>
          <div class="space-y-2">
            <button
              v-for="strate in strateOptions"
              :key="strate.key"
              type="button"
              class="border-line-subtle hover:border-line flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
              :class="
                form.strates[strate.key]
                  ? 'border-primary-400/50 bg-primary-50/5'
                  : ''
              "
              @click="form.strates[strate.key] = !form.strates[strate.key]"
            >
              <UCheckbox
                :id="`strate-${strate.key}`"
                :model-value="form.strates[strate.key]"
              />
              <UIcon
                :name="strate.icon"
                class="text-content-faint size-4 flex-shrink-0"
              />
              <div class="min-w-0 flex-1 text-left">
                <span class="text-sm font-medium">{{ strate.label }}</span>
                <span class="text-content-subtle ml-2 text-xs">{{
                  strate.description
                }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Submit -->
        <UButton
          type="submit"
          label="Save configuration"
          icon="i-heroicons-check"
          size="lg"
          block
          :loading="saving"
        />

        <p
          v-if="error"
          class="text-center text-xs text-red-500"
        >
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StrateName, StrateConfig } from '~~/types/config'
import { DEFAULT_STRATES } from '~~/types/config'

const {
  name: existingName,
  description: existingDesc,
  strates: existingStrates,
  refresh: refreshConfig,
} = useProjectConfig()

const strateOptions: Array<{
  key: StrateName
  label: string
  icon: string
  description: string
}> = [
  {
    key: 'strategy',
    label: 'Strategy',
    icon: 'i-heroicons-eye',
    description:
      'What to build: vision, problems, product, landscape, feature space, and roadmap.',
  },
  {
    key: 'engineering',
    label: 'Engineering',
    icon: 'i-heroicons-wrench-screwdriver',
    description:
      'How to build it: policies, architectural principles, and decision records.',
  },
]

const form = reactive({
  name: '',
  description: '',
  strates: { ...DEFAULT_STRATES } as StrateConfig,
})

// Pre-fill from existing config once loaded
watch(
  [existingName, existingDesc, existingStrates],
  ([n, d, s]) => {
    if (n && !form.name) form.name = n
    if (d && !form.description) form.description = d
    if (s) {
      for (const key of Object.keys(DEFAULT_STRATES) as StrateName[]) {
        if (typeof s[key] === 'boolean') form.strates[key] = s[key]
      }
    }
  },
  { immediate: true }
)

const saving = ref(false)
const submitted = ref(false)
const error = ref('')

const enabledStrates = computed(() =>
  (Object.keys(form.strates) as StrateName[]).filter((k) => form.strates[k])
)

async function handleSubmit() {
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/init/configure', {
      method: 'POST',
      body: {
        project: { name: form.name, description: form.description },
        strates: form.strates,
      },
    })
    await refreshConfig()
    submitted.value = true
  } catch (e: unknown) {
    error.value =
      e instanceof Error ? e.message : 'Failed to save configuration'
  } finally {
    saving.value = false
  }
}
</script>
