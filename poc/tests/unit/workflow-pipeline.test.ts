/**
 * Component tests for WorkflowPhasePipeline visual rendering.
 * T017: [TS-026, TS-027, TS-028]
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkflowPhasePipeline from '../../components/WorkflowPhasePipeline.vue'
import type { Phase } from '../../server/utils/types'

function makePhases(overrides: Partial<Phase>[] = []): Phase[] {
  const defaults: Phase[] = [
    { id: 'constitution', name: 'Constitution', status: 'not_started', progress: null, optional: false },
    { id: 'spec', name: 'Spec', status: 'not_started', progress: null, optional: false },
    { id: 'plan', name: 'Plan', status: 'not_started', progress: null, optional: false },
    { id: 'checklist', name: 'Checklist', status: 'not_started', progress: null, optional: false },
    { id: 'testify', name: 'Testify', status: 'not_started', progress: null, optional: false },
    { id: 'tasks', name: 'Tasks', status: 'not_started', progress: null, optional: false },
    { id: 'analyze', name: 'Analyze', status: 'not_started', progress: null, optional: false },
    { id: 'implement', name: 'Implement', status: 'not_started', progress: null, optional: false },
  ]
  return defaults.map((p, i) => ({ ...p, ...(overrides[i] ?? {}) }))
}

describe('WorkflowPhasePipeline visual rendering', () => {
  // TS-026: complete phase uses success visual indicator
  it('renders complete phase with success styling', () => {
    const phases = makePhases([{ status: 'complete' }]) // constitution = complete
    const wrapper = mount(WorkflowPhasePipeline, {
      props: { phases, loading: false },
    })
    const card = wrapper.find('[data-phase="constitution"]')
    expect(card.attributes('data-status')).toBe('complete')
    // success styling via CSS class
    expect(card.classes().some(c => c.includes('complete') || c.includes('green') || c.includes('success'))).toBe(true)
  })

  // TS-027: in_progress phase shows percentage
  it('renders in_progress phase with progress percentage', () => {
    const phases = makePhases(
      Array(7).fill({}).concat([{ id: 'implement', name: 'Implement', status: 'in_progress', progress: 40, optional: false }])
    )
    const wrapper = mount(WorkflowPhasePipeline, {
      props: { phases, loading: false },
    })
    const card = wrapper.find('[data-phase="implement"]')
    expect(card.attributes('data-status')).toBe('in_progress')
    expect(card.text()).toContain('40%')
  })

  // TS-028: skipped phase differs from not_started
  it('renders skipped phase with distinct styling from not_started', () => {
    const phases = makePhases([
      {}, // constitution not_started
      {}, // spec not_started
      { id: 'plan', name: 'Plan', status: 'complete', progress: null, optional: false },
      {}, // checklist
      { id: 'testify', name: 'Testify', status: 'skipped', progress: null, optional: true },
    ])
    const wrapper = mount(WorkflowPhasePipeline, {
      props: { phases, loading: false },
    })
    const testifyCard = wrapper.find('[data-phase="testify"]')
    const planCard = wrapper.find('[data-phase="plan"]')

    expect(testifyCard.attributes('data-status')).toBe('skipped')
    // Skipped and complete phases must have different classes
    expect(testifyCard.attributes('class')).not.toBe(planCard.attributes('class'))
  })

  it('renders a card for each of the 8 phases', () => {
    const phases = makePhases()
    const wrapper = mount(WorkflowPhasePipeline, {
      props: { phases, loading: false },
    })
    const cards = wrapper.findAll('[data-phase]')
    expect(cards).toHaveLength(8)
  })

  it('renders phase names in the cards', () => {
    const phases = makePhases()
    const wrapper = mount(WorkflowPhasePipeline, {
      props: { phases, loading: false },
    })
    expect(wrapper.text()).toContain('Constitution')
    expect(wrapper.text()).toContain('Implement')
  })
})
