/**
 * Map a review-item status to its Nuxt UI badge color token.
 * @param s - `'approved'` → `'success'`, `'rejected'` → `'error'`, anything else → `'warning'`.
 */
export const statusColor = (s: string): 'success' | 'warning' | 'error' => {
  if (s === 'approved') return 'success'
  if (s === 'rejected') return 'error'
  return 'warning'
}

/**
 * Map an intent/release state to its Heroicons icon name.
 */
export const stateIcon = (s: string): string => {
  if (s === 'done') return 'i-heroicons-check-circle'
  if (s === 'in-progress') return 'i-heroicons-arrow-path'
  if (s === 'open') return 'i-heroicons-ellipsis-horizontal-circle'
  return 'i-heroicons-minus-circle'
}

/**
 * Map an intent/release state to its Tailwind text-color class.
 */
export const stateIconColor = (s: string): string => {
  if (s === 'done') return 'text-green-500'
  if (s === 'in-progress') return 'text-blue-500'
  if (s === 'open') return 'text-neutral-400'
  return 'text-content-ghost'
}

/**
 * Map an ADR status string to its Nuxt UI badge color token.
 * @param s - `'Accepted'` → `'success'`, `'Proposed'` → `'warning'`, anything else → `'neutral'`.
 */
export const adrStatusColor = (
  s: string
): 'success' | 'warning' | 'neutral' => {
  if (s === 'Accepted') return 'success'
  if (s === 'Proposed') return 'warning'
  return 'neutral'
}
