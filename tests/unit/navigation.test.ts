import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AppNavigation from '~/components/AppNavigation.vue'

// Mock vue-router's useRoute
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

describe('AppNavigation (TS-016, TS-017, TS-018, FR-301, FR-302)', () => {
  it('renders logo with link to home', () => {
    const wrapper = mount(AppNavigation, { global: { stubs } })
    const logo = wrapper.find('[data-testid="nav-logo"]')
    expect(logo.exists()).toBe(true)
    expect(logo.text()).toBe('Debussy')
    expect(logo.attributes('href')).toBe('/')
  })

  it('renders all navigation links', () => {
    const wrapper = mount(AppNavigation, { global: { stubs } })
    expect(wrapper.find('[data-testid="nav-link-index"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="nav-link-sessions"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="nav-link-workflows"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="nav-link-artifacts"]').exists()).toBe(true)
  })

  it('has hamburger menu for mobile', () => {
    const wrapper = mount(AppNavigation, { global: { stubs } })
    const hamburger = wrapper.find('[data-testid="hamburger"]')
    expect(hamburger.exists()).toBe(true)
  })

  it('toggles mobile menu on hamburger click', async () => {
    const wrapper = mount(AppNavigation, { global: { stubs } })

    expect(wrapper.find('[data-testid="mobile-menu"]').exists()).toBe(false)

    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    expect(wrapper.find('[data-testid="mobile-menu"]').exists()).toBe(true)

    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    expect(wrapper.find('[data-testid="mobile-menu"]').exists()).toBe(false)
  })

  it('includes ThemeToggle in desktop navigation', () => {
    const wrapper = mount(AppNavigation, { global: { stubs } })
    expect(wrapper.find('[data-testid="theme-toggle-stub"]').exists()).toBe(true)
  })
})
