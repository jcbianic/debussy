/**
 * Step definitions for welcome-page.feature
 * Maps to: TS-013, TS-014, TS-015 (US-005, FR-300)
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomePage from '~/pages/index.vue'

const stubs = {
  NuxtLink: {
    template: '<a :href="to" v-bind="$attrs"><slot /></a>',
    props: ['to'],
  },
}

describe('@US-005 Polished First Impression', () => {
  describe('@TS-013 Welcome page displays headline and CTAs', () => {
    it('renders headline about Debussy', () => {
      const wrapper = mount(WelcomePage, { global: { stubs } })
      expect(wrapper.find('[data-testid="hero"]').text()).toContain('Orchestrate Claude Code')
    })

    it('renders three feature callouts', () => {
      const wrapper = mount(WelcomePage, { global: { stubs } })
      const cards = wrapper.findAll('[data-testid="feature-card"]')
      expect(cards).toHaveLength(3)
    })

    it('has primary CTA (New Session) and secondary CTA (View Workflows)', () => {
      const wrapper = mount(WelcomePage, { global: { stubs } })
      expect(wrapper.find('[data-testid="cta-new-session"]').text()).toBe('New Session')
      expect(wrapper.find('[data-testid="cta-view-workflows"]').text()).toBe('View Workflows')
    })
  })

  describe('@TS-014 New Session CTA navigates to session creation', () => {
    it('New Session link points to /sessions', () => {
      const wrapper = mount(WelcomePage, { global: { stubs } })
      const cta = wrapper.find('[data-testid="cta-new-session"]')
      expect(cta.attributes('href')).toBe('/sessions')
    })
  })

  describe('@TS-015 Welcome page is mobile-responsive', () => {
    it('feature grid uses responsive classes', () => {
      const wrapper = mount(WelcomePage, { global: { stubs } })
      const features = wrapper.find('[data-testid="features"]')
      expect(features.classes()).toContain('grid-cols-1')
      expect(features.classes()).toContain('sm:grid-cols-3')
    })

    it('CTAs stack on mobile with flex-col', () => {
      const wrapper = mount(WelcomePage, { global: { stubs } })
      const ctaContainer = wrapper.find('[data-testid="hero"]').find('.flex')
      expect(ctaContainer.classes()).toContain('flex-col')
      expect(ctaContainer.classes()).toContain('sm:flex-row')
    })
  })
})
