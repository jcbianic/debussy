/**
 * Vitest global setup: stub Nitro/H3 auto-imports so API handler files
 * can be imported in the Node test environment without a running Nitro server.
 */

// defineEventHandler: returns the handler function as-is (we don't call it in tests)
;(globalThis as any).defineEventHandler = (fn: (...args: unknown[]) => unknown) => fn

// getQuery: return the query object attached to the mock event
;(globalThis as any).getQuery = (event: any) => event?.query ?? {}

// createError: create a plain Error with statusCode attached
;(globalThis as any).createError = ({ statusCode, statusMessage }: { statusCode: number; statusMessage: string }) => {
  const err = new Error(statusMessage) as any
  err.statusCode = statusCode
  return err
}
