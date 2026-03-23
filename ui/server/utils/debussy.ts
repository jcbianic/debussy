import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'

const execAsync = promisify(exec)

/**
 * Resolves a path under the main worktree root using the given segments.
 * Uses `git worktree list` so all worktrees see the same files.
 */
export async function resolveDebussyPath(
  ...segments: string[]
): Promise<string> {
  try {
    const { stdout } = await execAsync('git worktree list --porcelain')
    const mainWorktree = (stdout.split('\n')[0] ?? '')
      .replace('worktree ', '')
      .trim()
    return path.join(mainWorktree, ...segments)
  } catch {
    return path.resolve(process.cwd(), '..', ...segments)
  }
}

/**
 * Resolves the .debussy/strategy directory from the main worktree root.
 * Uses `git worktree list` so all worktrees see the same artifacts.
 */
export async function resolveStrategyPath(): Promise<string> {
  return resolveDebussyPath('.debussy', 'strategy')
}

// ─── Frontmatter schemas ────────────────────────────────────────────────────

/**
 * Required frontmatter for top-level strategy artifacts (vision, problems,
 * audiences, landscape, feature-space, product).
 */
export interface ArtifactFrontmatter {
  [key: string]: unknown
  name: string
  icon: string
  status: 'draft' | 'reviewed'
}

/**
 * Required frontmatter for competitor/ally files.
 */
export interface SubjectFrontmatter {
  type: 'competitor' | 'ally'
  subject: string
  status: 'draft' | 'reviewed'
  updated?: string
}

const VALID_STATUSES = new Set(['draft', 'reviewed'])

export function validateArtifactFrontmatter(
  data: Record<string, unknown>,
  file: string
): data is ArtifactFrontmatter {
  const errors: string[] = []
  if (typeof data.name !== 'string' || !data.name) errors.push('missing `name`')
  if (typeof data.icon !== 'string' || !data.icon) errors.push('missing `icon`')
  if (!VALID_STATUSES.has(data.status as string))
    errors.push('`status` must be "draft" or "reviewed"')
  if (errors.length) {
    console.warn(
      `[debussy] ${file}: invalid frontmatter — ${errors.join(', ')}`
    )
    return false
  }
  return true
}
