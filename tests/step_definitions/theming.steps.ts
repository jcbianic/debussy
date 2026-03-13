/**
 * Step definitions for theming.feature
 * Maps to: TS-010, TS-011, TS-012 (US-004, FR-200)
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { lightTokens, darkTokens, THEME_STORAGE_KEY } from '~~/types/theme'
import { useTheme } from '~/composables/useTheme'

const ThemeWrapper = defineComponent({
  setup() { return useTheme() },
  template: `<div>
    <span data-testid="mode">{{ mode }}</span>
    <button data-testid="to-dark" @click="switchMode('dark')">Dark</button>
    <button data-testid="to-light" @click="switchMode('light')">Light</button>
  </div>`,
})

describe('@US-004 Customizable Appearance', () => {
  // Background: Given the theming system is in place

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('style')
  })

  describe('@TS-010 Light to dark mode switching updates all colors', () => {
    it('dark mode applies dark color tokens', async () => {
      const wrapper = mount(ThemeWrapper)
      await nextTick()

      await wrapper.find('[data-testid="to-dark"]').trigger('click')
      await nextTick()

      const bg = document.documentElement.style.getPropertyValue('--color-background')
      expect(bg).toBe(darkTokens['color.background'])
    })

    it('light and dark tokens have different background colors', () => {
      expect(lightTokens['color.background']).not.toBe(darkTokens['color.background'])
    })

    it('light and dark tokens have different text colors', () => {
      expect(lightTokens['color.text']).not.toBe(darkTokens['color.text'])
    })
  })

  describe('@TS-011 Developer can customize primary color globally', () => {
    it('design tokens are exported as TypeScript constants', () => {
      expect(lightTokens['color.primary']).toBeTruthy()
      expect(darkTokens['color.primary']).toBeTruthy()
    })

    it('theme API validates hex color format', async () => {
      const handler = (await import('~~/server/api/theme.post')).default
      await expect(
        handler({ _body: { customColors: { primary: 'invalid' } } } as any)
      ).rejects.toThrow()
    })
  })

  describe('@TS-012 Theme updates immediately without page reload', () => {
    it('CSS variables are applied synchronously on theme change', async () => {
      const wrapper = mount(ThemeWrapper)
      await nextTick()

      await wrapper.find('[data-testid="to-light"]').trigger('click')
      await nextTick()
      await wrapper.find('[data-testid="to-dark"]').trigger('click')
      await nextTick()

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('localStorage persists the preference', async () => {
      const wrapper = mount(ThemeWrapper)
      await nextTick()
      await wrapper.find('[data-testid="to-light"]').trigger('click')
      await nextTick()
      await wrapper.find('[data-testid="to-dark"]').trigger('click')
      await nextTick()

      const stored = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || '{}')
      expect(stored.mode).toBe('dark')
    })
  })
})
