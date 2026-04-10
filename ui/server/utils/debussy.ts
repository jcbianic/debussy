import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import type { StrategyManifest } from '~/types/config'

const execAsync = promisify(exec)

/**
 * Resolves a path under the project root using the given segments.
 * Priority: PROJECT_ROOT env var > git worktree root > cwd.
 */
export async function resolveDebussyPath(
  ...segments: string[]
): Promise<string> {
  if (process.env.PROJECT_ROOT) {
    return path.join(process.env.PROJECT_ROOT, ...segments)
  }
  try {
    const { stdout } = await execAsync('git worktree list --porcelain')
    const mainWorktree = (stdout.split('\n')[0] ?? '')
      .replace('worktree ', '')
      .trim()
    return path.join(mainWorktree, ...segments)
  } catch {
    return path.resolve(process.cwd(), ...segments)
  }
}

/**
 * Resolves the .debussy/strategy directory from the main worktree root.
 * Uses `git worktree list` so all worktrees see the same artifacts.
 */
export async function resolveStrategyPath(): Promise<string> {
  return resolveDebussyPath('.debussy', 'strategy')
}

// ─── Manifest ───────────────────────────────────────────────────────────────

/**
 * Reads and parses .debussy/strategy/manifest.yaml.
 * Returns null if the file is missing or unparseable.
 */
export async function readStrategyManifest(): Promise<StrategyManifest | null> {
  const strategyPath = await resolveStrategyPath()
  try {
    const raw = await readFile(path.join(strategyPath, 'manifest.yaml'), 'utf8')
    const parsed = parseYaml(raw)
    if (!parsed || typeof parsed !== 'object' || !parsed.depth) return null
    return parsed as StrategyManifest
  } catch {
    return null
  }
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
