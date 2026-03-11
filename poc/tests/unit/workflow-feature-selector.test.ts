/**
 * Component tests for WorkflowFeatureSelector.
 * T013: [TS-029]
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkflowFeatureSelector from '../../components/WorkflowFeatureSelector.vue'

describe('WorkflowFeatureSelector', () => {
  const features = [
    { id: '001-auth', name: 'Auth' },
    { id: '002-billing', name: 'Billing' },
  ]

  // TS-029: selector displayed when multiple features exist
  it('displays a select element when features are provided', () => {
    const wrapper = mount(WorkflowFeatureSelector, {
      props: { features, modelValue: null },
    })
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('lists all provided features as options', () => {
    const wrapper = mount(WorkflowFeatureSelector, {
      props: { features, modelValue: null },
    })
    const options = wrapper.findAll('option').filter(o => o.attributes('value'))
    expect(options).toHaveLength(2)
    const values = options.map(o => o.attributes('value'))
    expect(values).toContain('001-auth')
    expect(values).toContain('002-billing')
  })

  it('renders option text using feature name', () => {
    const wrapper = mount(WorkflowFeatureSelector, {
      props: { features, modelValue: null },
    })
    const options = wrapper.findAll('option').filter(o => o.attributes('value'))
    const texts = options.map(o => o.text())
    expect(texts).toContain('Auth')
    expect(texts).toContain('Billing')
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = mount(WorkflowFeatureSelector, {
      props: { features, modelValue: null },
    })
    const select = wrapper.find('select')
    await select.setValue('001-auth')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['001-auth'])
  })

  it('reflects modelValue as selected option', () => {
    const wrapper = mount(WorkflowFeatureSelector, {
      props: { features, modelValue: '002-billing' },
    })
    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.value).toBe('002-billing')
  })

  it('renders nothing (or empty) when features array is empty', () => {
    const wrapper = mount(WorkflowFeatureSelector, {
      props: { features: [], modelValue: null },
    })
    // Either no select or a select with no feature options
    const options = wrapper.findAll('option').filter(o => o.attributes('value'))
    expect(options).toHaveLength(0)
  })
})
