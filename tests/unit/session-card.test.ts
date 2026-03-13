import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SessionCard from '~/components/SessionCard.vue'

const mockSession = {
  id: 'test-id-1',
  label: 'Test Session',
  status: 'idle' as const,
  createdAt: '2026-03-11T10:00:00Z',
  workflowCount: 2,
}

describe('SessionCard Component (FR-302)', () => {
  it('renders session label', () => {
    const wrapper = mount(SessionCard, { props: { session: mockSession } })
    expect(wrapper.text()).toContain('Test Session')
  })

  it('renders fallback label when none provided', () => {
    const wrapper = mount(SessionCard, {
      props: { session: { ...mockSession, label: undefined } },
    })
    expect(wrapper.text()).toContain('Untitled Session')
  })

  it('displays session status', () => {
    const wrapper = mount(SessionCard, { props: { session: mockSession } })
    const status = wrapper.find('[data-testid="session-status"]')
    expect(status.text()).toBe('idle')
  })

  it('emits select event on click', async () => {
    const wrapper = mount(SessionCard, { props: { session: mockSession } })
    await wrapper.find('[data-testid="session-card"]').trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual(['test-id-1'])
  })

  it('formats date from ISO string', () => {
    const wrapper = mount(SessionCard, { props: { session: mockSession } })
    // Just verify it renders some date text (locale-dependent)
    expect(wrapper.text()).toMatch(/2026/)
  })
})
