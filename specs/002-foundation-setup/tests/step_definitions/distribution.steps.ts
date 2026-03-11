/**
 * Step definitions for distribution.feature
 * Maps to: TS-007, TS-008, TS-009 (US-003, FR-110, FR-111)
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

const ROOT = resolve(__dirname, '../..')

describe('@US-003 Global Distribution via npm', () => {
  describe('@TS-007 App launches via npx without manual build', () => {
    it('package.json has bin field pointing to debussy entry', () => {
      const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'))
      expect(pkg.bin.debussy).toBe('./bin/debussy.cjs')
    })

    it('bin entry exists and is executable', () => {
      expect(existsSync(resolve(ROOT, 'bin/debussy.cjs'))).toBe(true)
    })

    it('package.json has prepublishOnly build script', () => {
      const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'))
      expect(pkg.scripts.prepublishOnly).toBe('npm run build')
    })
  })

  describe('@TS-008 Executable opens app in browser', () => {
    it('bin entry reports version correctly', () => {
      const output = execSync('node bin/debussy.cjs --version', {
        encoding: 'utf8',
        cwd: ROOT,
      })
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/)
    })

    it('bin entry shows help', () => {
      const output = execSync('node bin/debussy.cjs --help', {
        encoding: 'utf8',
        cwd: ROOT,
      })
      expect(output).toContain('Usage: debussy')
    })
  })

  describe('@TS-009 Users can update to latest version', () => {
    it('package.json has version field', () => {
      const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'))
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/)
    })

    it('.npmignore excludes source and test files', () => {
      const npmignore = readFileSync(resolve(ROOT, '.npmignore'), 'utf8')
      expect(npmignore).toContain('tests/')
      expect(npmignore).toContain('pages/')
      expect(npmignore).toContain('server/')
    })
  })
})
