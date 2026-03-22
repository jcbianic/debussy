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
  sections: ArtifactSection[]
}
