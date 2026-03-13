import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { lightTokens, darkTokens, defaultPreference, THEME_STORAGE_KEY } from '~~/types/theme'
import { useTheme } from '~/composables/useTheme'

const ThemeTestWrapper = defineComponent({
  setup() {
    return useTheme()
  },
  template: `<div>
    <span data-testid="mode">{{ mode }}</span>
    <span data-testid="resolved">{{ resolvedMode }}</span>
    <button data-testid="switch-dark" @click="switchMode('dark')">Dark</button>
    <button data-testid="switch-light" @click="switchMode('light')">Light</button>
    <button data-testid="switch-system" @click="switchMode('system')">System</button>
  </div>`,
})

describe('Theme System (TS-010, TS-011, TS-012, FR-200)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('style')
  })

  describe('Design Tokens (T015)', () => {
    it('light tokens have all required keys', () => {
      const keys = Object.keys(lightTokens)
      expect(keys).toContain('color.primary')
      expect(keys).toContain('color.secondary')
      expect(keys).toContain('color.background')
      expect(keys).toContain('color.text')
      expect(keys).toContain('color.border')
      expect(keys).toContain('font.size.base')
      expect(keys).toContain('spacing.md')
    })

    it('dark tokens override colors but keep fonts/spacing', () => {
      expect(darkTokens['color.background']).not.toBe(lightTokens['color.background'])
      expect(darkTokens['color.text']).not.toBe(lightTokens['color.text'])
      expect(darkTokens['font.size.base']).toBe(lightTokens['font.size.base'])
      expect(darkTokens['spacing.md']).toBe(lightTokens['spacing.md'])
    })

    it('all color tokens are valid hex', () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/
      for (const tokens of [lightTokens, darkTokens]) {
        for (const [key, value] of Object.entries(tokens)) {
          if (key.startsWith('color.')) {
            expect(value).toMatch(hexRegex)
          }
        }
      }
    })
  })

  describe('Default Preference', () => {
    it('defaults to system mode', () => {
      expect(defaultPreference.mode).toBe('system')
    })

    it('storage key is debussy:theme', () => {
      expect(THEME_STORAGE_KEY).toBe('debussy:theme')
    })
  })

  describe('useTheme Composable (T018)', () => {
    it('switches theme mode on button click', async () => {
      const wrapper = mount(ThemeTestWrapper)
      await nextTick()

      await wrapper.find('[data-testid="switch-dark"]').trigger('click')
      await nextTick()

      expect(wrapper.find('[data-testid="mode"]').text()).toBe('dark')
    })

    it('persists theme to localStorage', async () => {
      const wrapper = mount(ThemeTestWrapper)
      await nextTick()

      // Switch to light first (in case prior test left it as dark)
      await wrapper.find('[data-testid="switch-light"]').trigger('click')
      await nextTick()
      // Now switch to dark to trigger the watcher
      await wrapper.find('[data-testid="switch-dark"]').trigger('click')
      await nextTick()

      const stored = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || '{}')
      expect(stored.mode).toBe('dark')
    })

    it('applies data-theme attribute to document', async () => {
      const wrapper = mount(ThemeTestWrapper)
      await nextTick()

      await wrapper.find('[data-testid="switch-light"]').trigger('click')
      await nextTick()

      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('applies CSS variables to document root', async () => {
      const wrapper = mount(ThemeTestWrapper)
      await nextTick()

      await wrapper.find('[data-testid="switch-dark"]').trigger('click')
      await nextTick()

      const bg = document.documentElement.style.getPropertyValue('--color-background')
      expect(bg).toBe(darkTokens['color.background'])
    })
  })
})
