import { describe, it, expect } from 'vitest'
import { parseLanesFromWorktrees } from './lanes'

const SINGLE_WORKTREE = `worktree /repo
HEAD abc123
branch refs/heads/main

`

const TWO_WORKTREES = `worktree /repo
HEAD abc123
branch refs/heads/main

worktree /repo/.worktrees/feat-branch
HEAD def456
branch refs/heads/feat/some-feature

`

const DETACHED_HEAD = `worktree /repo
HEAD abc123
branch refs/heads/main

worktree /repo/.worktrees/detached
HEAD deadbeef
detached

`

describe('parseLanesFromWorktrees', () => {
  it('returns empty array for empty stdout', () => {
    expect(parseLanesFromWorktrees('', '/cwd')).toEqual([])
  })

  it('returns one lane for single worktree', () => {
    const result = parseLanesFromWorktrees(SINGLE_WORKTREE, '/repo')
    expect(result).toHaveLength(1)
  })

  it('assigns id "root" to the first (main) worktree', () => {
    const result = parseLanesFromWorktrees(SINGLE_WORKTREE, '/repo')
    expect(result[0]!.id).toBe('root')
  })

  it('marks main worktree as active when cwd matches', () => {
    const result = parseLanesFromWorktrees(SINGLE_WORKTREE, '/repo')
    expect(result[0]!.isActive).toBe(true)
  })

  it('returns two lanes for two worktrees', () => {
    const result = parseLanesFromWorktrees(TWO_WORKTREES, '/repo')
    expect(result).toHaveLength(2)
  })

  it('derives id from basename of worktree path for non-root', () => {
    const result = parseLanesFromWorktrees(TWO_WORKTREES, '/repo')
    expect(result[1]!.id).toBe('feat-branch')
  })

  it('extracts branch name stripping refs/heads/ prefix', () => {
    const result = parseLanesFromWorktrees(TWO_WORKTREES, '/repo')
    expect(result[0]!.branch).toBe('main')
    expect(result[1]!.branch).toBe('feat/some-feature')
  })

  it('marks the worktree matching cwd as active', () => {
    const result = parseLanesFromWorktrees(
      TWO_WORKTREES,
      '/repo/.worktrees/feat-branch'
    )
    expect(result[0]!.isActive).toBe(false)
    expect(result[1]!.isActive).toBe(true)
  })

  it('sets branch to "detached" when no branch line', () => {
    const result = parseLanesFromWorktrees(DETACHED_HEAD, '/repo')
    expect(result[1]!.branch).toBe('detached')
  })

  it('initialises reviews as empty array', () => {
    const result = parseLanesFromWorktrees(SINGLE_WORKTREE, '/repo')
    expect(result[0]!.reviews).toEqual([])
  })

  it('extracts path for each worktree', () => {
    const result = parseLanesFromWorktrees(TWO_WORKTREES, '/repo')
    expect(result[0]!.path).toBe('/repo')
    expect(result[1]!.path).toBe('/repo/.worktrees/feat-branch')
  })
})
