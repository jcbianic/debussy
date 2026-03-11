/**
 * Unit tests for pipeline utility functions.
 *
 * T003: parseTasks(), parseChecklists(), parseConstitutionTDD() helpers
 *       [TS-007, TS-008, TS-010, TS-015, TS-038, TS-039, TS-042, TS-043]
 * T004: computePipelineState() end-to-end
 *       [TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-009, TS-011, TS-012, TS-013, TS-014, TS-040]
 * T005: listFeatures()
 *       [TS-016, TS-018, TS-019, TS-020, TS-021]
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// These imports will fail until pipeline.ts is implemented — that is intentional (RED phase)
import {
  parseTasks,
  parseChecklists,
  parseConstitutionTDD,
  computePipelineState,
  listFeatures,
} from '../../server/utils/pipeline'

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'debussy-test-'))
}

function writeFile(dir: string, relPath: string, content: string): void {
  const fullPath = join(dir, relPath)
  mkdirSync(fullPath.substring(0, fullPath.lastIndexOf('/')), { recursive: true })
  writeFileSync(fullPath, content, 'utf-8')
}

// ---------------------------------------------------------------------------
// T003: Helper function unit tests
// ---------------------------------------------------------------------------

describe('parseTasks()', () => {
  // TS-007: task list parsing
  it('parses checked and unchecked task items', () => {
    const content = [
      '- [x] T001 [US1] First task',
      '- [ ] T002 [US1] Second task',
      '- [x] T003 [US2] Third task',
    ].join('\n')
    const tasks = parseTasks(content)
    expect(tasks).toHaveLength(3)
    expect(tasks[0].checked).toBe(true)
    expect(tasks[1].checked).toBe(false)
    expect(tasks[2].checked).toBe(true)
  })

  it('returns task ids correctly', () => {
    const content = '- [x] T001 [US1] First task\n- [ ] T002 [US2] Second task'
    const tasks = parseTasks(content)
    expect(tasks[0].id).toBe('T001')
    expect(tasks[1].id).toBe('T002')
  })

  // TS-008: task parsing with parallel and priority markers
  it('handles [P] priority markers in task lines', () => {
    const content = '- [ ] T001 [P] [US1] Priority task'
    const tasks = parseTasks(content)
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe('T001')
  })

  it('returns empty array for empty content', () => {
    expect(parseTasks('')).toEqual([])
    expect(parseTasks('# Header\n\nSome text without tasks')).toEqual([])
  })

  // TS-043: no checked tasks → not_started
  it('detects when no tasks are checked', () => {
    const content = '- [ ] T001 [US1] First task\n- [ ] T002 [US1] Second task'
    const tasks = parseTasks(content)
    const checkedCount = tasks.filter(t => t.checked).length
    expect(checkedCount).toBe(0)
  })

  // TS-040: tasks.md with no task items
  it('returns empty array when tasks.md has no task checkbox items', () => {
    const content = '# Tasks\n\nNo task items here yet.'
    const tasks = parseTasks(content)
    expect(tasks).toEqual([])
  })
})

describe('parseChecklists()', () => {
  let projectDir: string

  beforeEach(() => { projectDir = makeTempDir() })
  afterEach(() => { rmSync(projectDir, { recursive: true, force: true }) })

  // TS-015: checklist with all items checked → complete
  it('returns total and checked counts from checklist files', () => {
    writeFile(projectDir, 'checklists/quality.md', [
      '- [x] CHK-001 First item',
      '- [x] CHK-002 Second item',
      '- [ ] CHK-003 Third item',
    ].join('\n'))

    const result = parseChecklists(join(projectDir, 'checklists'), { includeRequirements: false })
    expect(result.total).toBe(3)
    expect(result.checked).toBe(2)
  })

  it('returns zero total when checklists directory does not exist', () => {
    const result = parseChecklists(join(projectDir, 'checklists'), { includeRequirements: false })
    expect(result.total).toBe(0)
    expect(result.checked).toBe(0)
  })

  // TS-042: requirements.md excluded unless checklist_reviewed_at is set
  it('excludes requirements.md from progress when includeRequirements is false', () => {
    writeFile(projectDir, 'checklists/requirements.md', [
      '- [x] CHK-001 Requirement checked',
      '- [x] CHK-002 Another requirement checked',
    ].join('\n'))

    const result = parseChecklists(join(projectDir, 'checklists'), { includeRequirements: false })
    expect(result.total).toBe(0)  // requirements.md excluded
  })

  it('includes requirements.md when includeRequirements is true', () => {
    writeFile(projectDir, 'checklists/requirements.md', [
      '- [x] CHK-001 Requirement checked',
      '- [ ] CHK-002 Not yet',
    ].join('\n'))

    const result = parseChecklists(join(projectDir, 'checklists'), { includeRequirements: true })
    expect(result.total).toBe(2)
    expect(result.checked).toBe(1)
  })
})

describe('parseConstitutionTDD()', () => {
  let projectDir: string

  beforeEach(() => { projectDir = makeTempDir() })
  afterEach(() => { rmSync(projectDir, { recursive: true, force: true }) })

  // TS-010: TDD requirement detection
  it('returns true when CONSTITUTION.md contains TDD terms and mandatory keywords', () => {
    writeFile(projectDir, 'CONSTITUTION.md', [
      '# Constitution',
      'TDD is REQUIRED. Tests must be written before production code.',
      'Non-negotiable.',
    ].join('\n'))

    const result = parseConstitutionTDD(join(projectDir, 'CONSTITUTION.md'))
    expect(result).toBe(true)
  })

  it('returns false when CONSTITUTION.md lacks mandatory keyword', () => {
    writeFile(projectDir, 'CONSTITUTION.md', [
      '# Constitution',
      'TDD and BDD practices are encouraged.',
    ].join('\n'))

    const result = parseConstitutionTDD(join(projectDir, 'CONSTITUTION.md'))
    expect(result).toBe(false)
  })

  it('returns false when CONSTITUTION.md does not exist', () => {
    const result = parseConstitutionTDD(join(projectDir, 'NONEXISTENT.md'))
    expect(result).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// T004: computePipelineState() end-to-end tests
// ---------------------------------------------------------------------------

describe('computePipelineState()', () => {
  let projectDir: string

  beforeEach(() => { projectDir = makeTempDir() })
  afterEach(() => { rmSync(projectDir, { recursive: true, force: true }) })

  // TS-001: spec.md → spec phase complete
  it('returns spec=complete when spec.md exists and no later artifacts exist', () => {
    writeFile(projectDir, 'specs/test-feature/spec.md', '# Spec')

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const spec = phases.find(p => p.id === 'spec')!
    expect(spec.status).toBe('complete')
    const plan = phases.find(p => p.id === 'plan')!
    expect(plan.status).toBe('not_started')
  })

  // TS-002: tasks.md with 3/5 checked → implement in_progress with 60%
  it('returns implement=in_progress with progress 60 when 3 of 5 tasks are checked', () => {
    writeFile(projectDir, 'specs/test-feature/tasks.md', [
      '- [x] T001 [US1] First task',
      '- [x] T002 [US1] Second task',
      '- [x] T003 [US1] Third task',
      '- [ ] T004 [US1] Fourth task',
      '- [ ] T005 [US1] Fifth task',
    ].join('\n'))

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const impl = phases.find(p => p.id === 'implement')!
    expect(impl.status).toBe('in_progress')
    expect(impl.progress).toBe(60)
  })

  // TS-003: no specs dir → all not_started
  it('returns all 8 phases as not_started when project has no specs directory', () => {
    const { phases } = computePipelineState(projectDir, 'test-feature')
    expect(phases).toHaveLength(8)
    for (const phase of phases) {
      expect(phase.status).toBe('not_started')
    }
  })

  // TS-004: CONSTITUTION.md → constitution=complete
  it('returns constitution=complete when CONSTITUTION.md exists at project root', () => {
    writeFile(projectDir, 'CONSTITUTION.md', '# Constitution')

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const constitution = phases.find(p => p.id === 'constitution')!
    expect(constitution.status).toBe('complete')
  })

  // TS-005: plan.md → plan=complete
  it('returns plan=complete when plan.md exists', () => {
    writeFile(projectDir, 'specs/test-feature/plan.md', '# Plan')

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const plan = phases.find(p => p.id === 'plan')!
    expect(plan.status).toBe('complete')
  })

  // TS-006: all tasks checked → implement=complete
  it('returns implement=complete when all tasks are checked', () => {
    writeFile(projectDir, 'specs/test-feature/tasks.md', [
      '- [x] T001 [US1] First task',
      '- [x] T002 [US1] Second task',
    ].join('\n'))

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const impl = phases.find(p => p.id === 'implement')!
    expect(impl.status).toBe('complete')
    expect(impl.progress).toBe(100)
  })

  // TS-009: checklist phase status
  it('returns checklist=in_progress when some items checked', () => {
    writeFile(projectDir, 'specs/test-feature/checklists/quality.md', [
      '- [x] CHK-001 First',
      '- [ ] CHK-002 Second',
    ].join('\n'))
    // Set checklist_reviewed_at so the checklist is counted
    writeFile(projectDir, '.specify/context.json', JSON.stringify({ checklist_reviewed_at: '2026-01-01' }))

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const checklist = phases.find(p => p.id === 'checklist')!
    expect(checklist.status).toBe('in_progress')
  })

  // TS-011: testify=complete when feature files exist
  it('returns testify=complete when .feature files exist', () => {
    writeFile(projectDir, 'specs/test-feature/tests/features/test.feature', [
      'Feature: Test',
      '  Scenario: Test scenario',
      '    Given something',
    ].join('\n'))

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const testify = phases.find(p => p.id === 'testify')!
    expect(testify.status).toBe('complete')
  })

  // TS-012: testify=skipped when TDD not required and plan exists
  it('returns testify=skipped when TDD not required and plan.md exists', () => {
    writeFile(projectDir, 'specs/test-feature/plan.md', '# Plan')
    writeFile(projectDir, '.specify/context.json', JSON.stringify({ tdd_determination: 'optional' }))

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const testify = phases.find(p => p.id === 'testify')!
    expect(testify.status).toBe('skipped')
  })

  // TS-013: tasks.md exists → tasks=complete
  it('returns tasks=complete when tasks.md exists', () => {
    writeFile(projectDir, 'specs/test-feature/tasks.md', '# Tasks\n\n- [ ] T001 Some task')

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const tasks = phases.find(p => p.id === 'tasks')!
    expect(tasks.status).toBe('complete')
  })

  // TS-014: analysis.md → analyze=complete
  it('returns analyze=complete when analysis.md exists', () => {
    writeFile(projectDir, 'specs/test-feature/analysis.md', '# Analysis')

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const analyze = phases.find(p => p.id === 'analyze')!
    expect(analyze.status).toBe('complete')
  })

  // TS-038: context.json missing → graceful fallback
  it('handles missing context.json gracefully without throwing', () => {
    writeFile(projectDir, 'specs/test-feature/plan.md', '# Plan')

    expect(() => computePipelineState(projectDir, 'test-feature')).not.toThrow()
    const { phases } = computePipelineState(projectDir, 'test-feature')
    const plan = phases.find(p => p.id === 'plan')!
    expect(plan.status).toBe('complete')
  })

  // TS-039: context.json malformed → graceful fallback
  it('handles malformed context.json gracefully without throwing', () => {
    writeFile(projectDir, 'specs/test-feature/plan.md', '# Plan')
    writeFile(projectDir, '.specify/context.json', 'not valid json {{{')

    expect(() => computePipelineState(projectDir, 'test-feature')).not.toThrow()
    const { phases } = computePipelineState(projectDir, 'test-feature')
    const plan = phases.find(p => p.id === 'plan')!
    expect(plan.status).toBe('complete')
  })

  // TS-040: tasks.md with no task items → tasks=complete, implement=not_started
  it('returns tasks=complete and implement=not_started when tasks.md has no task items', () => {
    writeFile(projectDir, 'specs/test-feature/tasks.md', '# Tasks\n\nNo task items here yet.')

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const tasks = phases.find(p => p.id === 'tasks')!
    const impl = phases.find(p => p.id === 'implement')!
    expect(tasks.status).toBe('complete')
    expect(impl.status).toBe('not_started')
    expect(impl.progress).toBeNull()
  })

  // TS-043: no tasks checked → implement=not_started, progress=null
  it('returns implement=not_started with null progress when no tasks are checked', () => {
    writeFile(projectDir, 'specs/test-feature/tasks.md', [
      '- [ ] T001 [US1] First task',
      '- [ ] T002 [US1] Second task',
    ].join('\n'))

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const impl = phases.find(p => p.id === 'implement')!
    expect(impl.status).toBe('not_started')
    expect(impl.progress).toBeNull()
  })

  // TS-042: requirements.md excluded unless checklist_reviewed_at set
  it('returns checklist=not_started when only requirements.md exists without checklist_reviewed_at', () => {
    writeFile(projectDir, 'specs/test-feature/checklists/requirements.md', [
      '- [x] CHK-001 Requirement checked',
      '- [x] CHK-002 Another requirement checked',
    ].join('\n'))
    // No context.json with checklist_reviewed_at

    const { phases } = computePipelineState(projectDir, 'test-feature')
    const checklist = phases.find(p => p.id === 'checklist')!
    expect(checklist.status).toBe('not_started')
  })

  it('always returns exactly 8 phases in fixed order', () => {
    const { phases } = computePipelineState(projectDir, 'test-feature')
    expect(phases).toHaveLength(8)
    const ids = phases.map(p => p.id)
    expect(ids).toEqual([
      'constitution', 'spec', 'plan', 'checklist', 'testify', 'tasks', 'analyze', 'implement'
    ])
  })

  it('returns phases with required fields', () => {
    const { phases } = computePipelineState(projectDir, 'test-feature')
    for (const phase of phases) {
      expect(phase).toHaveProperty('id')
      expect(phase).toHaveProperty('name')
      expect(phase).toHaveProperty('status')
      expect(phase).toHaveProperty('progress')
      expect(phase).toHaveProperty('optional')
    }
  })
})

// ---------------------------------------------------------------------------
// T005: listFeatures() tests
// ---------------------------------------------------------------------------

describe('listFeatures()', () => {
  let projectDir: string

  beforeEach(() => { projectDir = makeTempDir() })
  afterEach(() => { rmSync(projectDir, { recursive: true, force: true }) })

  // TS-016: lists features with spec.md
  it('lists feature directories that contain spec.md', () => {
    writeFile(projectDir, 'specs/001-auth/spec.md', '# Spec')
    writeFile(projectDir, 'specs/002-billing/spec.md', '# Spec')

    const features = listFeatures(projectDir)
    expect(features).toHaveLength(2)
    const ids = features.map(f => f.id)
    expect(ids).toContain('001-auth')
    expect(ids).toContain('002-billing')
  })

  // TS-018: single feature → returns exactly 1
  it('returns exactly 1 feature when only one exists', () => {
    writeFile(projectDir, 'specs/001-auth/spec.md', '# Spec')

    const features = listFeatures(projectDir)
    expect(features).toHaveLength(1)
    expect(features[0].id).toBe('001-auth')
  })

  // TS-019: directory without spec.md is not listed
  it('excludes directory without spec.md', () => {
    mkdirSync(join(projectDir, 'specs', '001-draft'), { recursive: true })
    writeFile(projectDir, 'specs/002-active/spec.md', '# Spec')

    const features = listFeatures(projectDir)
    expect(features.find(f => f.id === '001-draft')).toBeUndefined()
    expect(features.find(f => f.id === '002-active')).toBeDefined()
  })

  // TS-020: no specs directory → empty list
  it('returns empty list when no specs directory exists', () => {
    const features = listFeatures(projectDir)
    expect(features).toEqual([])
  })

  // TS-021: display name derived from directory name
  it('derives display name from directory name by stripping prefix and title-casing', () => {
    writeFile(projectDir, 'specs/001-workflow-phase-status/spec.md', '# Spec')

    const features = listFeatures(projectDir)
    expect(features[0].name).toBe('Workflow Phase Status')
  })

  it('each feature has id and name fields', () => {
    writeFile(projectDir, 'specs/001-auth/spec.md', '# Spec')

    const features = listFeatures(projectDir)
    expect(features[0]).toHaveProperty('id')
    expect(features[0]).toHaveProperty('name')
  })
})
