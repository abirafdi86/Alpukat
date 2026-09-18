import { computed, ref, watch, type ComputedRef } from 'vue'

export function usePagination<T>(items: ComputedRef<T[]>, defaultPageSize = 10) {
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize.value)))
  const paginatedItems = computed(() => items.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
  const rowNumber = (index: number) => (page.value - 1) * pageSize.value + index + 1

  watch(items, () => { page.value = 1 })
  watch(totalPages, (value) => { if (page.value > value) page.value = value })

  return { page, pageSize, paginatedItems, rowNumber }
}
