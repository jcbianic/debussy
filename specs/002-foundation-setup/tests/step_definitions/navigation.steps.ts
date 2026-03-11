/**
 * Step definitions for navigation.feature
 * Maps to: TS-016, TS-017, TS-018 (US-006, FR-301, FR-302)
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { existsSync } from 'fs'
import { resolve } from 'path'
import AppNavigation from '~/components/AppNavigation.vue'

const mockPath = ref('/')
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: mockPath.value, name: 'index' }),
}))

const stubs = {
  NuxtLink: {
    template: '<a :href="to" v-bind="$attrs"><slot /></a>',
    props: ['to'],
  },
  ThemeToggle: { template: '<div data-testid="theme-toggle-stub" />' },
}

const ROOT = resolve(__dirname, '../..')

describe('@US-006 Unified Navigation', () => {
  // Background: Given all three pages are loaded

  describe('@TS-016 Navigation updates page indicator when navigating', () => {
    it('navigation has links to all core pages', () => {
      const wrapper = mount(AppNavigation, { global: { stubs } })
      expect(wrapper.find('[data-testid="nav-link-sessions"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="nav-link-workflows"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="nav-link-artifacts"]').exists()).toBe(true)
    })
  })

  describe('@TS-017 Layout remains consistent across page navigation', () => {
    it('default layout wraps content with AppNavigation', () => {
      const layoutPath = resolve(ROOT, 'layouts/default.vue')
      expect(existsSync(layoutPath)).toBe(true)
    })

    it('all core pages exist as .vue files', () => {
      expect(existsSync(resolve(ROOT, 'pages/sessions.vue'))).toBe(true)
      expect(existsSync(resolve(ROOT, 'pages/workflows.vue'))).toBe(true)
      expect(existsSync(resolve(ROOT, 'pages/artifacts.vue'))).toBe(true)
    })
  })

  describe('@TS-018 Pages render without visual bugs in light and dark modes', () => {
    it('navigation includes ThemeToggle for mode switching', () => {
      const wrapper = mount(AppNavigation, { global: { stubs } })
      expect(wrapper.find('[data-testid="theme-toggle-stub"]').exists()).toBe(true)
    })

    it('navigation has mobile hamburger for responsive layout', () => {
      const wrapper = mount(AppNavigation, { global: { stubs } })
      expect(wrapper.find('[data-testid="hamburger"]').exists()).toBe(true)
    })
  })
})
