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
