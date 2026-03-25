export interface Round {
  roundNumber: number
  proposedAt: string
  content: string
  code?: string
  feedback?: string
  feedbackAt?: string
  feedbackStatus?: 'approved' | 'changes-requested' | 'rejected'
}

export interface ReviewItem {
  id: string
  title: string
  subtitle: string
  status: 'pending' | 'approved' | 'rejected'
  type: 'feedback' | 'code-review' | 'workflow'
  createdAt: string
  rounds: Round[]
}

export interface ReviewGroup {
  id: string
  title: string
  icon: string
  source: string
  type: string
  items: ReviewItem[]
}

export interface Lane {
  id: string
  branch: string
  path: string
  isActive: boolean
  intent?: string
  groups: ReviewGroup[]
}

export interface WorkflowStep {
  name: string
  state: 'done' | 'running' | 'waiting' | 'pending'
  detail?: string
  duration?: string
}

export interface WorkflowRun {
  file: string
  status: string
  currentStep: number
  totalSteps: number
  elapsed: string
  startedAt: string
  steps: WorkflowStep[]
}

export interface Commit {
  hash: string
  message: string
  author: string
  date: string
  pr?: string
}

export interface ReviewDetail {
  id: string
  title: string
  source: string
  status: 'pending' | 'approved' | 'rejected'
  body: string
  code: string | null
}
