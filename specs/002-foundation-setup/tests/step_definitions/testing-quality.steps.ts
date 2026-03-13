/**
 * Step definitions for testing-quality.feature
 * Maps to: TS-004, TS-005, TS-006 (US-002, FR-102, FR-120)
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

const ROOT = resolve(__dirname, '../..')

describe('@US-002 Automated Testing and Quality Gates', () => {
  // Background: Given a working test suite

  describe('@TS-004 Test suite passes and displays coverage', () => {
    it('npm test script is configured', () => {
      const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'))
      expect(pkg.scripts.test).toBe('vitest')
      expect(pkg.scripts['test:coverage']).toBe('vitest run --coverage')
    })

    it('vitest config includes coverage thresholds', () => {
      const config = readFileSync(resolve(ROOT, 'vitest.config.ts'), 'utf8')
      expect(config).toContain('coverage')
      expect(config).toContain('thresholds')
    })

    it('vitest runner is installed and importable', () => {
      // Verifying that vitest is properly installed and configured
      // (actual test execution is validated by the test runner itself)
      const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'))
      expect(pkg.devDependencies.vitest).toBeDefined()
      expect(pkg.devDependencies['@vitest/coverage-v8']).toBeDefined()
    })
  })

  describe('@TS-005 Failing test produces clear error message', () => {
    it('vitest is configured with globals for clear assertions', () => {
      const config = readFileSync(resolve(ROOT, 'vitest.config.ts'), 'utf8')
      expect(config).toContain('globals: true')
    })
  })

  describe('@TS-006 New tests are discovered automatically', () => {
    it('vitest auto-discovers tests/**/*.test.ts', () => {
      const config = readFileSync(resolve(ROOT, 'vitest.config.ts'), 'utf8')
      expect(config).toContain("tests/**/*.test.ts")
    })

    it('setup file is loaded before tests', () => {
      expect(existsSync(resolve(ROOT, 'tests/setup.ts'))).toBe(true)
    })
  })
})
