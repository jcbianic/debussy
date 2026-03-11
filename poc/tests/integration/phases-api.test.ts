/**
 * Integration tests for GET /api/phases endpoint behaviour.
 *
 * T011: [TS-017, TS-031, TS-032, TS-033, TS-034, TS-035, TS-037]
 * T019: [TS-036] Performance test — each /api/phases response within 2000ms for 10 features
 *
 * These tests verify the phases endpoint response shape and error handling
 * using real filesystem I/O with temp directories.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// Import the endpoint logic to test directly
import { getPhases, PhasesApiError } from '../../server/api/phases.get'

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'debussy-phases-api-'))
}

function writeFile(dir: string, relPath: string, content: string): void {
  const fullPath = join(dir, relPath)
  mkdirSync(fullPath.substring(0, fullPath.lastIndexOf('/')), { recursive: true })
  writeFileSync(fullPath, content, 'utf-8')
}

const VALID_STATUSES = ['not_started', 'in_progress', 'complete', 'skipped']

describe('GET /api/phases behaviour', () => {
  let projectDir: string

  beforeEach(() => { projectDir = makeTempDir() })
  afterEach(() => { rmSync(projectDir, { recursive: true, force: true }) })

  // TS-031: returns 8 phases for a valid feature
  it('returns 8 phases for a valid feature', () => {
    writeFile(projectDir, 'specs/001-auth/spec.md', '# Spec')

    const result = getPhases(projectDir, '001-auth')
    expect(result.phases).toHaveLength(8)
  })

  // TS-031: response has feature field equal to the requested feature id
  it('response has feature field equal to the requested feature id', () => {
    writeFile(projectDir, 'specs/001-auth/spec.md', '# Spec')

    const result = getPhases(projectDir, '001-auth')
    expect(result.feature).toBe('001-auth')
  })

  // TS-032: each phase has required fields with valid status values
  it('each phase has required fields with valid status values', () => {
    writeFile(projectDir, 'specs/001-auth/spec.md', '# Spec')

    const result = getPhases(projectDir, '001-auth')
    for (const phase of result.phases) {
      expect(phase).toHaveProperty('id')
      expect(phase).toHaveProperty('name')
      expect(phase).toHaveProperty('status')
      expect(phase).toHaveProperty('progress')
      expect(phase).toHaveProperty('optional')
      expect(VALID_STATUSES).toContain(phase.status)
    }
  })

  // TS-033: progress field is a number for implement phase with partial tasks
  it('returns progress as a number for implement phase with partial tasks', () => {
    writeFile(projectDir, 'specs/test-feature/tasks.md', [
      '- [x] T001 [US1] First task',
      '- [ ] T002 [US1] Second task',
    ].join('\n'))

    const result = getPhases(projectDir, 'test-feature')
    const impl = result.phases.find(p => p.id === 'implement')!
    expect(impl.progress).toBe(50)

    const spec = result.phases.find(p => p.id === 'spec')!
    expect(spec.progress).toBeNull()
  })

  // TS-034: 400 when feature parameter is missing
  it('throws PhasesApiError with status 400 when feature is missing', () => {
    expect(() => getPhases(projectDir, '')).toThrow(PhasesApiError)
    try {
      getPhases(projectDir, '')
    } catch (e) {
      expect(e).toBeInstanceOf(PhasesApiError)
      expect((e as PhasesApiError).statusCode).toBe(400)
      expect((e as PhasesApiError).message).toContain('Missing required query parameter')
    }
  })

  // TS-035: 404 when feature directory does not exist
  it('throws PhasesApiError with status 404 when feature directory does not exist', () => {
    expect(() => getPhases(projectDir, '999-nonexistent')).toThrow(PhasesApiError)
    try {
      getPhases(projectDir, '999-nonexistent')
    } catch (e) {
      expect(e).toBeInstanceOf(PhasesApiError)
      expect((e as PhasesApiError).statusCode).toBe(404)
      expect((e as PhasesApiError).message).toContain('Feature not found')
    }
  })

  // TS-017: phase statuses reflect the selected feature's artifacts
  it('phase statuses reflect only the selected feature artifacts', () => {
    writeFile(projectDir, 'specs/001-auth/spec.md', '# Spec')
    writeFile(projectDir, 'specs/001-auth/plan.md', '# Plan')
    writeFile(projectDir, 'specs/002-billing/spec.md', '# Spec')
    // 002-billing has no plan.md

    const result = getPhases(projectDir, '002-billing')
    const spec = result.phases.find(p => p.id === 'spec')!
    const plan = result.phases.find(p => p.id === 'plan')!
    expect(spec.status).toBe('complete')
    expect(plan.status).toBe('not_started')
  })

  // TS-036 (T019): performance — each response completes within 2000ms for 10 features
  it('responds within 2000ms for each of 10 features', () => {
    // Create 10 features with realistic artifacts
    for (let i = 1; i <= 10; i++) {
      const id = `${String(i).padStart(3, '0')}-feature-${i}`
      writeFile(projectDir, `specs/${id}/spec.md`, '# Spec')
      writeFile(projectDir, `specs/${id}/plan.md`, '# Plan')
      writeFile(projectDir, `specs/${id}/tasks.md`, [
        '- [x] T001 [US1] First task',
        '- [ ] T002 [US1] Second task',
      ].join('\n'))
    }

    const features = Array.from({ length: 10 }, (_, i) => `${String(i + 1).padStart(3, '0')}-feature-${i + 1}`)

    for (const featureId of features) {
      const start = Date.now()
      const result = getPhases(projectDir, featureId)
      const duration = Date.now() - start

      expect(result.phases).toHaveLength(8)
      expect(duration).toBeLessThan(2000)
    }
  })

  // TS-037: fresh read on each request (no cache)
  it('reflects filesystem changes on subsequent calls', () => {
    writeFile(projectDir, 'specs/test-feature/spec.md', '# Spec')

    const first = getPhases(projectDir, 'test-feature')
    expect(first.phases.find(p => p.id === 'plan')!.status).toBe('not_started')

    // Create plan.md externally
    writeFile(projectDir, 'specs/test-feature/plan.md', '# Plan')

    const second = getPhases(projectDir, 'test-feature')
    expect(second.phases.find(p => p.id === 'plan')!.status).toBe('complete')
  })
})
