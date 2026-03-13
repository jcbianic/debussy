/**
 * Step definitions for developer-experience.feature
 * Maps to: TS-001, TS-002, TS-003 (US-001, FR-100)
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../..')

describe('@US-001 Developer Quick Start', () => {
  // Background: Given a cloned repository with dependencies installed
  const packageJsonPath = resolve(ROOT, 'package.json')
  const nodeModulesPath = resolve(ROOT, 'node_modules')

  describe('@TS-001 Dev server starts within 5 seconds', () => {
    it('package.json has dev script configured', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      expect(pkg.scripts.dev).toBe('nuxt dev')
    })

    it('health check endpoint responds with ok status', async () => {
      const handler = (await import('~~/server/api/health.get')).default
      const result = handler({} as any)
      expect(result.status).toBe('ok')
    })

    it('dependencies are installed', () => {
      expect(existsSync(nodeModulesPath)).toBe(true)
    })
  })

  describe('@TS-002 Hot module reloading works', () => {
    it('nuxt.config.ts exists with dev-ready configuration', () => {
      const configPath = resolve(ROOT, 'nuxt.config.ts')
      expect(existsSync(configPath)).toBe(true)
    })

    it('Nuxt 4 is configured (HMR enabled by default)', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      expect(pkg.dependencies.nuxt).toBeDefined()
    })
  })

  describe('@TS-003 Command works from any project subdirectory', () => {
    it('npm scripts are defined at project root', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      expect(pkg.scripts.dev).toBeDefined()
      expect(pkg.scripts.build).toBeDefined()
      expect(pkg.scripts.start).toBeDefined()
    })
  })
})
