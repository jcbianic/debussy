/**
 * Integration tests for GET /api/features endpoint behaviour.
 *
 * T009: [TS-030, TS-041]
 *
 * These tests verify the listFeatures() function and the features
 * endpoint response shape using real filesystem I/O with temp directories.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// Import the handler factory to test endpoint behaviour directly
import { listFeatures } from '../../server/api/features.get'

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'debussy-features-api-'))
}

function writeFile(dir: string, relPath: string, content: string): void {
  const fullPath = join(dir, relPath)
  mkdirSync(fullPath.substring(0, fullPath.lastIndexOf('/')), { recursive: true })
  writeFileSync(fullPath, content, 'utf-8')
}

describe('GET /api/features behaviour', () => {
  let projectDir: string

  beforeEach(() => { projectDir = makeTempDir() })
  afterEach(() => { rmSync(projectDir, { recursive: true, force: true }) })

  // TS-030: returns list of valid features with id and name
  it('returns features array with id and name when spec.md directories exist', () => {
    writeFile(projectDir, 'specs/001-auth/spec.md', '# Spec')
    writeFile(projectDir, 'specs/002-billing/spec.md', '# Spec')

    const result = listFeatures(projectDir)
    expect(result.features).toHaveLength(2)
    for (const feature of result.features) {
      expect(feature).toHaveProperty('id')
      expect(feature).toHaveProperty('name')
    }
  })

  // TS-041: directory without spec.md does not appear in feature list
  it('does not include directory without spec.md in the features list', () => {
    mkdirSync(join(projectDir, 'specs', '001-draft'), { recursive: true })
    // No spec.md in 001-draft

    const result = listFeatures(projectDir)
    expect(result.features.find(f => f.id === '001-draft')).toBeUndefined()
  })

  it('returns empty features array when no specs directory exists', () => {
    const result = listFeatures(projectDir)
    expect(result.features).toEqual([])
  })

  it('response has expected shape: { features: Feature[] }', () => {
    writeFile(projectDir, 'specs/001-auth/spec.md', '# Spec')

    const result = listFeatures(projectDir)
    expect(result).toHaveProperty('features')
    expect(Array.isArray(result.features)).toBe(true)
  })
})
