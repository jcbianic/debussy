/**
 * Manage a set of expanded/collapsed IDs with reactive state.
 * @param initialIds - IDs that start in the expanded state.
 * @returns `expanded` — reactive Set; `toggle(id)` — flip one entry; `has(id)` — membership check.
 */
export function useExpandable(initialIds: string[]) {
  const expanded = ref(new Set(initialIds))

  const toggle = (id: string) => {
    if (expanded.value.has(id)) expanded.value.delete(id)
    else expanded.value.add(id)
    expanded.value = new Set(expanded.value)
  }

  const has = (id: string) => expanded.value.has(id)

  return { expanded, toggle, has }
}
