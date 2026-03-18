<template>
  <div class="min-h-screen transition-colors dark:bg-slate-950 dark:text-slate-100">
    <!-- Header with Controls -->
    <header class="border-b border-gray-200 dark:border-slate-800">
      <div class="mx-auto max-w-2xl px-6 py-8 sm:px-8 flex justify-between items-start">
        <div>
          <h1 class="text-4xl font-bold">Debussy</h1>
          <p class="mt-3 text-lg italic text-gray-600 dark:text-slate-400">{{ $t('tagline') }}</p>
          <p class="mt-6 text-base text-gray-700 dark:text-slate-300 leading-relaxed">
            {{ $t('description') }}
          </p>
        </div>

        <!-- Controls -->
        <div class="flex gap-2">
          <!-- Color Mode Toggle -->
          <button
            @click="toggleColorMode"
            class="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            :title="isDark ? 'Light mode' : 'Dark mode'"
          >
            <svg v-if="isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.293 2.293a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828 2.829a1 1 0 11-1.415-1.414l.707-.707a1 1 0 011.415 1.414l-.707.707zm2.828 2.828a1 1 0 100-2h-1a1 1 0 100 2h1zm0 2.828a1 1 0 11-1.414-1.414l.707-.707a1 1 0 11 1.414 1.414l-.707.707zM4.464 4.465a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828-2.829a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zm4.243 12.122a6 6 0 11.707-11.314l.707.707a1 1 0 001.414-1.414l-.707-.707a8 8 0 10-.707 13.728l.707-.707a1 1 0 00-1.414-1.414l-.707.707z" clip-rule="evenodd"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
          </button>

          <!-- Language Switcher -->
          <div class="flex gap-1">
            <button
              v-for="loc in locales"
              :key="loc.code"
              @click="switchLocale(loc.code)"
              :class="[
                'px-2 py-1 rounded text-sm transition-colors',
                locale === loc.code
                  ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-black'
                  : 'hover:bg-gray-100 dark:hover:bg-slate-800'
              ]"
            >
              {{ loc.code.toUpperCase() }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-2xl px-6 py-16 sm:px-8">
      <!-- Problems Section -->
      <section class="mb-20">
        <h2 class="text-2xl font-bold mb-12">{{ $t('problem') }}</h2>

        <div class="space-y-10">
          <div>
            <h3 class="font-semibold text-base mb-3">{{ $t('problem1') }}</h3>
            <p class="text-gray-700 dark:text-slate-400 leading-relaxed">
              {{ $t('problem1_desc') }}
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-base mb-3">{{ $t('problem2') }}</h3>
            <p class="text-gray-700 dark:text-slate-400 leading-relaxed">
              {{ $t('problem2_desc') }}
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-base mb-3">{{ $t('problem3') }}</h3>
            <p class="text-gray-700 dark:text-slate-400 leading-relaxed">
              {{ $t('problem3_desc') }}
            </p>
          </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section class="mb-20 border-t border-gray-200 dark:border-slate-800 pt-16">
        <h2 class="text-2xl font-bold mb-12">{{ $t('skills') }}</h2>

        <div class="space-y-12">
          <div>
            <h3 class="font-semibold text-base mb-3">{{ $t('feedback') }}</h3>
            <p class="text-gray-700 dark:text-slate-400 leading-relaxed mb-4">
              {{ $t('feedback_desc') }}
            </p>
            <div class="bg-gray-50 dark:bg-slate-900 px-4 py-3 rounded border border-gray-200 dark:border-slate-700 font-mono text-sm text-gray-800 dark:text-slate-200">
              /feedback request.json
            </div>
          </div>

          <div>
            <h3 class="font-semibold text-base mb-3">{{ $t('workflow_run') }}</h3>
            <p class="text-gray-700 dark:text-slate-400 leading-relaxed mb-4">
              {{ $t('workflow_run_desc') }}
            </p>
            <div class="bg-gray-50 dark:bg-slate-900 px-4 py-3 rounded border border-gray-200 dark:border-slate-700 font-mono text-sm text-gray-800 dark:text-slate-200">
              /workflow-run workflow.yml
            </div>
          </div>
        </div>
      </section>

      <!-- Install Section -->
      <section class="border-t border-gray-200 dark:border-slate-800 pt-16">
        <h2 class="text-2xl font-bold mb-8">{{ $t('install') }}</h2>

        <div class="bg-gray-50 dark:bg-slate-900 px-6 py-4 rounded border border-gray-200 dark:border-slate-700 font-mono text-sm text-gray-800 dark:text-slate-200 overflow-x-auto mb-6">
          <div>git clone https://github.com/jcbianic/debussy</div>
          <div>cd debussy</div>
          <div>npm link</div>
        </div>

        <p class="text-gray-700 dark:text-slate-400 leading-relaxed">
          The plugin installs two skills: <code class="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">feedback</code> and <code class="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">workflow-run</code>. Use them with the commands above.
        </p>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-slate-800">
      <div class="mx-auto max-w-2xl px-6 py-12 sm:px-8">
        <p class="text-sm text-gray-600 dark:text-slate-400">
          <ULink to="https://github.com/jcbianic/debussy" target="_blank" class="underline hover:no-underline">
            {{ $t('repository') }}
          </ULink>
          <span class="mx-2 text-gray-400">·</span>
          <ULink to="https://github.com/jcbianic/debussy/blob/main/README.md" target="_blank" class="underline hover:no-underline">
            {{ $t('readme') }}
          </ULink>
        </p>
        <p class="mt-6 text-xs text-gray-500 dark:text-slate-600">{{ $t('copyright') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { locale, locales, setLocale } = useI18n()

const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const switchLocale = (lang: string) => {
  setLocale(lang)
}
</script>
