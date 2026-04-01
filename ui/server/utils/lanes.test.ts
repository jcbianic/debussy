import { describe, it, expect } from 'vitest'
import { parseLanes } from './lanes'

const BRANCHES = `main
feature/some-feature
hotfix/quick-fix
`

const SINGLE_WORKTREE = `worktree /repo
HEAD abc123
branch refs/heads/main

`

const TWO_WORKTREES = `worktree /repo
HEAD abc123
branch refs/heads/main

worktree /repo/.worktrees/feat-branch
HEAD def456
branch refs/heads/feature/some-feature

`

const DETACHED_WORKTREE = `worktree /repo
HEAD abc123
branch refs/heads/main

worktree /repo/.worktrees/detached
HEAD deadbeef
detached

`

describe('parseLanes', () => {
  it('returns empty array when no branches', () => {
    expect(parseLanes('', SINGLE_WORKTREE, '/cwd')).toEqual([])
  })

  it('returns one lane per branch', () => {
    const result = parseLanes(BRANCHES, SINGLE_WORKTREE, '/repo')
    expect(result).toHaveLength(3)
  })

  it('uses branch name as id', () => {
    const result = parseLanes(BRANCHES, SINGLE_WORKTREE, '/repo')
    expect(result[0]!.id).toBe('main')
    expect(result[1]!.id).toBe('feature/some-feature')
    expect(result[2]!.id).toBe('hotfix/quick-fix')
  })

  it('sets checkedOutIn to "root" for branch in main worktree', () => {
    const result = parseLanes(BRANCHES, SINGLE_WORKTREE, '/repo')
    expect(result[0]!.checkedOutIn).toBe('root')
  })

  it('sets checkedOutIn to "worktree" for branch in secondary worktree', () => {
    const result = parseLanes(BRANCHES, TWO_WORKTREES, '/repo')
    expect(result[1]!.checkedOutIn).toBe('worktree')
  })

  it('sets checkedOutIn to null for branches not checked out', () => {
    const result = parseLanes(BRANCHES, SINGLE_WORKTREE, '/repo')
    expect(result[1]!.checkedOutIn).toBeNull()
    expect(result[2]!.checkedOutIn).toBeNull()
  })

  it('sets path to worktree path when checked out', () => {
    const result = parseLanes(BRANCHES, TWO_WORKTREES, '/repo')
    expect(result[0]!.path).toBe('/repo')
    expect(result[1]!.path).toBe('/repo/.worktrees/feat-branch')
  })

  it('sets path to root repo path when not checked out', () => {
    const result = parseLanes(BRANCHES, SINGLE_WORKTREE, '/repo')
    expect(result[2]!.path).toBe('/repo')
  })

  it('marks lane whose worktree contains cwd as active', () => {
    const result = parseLanes(
      BRANCHES,
      TWO_WORKTREES,
      '/repo/.worktrees/feat-branch'
    )
    expect(result[0]!.isActive).toBe(false)
    expect(result[1]!.isActive).toBe(true)
    expect(result[2]!.isActive).toBe(false)
  })

  it('marks root worktree lane as active when cwd matches root', () => {
    const result = parseLanes(BRANCHES, TWO_WORKTREES, '/repo')
    expect(result[0]!.isActive).toBe(true)
    expect(result[1]!.isActive).toBe(false)
  })

  it('no lane is active when cwd is not in any worktree', () => {
    const result = parseLanes(BRANCHES, SINGLE_WORKTREE, '/somewhere/else')
    expect(result.every((l) => !l.isActive)).toBe(true)
  })

  it('ignores detached worktrees (no branch match)', () => {
    const result = parseLanes(BRANCHES, DETACHED_WORKTREE, '/repo')
    expect(result[0]!.checkedOutIn).toBe('root')
    expect(result[1]!.checkedOutIn).toBeNull()
    expect(result[2]!.checkedOutIn).toBeNull()
  })

  it('initialises reviews as empty array', () => {
    const result = parseLanes(BRANCHES, SINGLE_WORKTREE, '/repo')
    expect(result[0]!.reviews).toEqual([])
  })

  it('branch and id are the same value', () => {
    const result = parseLanes(BRANCHES, SINGLE_WORKTREE, '/repo')
    for (const lane of result) {
      expect(lane.id).toBe(lane.branch)
    }
  })
})
