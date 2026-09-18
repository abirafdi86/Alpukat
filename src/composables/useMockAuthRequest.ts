import { onBeforeUnmount, ref } from 'vue'

export function useMockAuthRequest() {
  const loading = ref(false)
  const error = ref('')
  let controller: AbortController | undefined

  async function run<T>(request: (signal: AbortSignal) => Promise<T>, onSuccess: (value: T) => void | Promise<void>) {
    if (loading.value) return
    const current = new AbortController()
    controller = current
    loading.value = true
    error.value = ''
    try {
      const result = await request(current.signal)
      if (!current.signal.aborted) await onSuccess(result)
    } catch (cause) {
      if (!current.signal.aborted) error.value = cause instanceof Error ? cause.message : 'Something went wrong. Please try again.'
    } finally {
      if (controller === current) loading.value = false
    }
  }
  function cancel() { controller?.abort(); loading.value = false }
  onBeforeUnmount(cancel)
  return { loading, error, run, cancel }
}
