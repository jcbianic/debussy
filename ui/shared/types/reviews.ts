export interface Feedback {
  decision: 'approved' | 'changes-requested' | 'rejected'
  comment?: string
  decidedAt: string
}

export interface Iteration {
  number: number
  proposedAt: string
  content: string
  code?: string
  feedback?: Feedback
}

export interface Item {
  id: string
  title: string
  subtitle: string
  iterations: Iteration[]
}

export interface Review {
  id: string
  title: string
  icon: string
  source: string
  type: string
  createdAt: string
  items: Item[]
}

export type ItemStatus =
  | 'pending'
  | 'approved'
  | 'changes-requested'
  | 'rejected'

export function itemStatus(item: Item): ItemStatus {
  const last = item.iterations.at(-1)
  return last?.feedback?.decision ?? 'pending'
}
