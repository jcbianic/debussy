import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomePage from '~/pages/index.vue'

// Stub NuxtLink as a simple anchor
const stubs = {
  NuxtLink: {
    template: '<a :href="to" v-bind="$attrs"><slot /></a>',
    props: ['to'],
  },
}

describe('Welcome Page (TS-013, TS-014, TS-015, FR-300)', () => {
  it('renders hero headline', () => {
    const wrapper = mount(WelcomePage, { global: { stubs } })
    const hero = wrapper.find('[data-testid="hero"]')
    expect(hero.exists()).toBe(true)
    expect(hero.text()).toContain('Orchestrate Claude Code sessions locally')
  })

  it('renders three feature callouts', () => {
    const wrapper = mount(WelcomePage, { global: { stubs } })
    const cards = wrapper.findAll('[data-testid="feature-card"]')
    expect(cards).toHaveLength(3)
    expect(cards[0].text()).toContain('Sessions')
    expect(cards[1].text()).toContain('Workflows')
    expect(cards[2].text()).toContain('Artifacts')
  })

  it('has New Session primary CTA', () => {
    const wrapper = mount(WelcomePage, { global: { stubs } })
    const cta = wrapper.find('[data-testid="cta-new-session"]')
    expect(cta.exists()).toBe(true)
    expect(cta.text()).toBe('New Session')
    expect(cta.attributes('href')).toBe('/sessions')
  })

  it('has View Workflows secondary CTA', () => {
    const wrapper = mount(WelcomePage, { global: { stubs } })
    const cta = wrapper.find('[data-testid="cta-view-workflows"]')
    expect(cta.exists()).toBe(true)
    expect(cta.text()).toBe('View Workflows')
    expect(cta.attributes('href')).toBe('/workflows')
  })

  it('renders responsive layout with flex/grid classes', () => {
    const wrapper = mount(WelcomePage, { global: { stubs } })
    const features = wrapper.find('[data-testid="features"]')
    expect(features.classes()).toContain('grid')
    expect(features.classes()).toContain('grid-cols-1')
    expect(features.classes()).toContain('sm:grid-cols-3')
  })
})
