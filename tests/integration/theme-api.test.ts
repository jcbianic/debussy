import { describe, it, expect } from 'vitest'

describe('Theme API (FR-200, theme.contract)', () => {
  describe('GET /api/theme handler', () => {
    it('returns light tokens by default', async () => {
      const handler = (await import('~/server/api/theme.get')).default
      const result = handler({ _query: {} } as any)

      expect(result.mode).toBe('light')
      expect(result.tokens).toBeDefined()
      expect(result.tokens['color.primary']).toBeTruthy()
    })

    it('returns dark tokens when mode=dark', async () => {
      const handler = (await import('~/server/api/theme.get')).default
      const result = handler({ _query: { mode: 'dark' } } as any)

      expect(result.mode).toBe('dark')
      expect(result.tokens['color.background']).toBe('#1f2937')
    })
  })

  describe('POST /api/theme handler', () => {
    it('accepts valid mode', async () => {
      const handler = (await import('~/server/api/theme.post')).default
      const result = await handler({ _body: { mode: 'dark' } } as any)

      expect(result.mode).toBe('dark')
    })

    it('rejects invalid mode', async () => {
      const handler = (await import('~/server/api/theme.post')).default
      await expect(
        handler({ _body: { mode: 'neon' } } as any)
      ).rejects.toThrow()
    })

    it('rejects invalid hex color', async () => {
      const handler = (await import('~/server/api/theme.post')).default
      await expect(
        handler({ _body: { customColors: { primary: 'not-hex' } } } as any)
      ).rejects.toThrow()
    })

    it('accepts valid hex colors', async () => {
      const handler = (await import('~/server/api/theme.post')).default
      const result = await handler({
        _body: { mode: 'light', customColors: { primary: '#ef4444' } },
      } as any)

      expect(result.customColors.primary).toBe('#ef4444')
    })
  })
})
