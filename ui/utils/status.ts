export const statusColor = (s: string): 'success' | 'warning' | 'error' => {
  if (s === 'approved') return 'success'
  if (s === 'rejected') return 'error'
  return 'warning'
}
