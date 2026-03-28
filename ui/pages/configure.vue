<template>
  <div class="h-full overflow-y-auto py-12">
    <div class="mx-auto w-full max-w-lg">
      <!-- Success state -->
      <div
        v-if="submitted"
        class="text-center"
      >
        <div class="bg-surface border-line rounded-xl border p-10">
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
            </div>
          </div>
        </div>
      </div>

      <!-- Form state -->
      <template v-else>
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

          <!-- Strate toggles -->
          <div class="space-y-3">
            <div class="text-sm font-medium">
              Strates
            </div>

            <!-- Strategy toggle -->
            <button
              type="button"
              class="border-line-subtle hover:border-line flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
              :class="
                form.strategy ? 'border-primary-400/50 bg-primary-50/5' : ''
              "
              @click="form.strategy = !form.strategy"
            >
              <UCheckbox
                id="strate-strategy"
                :model-value="form.strategy"
              />
              <UIcon
                name="i-heroicons-map"
                class="text-content-faint size-4 flex-shrink-0"
              />
              <div class="min-w-0 flex-1 text-left">
                <span class="text-sm font-medium">Strategy</span>
                <span class="text-content-subtle ml-2 text-xs">vision, landscape, audiences, problems</span>
              </div>
            </button>

            <!-- Product toggle -->
            <button
              type="button"
              class="border-line-subtle hover:border-line flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
              :class="
                form.product ? 'border-primary-400/50 bg-primary-50/5' : ''
              "
              @click="form.product = !form.product"
            >
              <UCheckbox
                id="strate-product"
                :model-value="form.product"
              />
              <UIcon
                name="i-heroicons-cube"
                class="text-content-faint size-4 flex-shrink-0"
              />
              <div class="min-w-0 flex-1 text-left">
                <span class="text-sm font-medium">Product</span>
                <span class="text-content-subtle ml-2 text-xs">definition, positioning, intents</span>
              </div>
            </button>

            <!-- Engineering toggle -->
            <button
              type="button"
              class="border-line-subtle hover:border-line flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
              :class="
                form.engineering ? 'border-primary-400/50 bg-primary-50/5' : ''
              "
              @click="form.engineering = !form.engineering"
            >
              <UCheckbox
                id="strate-engineering"
                :model-value="form.engineering"
              />
              <UIcon
                name="i-heroicons-cpu-chip"
                class="text-content-faint size-4 flex-shrink-0"
              />
              <div class="min-w-0 flex-1 text-left">
                <span class="text-sm font-medium">Engineering</span>
                <span class="text-content-subtle ml-2 text-xs">policies, principles, decisions</span>
              </div>
            </button>

            <!-- Work — always on -->
            <div
              class="border-primary-400/50 bg-primary-50/5 flex items-center gap-3 rounded-lg border px-4 py-3"
            >
              <UIcon
                name="i-heroicons-wrench-screwdriver"
                class="text-primary-500 size-4 flex-shrink-0"
              />
              <div class="min-w-0 flex-1">
                <span class="text-sm font-medium">Work</span>
                <span class="text-content-faint ml-2 text-xs">always enabled</span>
              </div>
            </div>
          </div>

          <div class="border-line border-t" />

          <!-- Options -->
          <div class="space-y-3">
            <div class="text-sm font-medium">
              Options
            </div>

            <!-- Status line toggle -->
            <button
              type="button"
              class="border-line-subtle hover:border-line flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
              :class="
                form.statusline ? 'border-primary-400/50 bg-primary-50/5' : ''
              "
              @click="form.statusline = !form.statusline"
            >
              <UCheckbox
                id="option-statusline"
                :model-value="form.statusline"
              />
              <UIcon
                name="i-heroicons-bars-3-bottom-left"
                class="text-content-faint size-4 flex-shrink-0"
              />
              <div class="min-w-0 flex-1 text-left">
                <span class="text-sm font-medium">Status line</span>
                <span class="text-content-subtle ml-2 text-xs">branch, model, context bar, UI link</span>
              </div>
            </button>
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
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DEFAULT_STRATEGY_DEPTH,
  DEFAULT_ENGINEERING_DEPTH,
} from '~~/types/config'

const {
  name: existingName,
  description: existingDesc,
  strates: existingStrates,
  options: existingOptions,
  refresh: refreshConfig,
} = useProjectConfig()

const form = reactive({
  name: '',
  description: '',
  strategy: true,
  product: true,
  engineering: true,
  statusline: true,
})

// Pre-fill from existing config once loaded
watch(
  [existingName, existingDesc, existingStrates, existingOptions],
  ([n, d, s, o]) => {
    if (n && !form.name) form.name = n
    if (d && !form.description) form.description = d
    if (s) {
      if (s.strategy !== undefined) {
        form.strategy = typeof s.strategy === 'boolean' ? s.strategy : true
      }
      if (typeof s.product === 'boolean') {
        form.product = s.product
      }
      if (s.engineering !== undefined) {
        form.engineering =
          typeof s.engineering === 'boolean' ? s.engineering : true
      }
    }
    if (o && typeof o.statusline === 'boolean') {
      form.statusline = o.statusline
    }
  },
  { immediate: true }
)

const saving = ref(false)
const submitted = ref(false)
const error = ref('')

const enabledStrates = computed(() => {
  const result: string[] = []
  if (form.strategy) result.push('strategy')
  if (form.product) result.push('product')
  if (form.engineering) result.push('engineering')
  result.push('work')
  return result
})

async function handleSubmit() {
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/init/configure', {
      method: 'POST',
      body: {
        project: { name: form.name, description: form.description },
        options: { statusline: form.statusline },
        strates: {
          strategy: form.strategy ? { depth: DEFAULT_STRATEGY_DEPTH } : false,
          product: form.product,
          engineering: form.engineering
            ? { depth: DEFAULT_ENGINEERING_DEPTH }
            : false,
          work: true,
        },
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
