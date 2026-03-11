/**
 * Component tests for phase status refresh behaviour.
 * T015: [TS-022, TS-023, TS-024, TS-025]
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkflowPhasePipeline from '../../components/WorkflowPhasePipeline.vue'
import type { Phase } from '../../server/utils/types'

const mockPhases: Phase[] = [
  { id: 'constitution', name: 'Constitution', status: 'complete', progress: null, optional: false },
  { id: 'spec', name: 'Spec', status: 'complete', progress: null, optional: false },
  { id: 'plan', name: 'Plan', status: 'not_started', progress: null, optional: false },
  { id: 'checklist', name: 'Checklist', status: 'not_started', progress: null, optional: false },
  { id: 'testify', name: 'Testify', status: 'not_started', progress: null, optional: false },
  { id: 'tasks', name: 'Tasks', status: 'not_started', progress: null, optional: false },
  { id: 'analyze', name: 'Analyze', status: 'not_started', progress: null, optional: false },
  { id: 'implement', name: 'Implement', status: 'not_started', progress: null, optional: false },
]

describe('WorkflowPhasePipeline refresh behaviour', () => {
  // TS-025: page provides a way to trigger phase status refresh
  it('has a refresh button', () => {
    const wrapper = mount(WorkflowPhasePipeline, {
      props: { phases: mockPhases, loading: false },
    })
    const refreshButton = wrapper.find('[data-testid="refresh-btn"]')
    expect(refreshButton.exists()).toBe(true)
  })

  // TS-025: triggers refresh event when button clicked
  it('emits refresh event when refresh button is clicked', async () => {
    const wrapper = mount(WorkflowPhasePipeline, {
      props: { phases: mockPhases, loading: false },
    })
    const refreshButton = wrapper.find('[data-testid="refresh-btn"]')
    await refreshButton.trigger('click')
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })

  // TS-022, TS-023, TS-024: fresh read reflects filesystem state
  it('re-renders with updated phases when props change', async () => {
    const wrapper = mount(WorkflowPhasePipeline, {
      props: { phases: mockPhases, loading: false },
    })

    // Initially plan is not_started
    const planCard = wrapper.find('[data-phase="plan"]')
    expect(planCard.exists()).toBe(true)
    expect(planCard.attributes('data-status')).toBe('not_started')

    // Update props to reflect filesystem change
    const updatedPhases = mockPhases.map(p =>
      p.id === 'plan' ? { ...p, status: 'complete' as const } : p,
    )
    await wrapper.setProps({ phases: updatedPhases })

    expect(wrapper.find('[data-phase="plan"]').attributes('data-status')).toBe('complete')
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(WorkflowPhasePipeline, {
      props: { phases: mockPhases, loading: true },
    })
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  })
})
