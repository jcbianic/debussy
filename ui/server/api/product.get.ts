import { readFile } from 'node:fs/promises'
import matter from 'gray-matter'
import path from 'node:path'

interface ProductSection {
  title: string
  content: string[]
}

interface ProductArtifact {
  key: string
  name: string
  file: string
  icon: string
  status: 'draft' | 'reviewed'
  presence: 'present' | 'missing'
  sections: ProductSection[]
}

export interface ProductResponse {
  artifacts: ProductArtifact[]
  progress: { expected: number; present: number; reviewed: number }
}

function parseSections(content: string): ProductSection[] {
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

const EXPECTED_ARTIFACTS: { key: string; icon: string }[] = [
  { key: 'product', icon: 'i-heroicons-cube' },
  { key: 'intents', icon: 'i-heroicons-flag' },
]

async function readArtifact(
  productPath: string,
  key: string,
  defaultIcon: string
): Promise<ProductArtifact> {
  const filePath = path.join(productPath, `${key}.md`)
  try {
    const raw = await readFile(filePath, 'utf8')
    const { data, content } = matter(raw)
    return {
      key,
      name: (data.name as string) ?? titleCase(key),
      file: `.debussy/product/${key}.md`,
      icon: (data.icon as string) ?? defaultIcon,
      status: (data.status as 'draft' | 'reviewed') ?? 'draft',
      presence: 'present',
      sections: parseSections(content),
    }
  } catch {
    return {
      key,
      name: titleCase(key),
      file: `.debussy/product/${key}.md`,
      icon: defaultIcon,
      status: 'draft',
      presence: 'missing',
      sections: [],
    }
  }
}

export default defineEventHandler(async (): Promise<ProductResponse> => {
  const productPath = await resolveDebussyPath('.debussy', 'product')

  const artifacts = await Promise.all(
    EXPECTED_ARTIFACTS.map((a) => readArtifact(productPath, a.key, a.icon))
  )

  const present = artifacts.filter((a) => a.presence === 'present').length
  const reviewed = artifacts.filter((a) => a.status === 'reviewed').length

  return {
    artifacts,
    progress: {
      expected: EXPECTED_ARTIFACTS.length,
      present,
      reviewed,
    },
  }
})
