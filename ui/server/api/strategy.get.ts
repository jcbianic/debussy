import { readdir, readFile, stat } from 'node:fs/promises'
import matter from 'gray-matter'
import path from 'node:path'
import type { Artifact, StrategyResponse } from '~/composables/useProduct'
import type { StrategyManifest } from '~/types/config'
import { STRATEGY_DEPTH_DOCUMENTS, resolveStrategyDepth } from '~/types/config'

const ORDER = [
  'pitch',
  'vision',
  'strategy',
  'audiences',
  'problem-space',
  'problems',
  'landscape',
  'opportunities',
  'product',
]

const SUBDIRS = ['competitors', 'allies']

const DEFAULT_ICONS: Record<string, string> = {
  pitch: 'i-heroicons-rocket-launch',
  vision: 'i-heroicons-eye',
  strategy: 'i-heroicons-adjustments-horizontal',
  audiences: 'i-heroicons-users',
  problems: 'i-heroicons-exclamation-triangle',
  'problem-space': 'i-heroicons-puzzle-piece',
  landscape: 'i-heroicons-map',
  opportunities: 'i-heroicons-light-bulb',
  product: 'i-heroicons-cube',
  'feature-space': 'i-heroicons-squares-2x2',
}

function parseSections(content: string) {
  return content
    .split(/^## /m)
    .filter((block) => block.trim())
    .map((block) => {
      const lines = block.trim().split('\n')
      const title = (lines[0] ?? '').trim()
      const body = lines.slice(1).join('\n').trim()
      const paragraphs = body
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
      return { title, content: paragraphs }
    })
}

function titleCase(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function defaultIcon(key: string, group?: string): string {
  if (group === 'competitors') return 'i-heroicons-shield-exclamation'
  if (group === 'allies') return 'i-heroicons-hand-raised'
  const slug = key.split('/').pop()!
  return DEFAULT_ICONS[slug] ?? 'i-heroicons-document'
}

async function parseArtifact(
  filePath: string,
  relPath: string,
  key: string,
  group?: string
): Promise<Artifact> {
  const raw = await readFile(filePath, 'utf8')
  const { data, content } = matter(raw)
  const name = data.name ?? data.subject ?? titleCase(key.split('/').pop()!)
  const icon = data.icon ?? defaultIcon(key, group)
  return {
    key,
    name,
    file: `.debussy/strategy/${relPath}`,
    icon,
    status: data.status ?? 'draft',
    presence: 'present',
    expected: true,
    group,
    sections: parseSections(content),
  }
}

function missingArtifact(key: string, group?: string): Artifact {
  const slug = key.split('/').pop()!
  return {
    key,
    name: titleCase(slug),
    file: `.debussy/strategy/${group ? `${group}/${slug}.md` : `${key}.md`}`,
    icon: defaultIcon(key, group),
    status: 'draft',
    presence: 'missing',
    expected: true,
    group,
    sections: [],
  }
}

// ─── Filesystem scan (fallback when no manifest) ────────────────────────────

async function scanFilesystem(strategyPath: string): Promise<Artifact[]> {
  let topFiles: string[]
  try {
    topFiles = (await readdir(strategyPath)).filter((f) => f.endsWith('.md'))
  } catch {
    return []
  }

  const artifacts: Artifact[] = (
    await Promise.all(
      topFiles.map(async (file) => {
        const key = file.replace('.md', '')
        try {
          return await parseArtifact(path.join(strategyPath, file), file, key)
        } catch {
          return null
        }
      })
    )
  ).filter((a): a is Artifact => a !== null)

  for (const subdir of SUBDIRS) {
    const subdirPath = path.join(strategyPath, subdir)
    try {
      const s = await stat(subdirPath)
      if (!s.isDirectory()) continue
      const subFiles = (await readdir(subdirPath)).filter((f) =>
        f.endsWith('.md')
      )
      const subArtifacts = await Promise.all(
        subFiles.map(async (file) => {
          const key = `${subdir}/${file.replace('.md', '')}`
          try {
            return await parseArtifact(
              path.join(subdirPath, file),
              `${subdir}/${file}`,
              key,
              subdir
            )
          } catch {
            return null
          }
        })
      )
      artifacts.push(...subArtifacts.filter((a): a is Artifact => a !== null))
    } catch {
      // subdirectory doesn't exist — skip
    }
  }

  return artifacts.sort((a, b) => {
    const groupOrder = (g?: string) =>
      g === undefined ? 0 : g === 'competitors' ? 1 : 2
    const gA = groupOrder(a.group)
    const gB = groupOrder(b.group)
    if (gA !== gB) return gA - gB
    if (!a.group && !b.group) {
      return ORDER.indexOf(a.key) - ORDER.indexOf(b.key)
    }
    return a.key.localeCompare(b.key)
  })
}

// ─── Manifest-aware build ───────────────────────────────────────────────────

async function buildFromManifest(
  strategyPath: string,
  manifest: StrategyManifest
): Promise<Artifact[]> {
  type ExpectedEntry = { key: string; group?: string }
  const expectedEntries: ExpectedEntry[] = []

  // Top-level artifacts in manifest order
  for (const entry of manifest.artifacts) {
    expectedEntries.push({ key: entry.key })
  }

  // Subdirectories
  if (manifest.subdirectories?.competitors) {
    for (const slug of manifest.subdirectories.competitors) {
      expectedEntries.push({ key: `competitors/${slug}`, group: 'competitors' })
    }
  }
  if (manifest.subdirectories?.allies) {
    for (const slug of manifest.subdirectories.allies) {
      expectedEntries.push({ key: `allies/${slug}`, group: 'allies' })
    }
  }

  // Custom artifacts
  if (manifest.custom) {
    for (const entry of manifest.custom) {
      expectedEntries.push({ key: entry.key })
    }
  }

  const expectedKeys = new Set(expectedEntries.map((e) => e.key))

  // Parse each expected artifact, produce stubs for missing ones
  const artifacts: Artifact[] = await Promise.all(
    expectedEntries.map(async ({ key, group }) => {
      const slug = key.split('/').pop()!
      const filePath = group
        ? path.join(strategyPath, group, `${slug}.md`)
        : path.join(strategyPath, `${key}.md`)
      try {
        const relPath = group ? `${group}/${slug}.md` : `${key}.md`
        return await parseArtifact(filePath, relPath, key, group)
      } catch {
        return missingArtifact(key, group)
      }
    })
  )

  // Scan filesystem for unexpected files
  const diskArtifacts = await scanFilesystem(strategyPath)
  for (const diskArtifact of diskArtifacts) {
    if (!expectedKeys.has(diskArtifact.key)) {
      artifacts.push({ ...diskArtifact, expected: false })
    }
  }

  return artifacts
}

// ─── Handler ────────────────────────────────────────────────────────────────

export default defineEventHandler(async (): Promise<StrategyResponse> => {
  const strategyPath = await resolveStrategyPath()
  const manifest = await readStrategyManifest()

  let artifacts: Artifact[]
  let depth: StrategyResponse['depth'] = null
  let updatedAt: string | null = null

  if (manifest) {
    artifacts = await buildFromManifest(strategyPath, manifest)
    depth = manifest.depth
    updatedAt = manifest.updatedAt ?? null
  } else {
    // Fallback: scan filesystem, derive depth from config
    artifacts = await scanFilesystem(strategyPath)

    // Try to derive depth from config
    try {
      const configPath = await resolveDebussyPath('.debussy', 'config.yaml')
      const { parse: parseYaml } = await import('yaml')
      const raw = await readFile(configPath, 'utf8')
      const config = parseYaml(raw)
      if (config?.strates?.strategy) {
        depth = resolveStrategyDepth(config.strates.strategy)
        // Mark expected based on STRATEGY_DEPTH_DOCUMENTS
        const expectedDocs = STRATEGY_DEPTH_DOCUMENTS[depth] ?? []
        for (const artifact of artifacts) {
          artifact.expected =
            expectedDocs.includes(artifact.key) ||
            artifact.key.startsWith('competitors/') ||
            artifact.key.startsWith('allies/')
        }
      }
    } catch {
      // No config — all artifacts shown as-is
    }
  }

  const expectedArtifacts = artifacts.filter((a) => a.expected)
  const progress = {
    expected: expectedArtifacts.length,
    present: expectedArtifacts.filter((a) => a.presence === 'present').length,
    reviewed: expectedArtifacts.filter((a) => a.status === 'reviewed').length,
  }

  return { depth, updatedAt, artifacts, progress }
})
