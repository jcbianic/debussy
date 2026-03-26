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
          </div>
        </div>
      </div>
    </div>

    <!-- Form state -->
    <div
      v-else
      class="w-full max-w-2xl"
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

        <!-- Strategy depth selection -->
        <div>
          <div class="mb-1 text-sm font-medium">
            Strategy depth
          </div>
          <p class="text-content-subtle mb-3 text-xs">
            How deep should your strategy documentation go? You can always
            deepen later.
          </p>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="depth in strategyDepthOptions"
              :key="depth.key"
              type="button"
              class="border-line-subtle hover:border-line flex cursor-pointer flex-col rounded-lg border p-4 text-left transition-colors"
              :class="
                form.strategyDepth === depth.key
                  ? 'border-primary-400/50 bg-primary-50/5 ring-primary-400/30 ring-1'
                  : ''
              "
              @click="form.strategyDepth = depth.key"
            >
              <div class="mb-2 flex items-center gap-2">
                <UIcon
                  :name="depth.icon"
                  class="size-4"
                  :class="
                    form.strategyDepth === depth.key
                      ? 'text-primary-500'
                      : 'text-content-faint'
                  "
                />
                <span class="text-sm font-semibold">{{ depth.label }}</span>
              </div>
              <p class="text-content-subtle mb-3 text-xs leading-relaxed">
                {{ depth.description }}
              </p>
              <div class="mt-auto space-y-1">
                <div
                  v-for="doc in depth.documents"
                  :key="doc"
                  class="text-content-faint flex items-center gap-1.5 font-mono text-[10px]"
                >
                  <span class="text-content-subtle">&#8226;</span>
                  {{ doc }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="border-line border-t" />

        <!-- Product strate toggle -->
        <div>
          <div class="mb-1 text-sm font-medium">
            Product
          </div>
          <p class="text-content-subtle mb-3 text-xs">
            Product definition, positioning, and roadmap intents.
          </p>
          <button
            type="button"
            class="border-line-subtle hover:border-line flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
            :class="form.product ? 'border-primary-400/50 bg-primary-50/5' : ''"
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
              <span class="text-sm font-medium">Enable product strate</span>
            </div>
          </button>
        </div>

        <div class="border-line border-t" />

        <!-- Engineering depth selection -->
        <div>
          <div class="mb-1 text-sm font-medium">
            Engineering depth
          </div>
          <p class="text-content-subtle mb-3 text-xs">
            How much engineering governance do you need? You can always deepen
            later.
          </p>
          <div class="mb-3 flex items-center gap-2">
            <UCheckbox
              id="strate-engineering-toggle"
              :model-value="form.engineeringEnabled"
              @update:model-value="form.engineeringEnabled = Boolean($event)"
            />
            <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
            <label
              for="strate-engineering-toggle"
              class="cursor-pointer text-sm font-medium"
            >
              Enable engineering strate
            </label>
          </div>
          <div
            v-if="form.engineeringEnabled"
            class="grid grid-cols-3 gap-3"
          >
            <button
              v-for="depth in engineeringDepthOptions"
              :key="depth.key"
              type="button"
              class="border-line-subtle hover:border-line flex cursor-pointer flex-col rounded-lg border p-4 text-left transition-colors"
              :class="
                form.engineeringDepth === depth.key
                  ? 'border-primary-400/50 bg-primary-50/5 ring-primary-400/30 ring-1'
                  : ''
              "
              @click="form.engineeringDepth = depth.key"
            >
              <div class="mb-2 flex items-center gap-2">
                <UIcon
                  :name="depth.icon"
                  class="size-4"
                  :class="
                    form.engineeringDepth === depth.key
                      ? 'text-primary-500'
                      : 'text-content-faint'
                  "
                />
                <span class="text-sm font-semibold">{{ depth.label }}</span>
              </div>
              <p class="text-content-subtle mb-3 text-xs leading-relaxed">
                {{ depth.description }}
              </p>
              <div class="mt-auto space-y-1">
                <div
                  v-for="doc in depth.documents"
                  :key="doc"
                  class="text-content-faint flex items-center gap-1.5 font-mono text-[10px]"
                >
                  <span class="text-content-subtle">&#8226;</span>
                  {{ doc }}
                </div>
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
import type { StrategyDepth, EngineeringDepth } from '~~/types/config'
import {
  DEFAULT_STRATEGY_DEPTH,
  DEFAULT_ENGINEERING_DEPTH,
  resolveStrategyDepth,
  resolveEngineeringDepth,
} from '~~/types/config'

const {
  name: existingName,
  description: existingDesc,
  strates: existingStrates,
  strategyDepth: existingStrategyDepth,
  engineeringDepth: existingEngineeringDepth,
  refresh: refreshConfig,
} = useProjectConfig()

const strategyDepthOptions: Array<{
  key: StrategyDepth
  label: string
  icon: string
  description: string
  documents: string[]
}> = [
  {
    key: 'pitch',
    label: 'Pitch',
    icon: 'i-heroicons-bolt',
    description:
      'One document that tells the whole story. For side-projects and hackathons.',
    documents: ['pitch.md'],
  },
  {
    key: 'foundation',
    label: 'Foundation',
    icon: 'i-heroicons-building-office',
    description:
      'Separate vision, problem space, and landscape. For serious projects.',
    documents: ['vision.md', 'problem-space.md', 'landscape.md'],
  },
  {
    key: 'full',
    label: 'Full',
    icon: 'i-heroicons-globe-alt',
    description:
      'Complete strategy with competitive analysis and opportunity mapping.',
    documents: [
      'vision.md',
      'strategy.md',
      'audiences.md',
      'problems.md',
      'landscape.md',
      'competitors/',
      'allies/',
      'opportunities.md',
    ],
  },
]

const engineeringDepthOptions: Array<{
  key: EngineeringDepth
  label: string
  icon: string
  description: string
  documents: string[]
}> = [
  {
    key: 'lite',
    label: 'Lite',
    icon: 'i-heroicons-shield-check',
    description:
      'Agent policies only. Guide agent behavior with lightweight rules.',
    documents: ['policies/'],
  },
  {
    key: 'standard',
    label: 'Standard',
    icon: 'i-heroicons-building-library',
    description:
      'Policies plus architectural principles. For serious projects.',
    documents: ['policies/', 'principles.md'],
  },
  {
    key: 'full',
    label: 'Full',
    icon: 'i-heroicons-document-magnifying-glass',
    description: 'Full governance with decision records. For team projects.',
    documents: ['policies/', 'principles.md', 'decisions/'],
  },
]

const form = reactive({
  name: '',
  description: '',
  strategyDepth: DEFAULT_STRATEGY_DEPTH as StrategyDepth,
  product: true,
  engineeringEnabled: true,
  engineeringDepth: DEFAULT_ENGINEERING_DEPTH as EngineeringDepth,
})

// Pre-fill from existing config once loaded
watch(
  [
    existingName,
    existingDesc,
    existingStrates,
    existingStrategyDepth,
    existingEngineeringDepth,
  ],
  ([n, d, s, sDepth, eDepth]) => {
    if (n && !form.name) form.name = n
    if (d && !form.description) form.description = d
    if (s) {
      if (s.strategy !== undefined) {
        form.strategyDepth = resolveStrategyDepth(s.strategy)
      }
      if (typeof s.product === 'boolean') {
        form.product = s.product
      }
      if (s.engineering !== undefined) {
        form.engineeringEnabled =
          typeof s.engineering === 'boolean' ? s.engineering : true
        form.engineeringDepth = resolveEngineeringDepth(s.engineering)
      }
    }
    if (sDepth) form.strategyDepth = sDepth
    if (eDepth) form.engineeringDepth = eDepth
  },
  { immediate: true }
)

const saving = ref(false)
const submitted = ref(false)
const error = ref('')

const enabledStrates = computed(() => {
  const result: string[] = [`strategy (${form.strategyDepth})`]
  if (form.product) result.push('product')
  if (form.engineeringEnabled)
    result.push(`engineering (${form.engineeringDepth})`)
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
        strates: {
          strategy: { depth: form.strategyDepth },
          product: form.product,
          engineering: form.engineeringEnabled
            ? { depth: form.engineeringDepth }
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
