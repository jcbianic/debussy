import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'

// Example component for testing patterns
const Counter = defineComponent({
  props: {
    initial: { type: Number, default: 0 },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const count = ref(props.initial)
    const increment = () => {
      count.value++
      emit('update', count.value)
    }
    return { count, increment }
  },
  template: `<div>
    <span data-testid="count">{{ count }}</span>
    <button @click="increment">+</button>
  </div>`,
})

describe('Example Unit Test Patterns (TS-004, TS-006)', () => {
  describe('Component Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(Counter)
      expect(wrapper.find('[data-testid="count"]').text()).toBe('0')
    })

    it('renders with custom initial value', () => {
      const wrapper = mount(Counter, { props: { initial: 5 } })
      expect(wrapper.find('[data-testid="count"]').text()).toBe('5')
    })
  })

  describe('User Interaction', () => {
    it('increments count on button click', async () => {
      const wrapper = mount(Counter)
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('[data-testid="count"]').text()).toBe('1')
    })

    it('emits update event with new value', async () => {
      const wrapper = mount(Counter)
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('update')).toHaveLength(1)
      expect(wrapper.emitted('update')![0]).toEqual([1])
    })
  })

  describe('Async Operations', () => {
    it('handles async assertions', async () => {
      const fetchData = () => Promise.resolve({ items: [1, 2, 3] })
      const data = await fetchData()
      expect(data.items).toHaveLength(3)
    })
  })
})
