export interface PolicyItem {
  rule: string
  note?: string
}

export interface PolicySection {
  title: string
  items?: PolicyItem[]
  content?: string[]
}

export interface PolicyTopic {
  key: string
  name: string
  description: string
  icon: string
  file?: string
  status?: string
  order?: number
  sections: PolicySection[]
}

/**
 *
 */
export const usePolicy = () => {
  const { data: topics } = useFetch<PolicyTopic[]>('/api/policies', {
    default: () => [],
  })

  const selected = ref('')

  // Auto-select first topic when data loads
  watch(
    topics,
    (val) => {
      if (val.length > 0 && !selected.value) {
        selected.value = val[0]!.key
      }
    },
    { immediate: true }
  )

  const currentTopic = computed(() =>
    topics.value.find((t) => t.key === selected.value)
  )

  return { topics, selected, currentTopic }
}
