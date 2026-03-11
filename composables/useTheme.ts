import { ref, computed, onMounted, watch } from 'vue'
import type { ThemePreference } from '~/types/theme'
import { lightTokens, darkTokens, defaultPreference, THEME_STORAGE_KEY } from '~/types/theme'

const mode = ref<ThemePreference['mode']>('system')
const customColors = ref<ThemePreference['customColors']>({})

function getResolvedMode(): 'light' | 'dark' {
  if (mode.value === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }
  return mode.value
}

const resolvedMode = computed(() => getResolvedMode())

const tokens = computed(() => {
  const base = resolvedMode.value === 'dark' ? { ...darkTokens } : { ...lightTokens }
  if (customColors.value?.primary) base['color.primary'] = customColors.value.primary
  if (customColors.value?.secondary) base['color.secondary'] = customColors.value.secondary
  if (customColors.value?.background) base['color.background'] = customColors.value.background
  if (customColors.value?.text) base['color.text'] = customColors.value.text
  return base
})

function applyTokens(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-theme', resolvedMode.value)

  for (const [key, value] of Object.entries(tokens.value)) {
    const cssVar = `--${key.replace(/\./g, '-')}`
    root.style.setProperty(cssVar, value)
  }
}

function saveToStorage(): void {
  if (typeof localStorage === 'undefined') return
  const pref: ThemePreference = {
    mode: mode.value,
    customColors: customColors.value,
  }
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(pref))
}

function loadFromStorage(): void {
  if (typeof localStorage === 'undefined') return
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored) {
    const pref: ThemePreference = JSON.parse(stored)
    mode.value = pref.mode || defaultPreference.mode
    customColors.value = pref.customColors || {}
  }
}

export function useTheme() {
  onMounted(() => {
    loadFromStorage()
    applyTokens()

    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (mode.value === 'system') applyTokens()
      })
    }
  })

  watch([mode, customColors], () => {
    applyTokens()
    saveToStorage()
  }, { deep: true })

  function switchMode(newMode: ThemePreference['mode']): void {
    mode.value = newMode
  }

  function setColor(name: keyof NonNullable<ThemePreference['customColors']>, value: string): void {
    customColors.value = { ...customColors.value, [name]: value }
  }

  return {
    mode,
    resolvedMode,
    tokens,
    customColors,
    switchMode,
    setColor,
  }
}
