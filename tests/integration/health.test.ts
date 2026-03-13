import { describe, it, expect, vi } from 'vitest'

// Mock Nuxt's defineEventHandler to extract the handler function
vi.stubGlobal('defineEventHandler', (fn: Function) => fn)

describe('Health Check Endpoint (TS-001, FR-100)', () => {
  it('returns ok status with timestamp', async () => {
    const handler = (await import('../../server/api/health.get')).default
    const result = handler({} as any)

    expect(result).toHaveProperty('status', 'ok')
    expect(result).toHaveProperty('timestamp')
    expect(typeof result.timestamp).toBe('string')
  })

  it('timestamp is valid ISO 8601', async () => {
    const handler = (await import('../../server/api/health.get')).default
    const result = handler({} as any)
    const date = new Date(result.timestamp)
    expect(date.toISOString()).toBe(result.timestamp)
  })
})
