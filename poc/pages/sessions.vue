<template>
  <div class="p-6 h-full overflow-y-auto">
    <!-- Tabs -->
    <div class="flex gap-1 mb-6 border-b border-gray-800">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="
          activeTab === tab.id
            ? 'border-blue-500 text-white'
            : 'border-transparent text-gray-400 hover:text-gray-200'
        "
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span
          v-if="tab.count !== undefined"
          class="ml-1.5 text-xs bg-gray-800 px-1.5 py-0.5 rounded-full"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Sessions tab -->
    <div v-if="activeTab === 'sessions'" class="max-w-4xl">
      <p class="text-xs text-gray-500 font-mono mb-4">{{ sessions?.dir }}</p>
      <div v-if="!sessions" class="text-gray-500">Loading...</div>
      <div v-else-if="sessions.sessions.length === 0" class="text-gray-500">No sessions found.</div>
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="s in sessions.sessions"
          :key="s.id"
          :to="{ path: '/', query: { sessionId: s.id } }"
          class="block bg-[#16161e] border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-3 mb-2">
            <code class="text-xs text-blue-400 bg-gray-800 px-2 py-0.5 rounded">{{
              s.id.slice(0, 8)
            }}</code>
            <span
              v-if="s.gitBranch"
              class="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded"
            >
              {{ s.gitBranch }}
            </span>
            <span class="text-xs text-gray-500 ml-auto">{{ formatDate(s.lastModified) }}</span>
          </div>
          <p v-if="s.firstPrompt" class="text-sm text-gray-300 mb-1 line-clamp-2">
            {{ s.firstPrompt }}
          </p>
          <p v-if="s.summary" class="text-xs text-gray-500 italic line-clamp-1">
            {{ s.summary }}
          </p>
          <div class="flex items-center gap-4 mt-2 text-xs text-gray-600">
            <span>{{ s.messageCount }} messages</span>
            <span>{{ formatSize(s.size) }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Skills tab -->
    <div v-if="activeTab === 'skills'" class="max-w-4xl">
      <div v-if="!explorer" class="text-gray-500">Loading...</div>
      <div v-else class="space-y-3">
        <div
          v-for="skill in explorer.skills"
          :key="skill.path"
          class="bg-[#16161e] border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer"
          @click="toggleSkill(skill.path)"
        >
          <div class="flex items-center gap-3 mb-1">
            <span class="font-semibold text-sm">{{ skill.name }}</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded"
              :class="
                skill.source === 'project'
                  ? 'bg-blue-400/10 text-blue-400'
                  : 'bg-purple-400/10 text-purple-400'
              "
            >
              {{ skill.source }}
            </span>
            <span v-if="skill.version" class="text-[10px] text-gray-500">
              v{{ skill.version }}
            </span>
          </div>
          <p class="text-xs text-gray-400 line-clamp-2">{{ skill.description }}</p>
          <!-- Expanded file list -->
          <div v-if="expandedSkills.has(skill.path)" class="mt-3 pt-3 border-t border-gray-800">
            <div
              v-for="f in skill.files"
              :key="f"
              class="text-xs text-gray-500 font-mono py-0.5"
            >
              {{ f }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Markdown tab -->
    <div v-if="activeTab === 'markdown'" class="max-w-4xl">
      <div v-if="!explorer" class="text-gray-500">Loading...</div>
      <div v-else class="space-y-3">
        <div
          v-for="md in explorer.mdFiles"
          :key="md.path"
          class="bg-[#16161e] border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer"
          @click="toggleMd(md.path)"
        >
          <div class="flex items-center gap-3 mb-1">
            <span class="font-semibold text-sm">{{ md.name }}</span>
            <span class="text-[10px] text-gray-500 font-mono">{{ md.path }}</span>
            <span class="text-xs text-gray-600 ml-auto">{{ formatSize(md.size) }}</span>
          </div>
          <!-- Preview -->
          <div v-if="expandedMd.has(md.path)" class="mt-3 pt-3 border-t border-gray-800">
            <pre class="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">{{ md.preview }}</pre>
            <p v-if="md.size > 500" class="text-[10px] text-gray-600 mt-2 italic">
              ... truncated ({{ formatSize(md.size) }} total)
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeTab = ref('sessions')

const { data: sessions } = await useFetch('/api/sessions')
const { data: explorer } = await useFetch('/api/explorer')

const expandedSkills = ref(new Set<string>())
const expandedMd = ref(new Set<string>())

const tabs = computed(() => [
  { id: 'sessions', label: 'Sessions', count: sessions.value?.sessions?.length },
  { id: 'skills', label: 'Skills', count: explorer.value?.skills?.length },
  { id: 'markdown', label: 'Markdown', count: explorer.value?.mdFiles?.length },
])

function toggleSkill(path: string) {
  const next = new Set(expandedSkills.value)
  next.has(path) ? next.delete(path) : next.add(path)
  expandedSkills.value = next
}

function toggleMd(path: string) {
  const next = new Set(expandedMd.value)
  next.has(path) ? next.delete(path) : next.add(path)
  expandedMd.value = next
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
</script>
