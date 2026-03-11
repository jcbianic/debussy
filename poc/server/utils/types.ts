export type PhaseId =
  | 'constitution'
  | 'spec'
  | 'plan'
  | 'checklist'
  | 'testify'
  | 'tasks'
  | 'analyze'
  | 'implement'

export type PhaseStatus = 'not_started' | 'in_progress' | 'complete' | 'skipped'

export interface Feature {
  id: string
  name: string
}

export interface Phase {
  id: PhaseId
  name: string
  status: PhaseStatus
  progress: number | null
  optional: boolean
}

export interface FeaturesResponse {
  features: Feature[]
}

export interface PhasesResponse {
  feature: string
  phases: Phase[]
}

export interface ErrorResponse {
  error: string
}
