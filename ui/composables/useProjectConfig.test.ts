import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockFetchData = ref<{
  name?: string
  path?: string
  strates?: Record<string, boolean>
} | null>(null)

mockNuxtImport('useFetch', () => {
  return () => ({ data: mockFetchData })
})

// Import after mocking
const { useProjectConfig } = await import('./useProjectConfig')

describe('useProjectConfig', () => {
  it('returns name from API response', () => {
    mockFetchData.value = { name: 'my-project', path: '/foo/bar' }
    const { name } = useProjectConfig()
    expect(name.value).toBe('my-project')
  })

  it('returns path from API response', () => {
    mockFetchData.value = { name: 'x', path: '/some/path' }
    const { path } = useProjectConfig()
    expect(path.value).toBe('/some/path')
  })

  it('returns empty string for name when data is null', () => {
    mockFetchData.value = null
    const { name } = useProjectConfig()
    expect(name.value).toBe('')
  })

  it('returns empty string for path when data is null', () => {
    mockFetchData.value = null
    const { path } = useProjectConfig()
    expect(path.value).toBe('')
  })

  it('isStrateEnabled returns true for enabled strate', () => {
    mockFetchData.value = {
      name: 'x',
      path: '/',
      strates: { strategy: true, engineering: false },
    }
    const { isStrateEnabled } = useProjectConfig()
    expect(isStrateEnabled('strategy')).toBe(true)
    expect(isStrateEnabled('engineering')).toBe(false)
  })

  it('returns all strates enabled by default when data is null', () => {
    mockFetchData.value = null
    const { isStrateEnabled } = useProjectConfig()
    expect(isStrateEnabled('strategy')).toBe(true)
    expect(isStrateEnabled('engineering')).toBe(true)
  })
})
