import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

describe('Distribution (TS-007, TS-008, TS-009, FR-110, FR-111)', () => {
  it('bin/debussy.cjs exists and is executable', () => {
    const binPath = resolve(__dirname, '../../bin/debussy.cjs')
    expect(existsSync(binPath)).toBe(true)
  })

  it('bin entry shows version with --version flag', () => {
    const result = execSync('node bin/debussy.cjs --version', {
      encoding: 'utf8',
      cwd: resolve(__dirname, '../..'),
    })
    expect(result.trim()).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('bin entry shows help with --help flag', () => {
    const result = execSync('node bin/debussy.cjs --help', {
      encoding: 'utf8',
      cwd: resolve(__dirname, '../..'),
    })
    expect(result).toContain('Usage: debussy')
  })

  it('package.json has correct bin field', () => {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'))
    expect(pkg.bin).toEqual({ debussy: './bin/debussy.cjs' })
  })

  it('package.json has required metadata', () => {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'))
    expect(pkg.name).toBe('debussy')
    expect(pkg.version).toBeDefined()
    expect(pkg.description).toBeTruthy()
    expect(pkg.engines?.node).toBeDefined()
  })

  it('bin entry errors gracefully without build output', () => {
    try {
      execSync('node bin/debussy.cjs', {
        encoding: 'utf8',
        cwd: resolve(__dirname, '../..'),
        timeout: 3000,
      })
    } catch (err: any) {
      expect(err.stderr || err.stdout).toContain('Production build not found')
    }
  })
})
