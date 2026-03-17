<template>
  <div>
    <!-- Header -->
    <header class="border-b border-gray-200">
      <div class="mx-auto max-w-2xl px-6 py-16 sm:px-8">
        <h1 class="text-4xl font-bold">Debussy</h1>
        <p class="mt-3 text-lg italic text-gray-600">if you ever want to get formal with Claude</p>
        <p class="mt-6 text-base text-gray-700 leading-relaxed">
          A Claude Code plugin that formalizes workflows, reviews, and parallel work.
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-2xl px-6 py-16 sm:px-8">
      <!-- Problems Section -->
      <section class="mb-20">
        <h2 class="text-2xl font-bold mb-12">The Problem</h2>

        <div class="space-y-10">
          <div>
            <h3 class="font-semibold text-base mb-3">1. Review UX</h3>
            <p class="text-gray-700 leading-relaxed">
              Reading through checklists while typing responses is friction-heavy. You need a clean UI to review items one by one and produce structured answers with minimal effort.
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-base mb-3">2. Workflow Monitoring</h3>
            <p class="text-gray-700 leading-relaxed">
              Long workflows running unattended leave you in the dark. You need clear visibility into progress and your position within a multi-step process at any time.
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-base mb-3">3. Parallel Work</h3>
            <p class="text-gray-700 leading-relaxed">
              Juggling multiple subjects in one session creates conflicts. You need isolated lanes to work on different things simultaneously without making a mess.
            </p>
          </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section class="mb-20 border-t border-gray-200 pt-16">
        <h2 class="text-2xl font-bold mb-12">Skills</h2>

        <div class="space-y-12">
          <div>
            <h3 class="font-semibold text-base mb-3">Feedback</h3>
            <p class="text-gray-700 leading-relaxed mb-4">
              Collect structured user feedback via an interactive browser UI. Present items, let users approve, reject, or discuss each one, get back structured responses.
            </p>
            <div class="bg-gray-50 px-4 py-3 rounded border border-gray-200 font-mono text-sm text-gray-800">
              /feedback request.json
            </div>
          </div>

          <div>
            <h3 class="font-semibold text-base mb-3">Workflow-Run</h3>
            <p class="text-gray-700 leading-relaxed mb-4">
              Execute multi-step workflows with interactive review gates. Run steps, collect artifacts, present review UI, block on user decisions.
            </p>
            <div class="bg-gray-50 px-4 py-3 rounded border border-gray-200 font-mono text-sm text-gray-800">
              /workflow-run workflow.yml
            </div>
          </div>
        </div>
      </section>

      <!-- Install Section -->
      <section class="border-t border-gray-200 pt-16">
        <h2 class="text-2xl font-bold mb-8">Install</h2>

        <div class="bg-gray-50 px-6 py-4 rounded border border-gray-200 font-mono text-sm text-gray-800 overflow-x-auto mb-6">
          <div>git clone https://github.com/jcbianic/debussy</div>
          <div>cd debussy</div>
          <div>npm link</div>
        </div>

        <p class="text-gray-700 leading-relaxed">
          The plugin installs two skills: <code class="bg-gray-100 px-2 py-1 rounded text-sm">feedback</code> and <code class="bg-gray-100 px-2 py-1 rounded text-sm">workflow-run</code>. Use them with the commands above.
        </p>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200">
      <div class="mx-auto max-w-2xl px-6 py-12 sm:px-8">
        <p class="text-sm text-gray-600">
          <ULink to="https://github.com/jcbianic/debussy" target="_blank" class="underline hover:no-underline">
            Repository
          </ULink>
          <span class="mx-2 text-gray-400">·</span>
          <ULink to="https://github.com/jcbianic/debussy/blob/main/README.md" target="_blank" class="underline hover:no-underline">
            README
          </ULink>
        </p>
        <p class="mt-6 text-xs text-gray-500">© 2026 Debussy. MIT License.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Empty for now
</script>
