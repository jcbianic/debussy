// Vitest global setup for Vue component testing
// Stub Nuxt auto-imports used in server handlers
import { vi } from 'vitest'

vi.stubGlobal('defineEventHandler', (fn: Function) => fn)
vi.stubGlobal('getQuery', (event: any) => event?._query || {})
vi.stubGlobal('readBody', async (event: any) => event?._body || {})
vi.stubGlobal('createError', (opts: any) => {
  const err = new Error(opts.message || opts.statusMessage)
  ;(err as any).statusCode = opts.statusCode
  return err
})
vi.stubGlobal('setResponseStatus', (_event: any, _code: number) => {})
