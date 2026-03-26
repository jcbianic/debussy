/** A subsection of a strategy artifact with a title and paragraph content. */
export interface ArtifactSection {
  title: string
  content: string[]
}

/** A strategy artifact served from /api/strategy. */
export interface Artifact {
  key: string
  name: string
  file: string
  icon: string
  status: 'reviewed' | 'draft'
  presence: 'present' | 'missing'
  expected: boolean
  sections: ArtifactSection[]
}

/** Wrapper returned by GET /api/strategy when manifest support is active. */
export interface StrategyResponse {
  depth: import('~/types/config').StrategyDepth | null
  updatedAt: string | null
  artifacts: Artifact[]
  progress: { expected: number; present: number; reviewed: number }
}
